import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'acueducto-secret-key-2025',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, DatabaseService],
  exports: [AuthService],
})
export class AuthModule {}