import { Injectable, Logger } from '@nestjs/common';

interface ConnectedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  socketId: string;
  connectedAt: Date;
}

interface PageUsers {
  [pageId: string]: Map<string, ConnectedUser>;
}

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);
  private pageUsers: PageUsers = {};

  async addUserToPage(pageId: string, user: ConnectedUser): Promise<void> {
    if (!this.pageUsers[pageId]) {
      this.pageUsers[pageId] = new Map();
    }

    this.pageUsers[pageId].set(user.socketId, {
      ...user,
      connectedAt: new Date(),
    });

    this.logger.log(`User ${user.id} added to page ${pageId}. Total users: ${this.pageUsers[pageId].size}`);
  }

  async removeUserFromPage(pageId: string, socketId: string): Promise<void> {
    if (this.pageUsers[pageId]) {
      const user = this.pageUsers[pageId].get(socketId);
      this.pageUsers[pageId].delete(socketId);
      
      if (this.pageUsers[pageId].size === 0) {
        delete this.pageUsers[pageId];
      }

      if (user) {
        this.logger.log(`User ${user.id} removed from page ${pageId}`);
      }
    }
  }

  async removeUserFromAllPages(socketId: string): Promise<void> {
    for (const pageId in this.pageUsers) {
      await this.removeUserFromPage(pageId, socketId);
    }
  }

  async getActiveUsers(pageId: string): Promise<ConnectedUser[]> {
    if (!this.pageUsers[pageId]) {
      return [];
    }

    return Array.from(this.pageUsers[pageId].values());
  }

  async getAllActiveUsers(): Promise<{ [pageId: string]: ConnectedUser[] }> {
    const result: { [pageId: string]: ConnectedUser[] } = {};
    
    for (const pageId in this.pageUsers) {
      result[pageId] = Array.from(this.pageUsers[pageId].values());
    }

    return result;
  }

  async getPageStats(pageId: string): Promise<{
    totalUsers: number;
    users: ConnectedUser[];
    pageId: string;
  }> {
    const users = await this.getActiveUsers(pageId);
    
    return {
      pageId,
      totalUsers: users.length,
      users,
    };
  }

  async getGlobalStats(): Promise<{
    totalPages: number;
    totalUsers: number;
    pages: { [pageId: string]: number };
  }> {
    const totalPages = Object.keys(this.pageUsers).length;
    let totalUsers = 0;
    const pages: { [pageId: string]: number } = {};

    for (const pageId in this.pageUsers) {
      const userCount = this.pageUsers[pageId].size;
      pages[pageId] = userCount;
      totalUsers += userCount;
    }

    return {
      totalPages,
      totalUsers,
      pages,
    };
  }

  async isUserConnectedToPage(pageId: string, socketId: string): Promise<boolean> {
    return this.pageUsers[pageId]?.has(socketId) || false;
  }

  async getUserBySocketId(socketId: string): Promise<ConnectedUser | null> {
    for (const pageId in this.pageUsers) {
      const user = this.pageUsers[pageId].get(socketId);
      if (user) {
        return user;
      }
    }
    return null;
  }

  async cleanupInactiveUsers(): Promise<void> {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutos

    for (const pageId in this.pageUsers) {
      const usersToRemove: string[] = [];
      
      for (const [socketId, user] of this.pageUsers[pageId]) {
        if (now.getTime() - user.connectedAt.getTime() > inactiveThreshold) {
          usersToRemove.push(socketId);
        }
      }

      for (const socketId of usersToRemove) {
        await this.removeUserFromPage(pageId, socketId);
        this.logger.log(`Removed inactive user with socket ${socketId} from page ${pageId}`);
      }
    }
  }
}