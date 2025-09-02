import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('🔍 VALIDATING USER');
    console.log('Searching for email:', email);
    
    const user = await this.databaseService.findUserByEmail(email);
    
    console.log('👤 User found:', !!user);
    if (user) {
      console.log('📋 User data:', { id: user.id, email: user.email, role: user.role });
      console.log('🔐 Stored password hash:', user.password);
      console.log('🔑 Input password:', password);
    }

    if (user && await bcrypt.compare(password, user.password)) {
      console.log('✅ Password valid for:', email);
      const { password, ...result } = user;
      return result;
    }
    
    console.log('❌ Password invalid for:', email);
    return null;
  }

  async login(user: any, req: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}