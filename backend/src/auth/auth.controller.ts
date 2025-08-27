import { Controller, Post, Body, UnauthorizedException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    console.log('🔐 LOGIN ATTEMPT RECEIVED');
    console.log('Email:', loginDto.email);
    console.log('Password length:', loginDto.password?.length);
    console.log('Full body:', loginDto);
    
    console.log('Login attempt:', loginDto.email);
    
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      console.log('Invalid credentials for:', loginDto.email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('Login successful for:', user.email);
    return this.authService.login(user, req);
  }
}