import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

interface Cursor {
  userId: string;
  x: number;
  y: number;
  user: User;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  },
  path: '/ws',
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);

  constructor(private readonly collaborationService: CollaborationService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Enviar confirmación de conexión
    client.emit('connected', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remover usuario de todas las páginas
    await this.collaborationService.removeUserFromAllPages(client.id);
    
    // Notificar a otros usuarios sobre la desconexión
    client.broadcast.emit('user_disconnected', {
      userId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('join_page')
  async handleJoinPage(
    @MessageBody() data: { pageId: string; user: User },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`User ${data.user.id} joining page ${data.pageId}`);
    
    try {
      // Unirse a la sala de la página
      await client.join(`page_${data.pageId}`);
      
      // Registrar usuario en el servicio
      await this.collaborationService.addUserToPage(data.pageId, {
        ...data.user,
        socketId: client.id,
        connectedAt: new Date(),
      });
      
      // Obtener usuarios activos en la página
      const activeUsers = await this.collaborationService.getActiveUsers(data.pageId);
      
      // Notificar a otros usuarios sobre la nueva conexión
      client.to(`page_${data.pageId}`).emit('user_joined', {
        user: data.user,
        timestamp: new Date().toISOString(),
      });
      
      // Enviar lista de usuarios activos al cliente que se conecta
      client.emit('active_users', {
        users: activeUsers,
        timestamp: new Date().toISOString(),
      });
      
      // Confirmar conexión exitosa
      client.emit('page_joined', {
        pageId: data.pageId,
        success: true,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error joining page: ${error.message}`);
      client.emit('error', {
        message: 'Failed to join page',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('leave_page')
  async handleLeavePage(
    @MessageBody() data: { pageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Client ${client.id} leaving page ${data.pageId}`);
    
    try {
      // Salir de la sala de la página
      await client.leave(`page_${data.pageId}`);
      
      // Remover usuario del servicio
      await this.collaborationService.removeUserFromPage(data.pageId, client.id);
      
      // Notificar a otros usuarios
      client.to(`page_${data.pageId}`).emit('user_left', {
        userId: client.id,
        timestamp: new Date().toISOString(),
      });
      
      client.emit('page_left', {
        pageId: data.pageId,
        success: true,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error leaving page: ${error.message}`);
      client.emit('error', {
        message: 'Failed to leave page',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('cursor_update')
  async handleCursorUpdate(
    @MessageBody() data: { pageId: string; x: number; y: number; user: User },
    @ConnectedSocket() client: Socket,
  ) {
    // Retransmitir actualización de cursor a otros usuarios en la página
    client.to(`page_${data.pageId}`).emit('cursor_moved', {
      userId: data.user.id,
      x: data.x,
      y: data.y,
      user: data.user,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('content_update')
  async handleContentUpdate(
    @MessageBody() data: { pageId: string; content: any; user: User },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Content update for page ${data.pageId} by user ${data.user.id}`);
    
    try {
      // Retransmitir actualización de contenido a otros usuarios
      client.to(`page_${data.pageId}`).emit('content_changed', {
        content: data.content,
        userId: data.user.id,
        user: data.user,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error updating content: ${error.message}`);
      client.emit('error', {
        message: 'Failed to update content',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { pageId: string; message: string; user: User },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message from user ${data.user.id} in page ${data.pageId}`);
    
    // Retransmitir mensaje a todos los usuarios en la página
    this.server.to(`page_${data.pageId}`).emit('message_received', {
      message: data.message,
      user: data.user,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }
}