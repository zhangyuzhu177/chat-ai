import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { JwtAuthModule } from '../jwt-auth/jwt-auth.module';

@Module({
  imports: [
    HttpModule,
    UserModule,
    JwtAuthModule
  ],
  controllers: [ AuthController ],
  providers: [ AuthService ],
  exports: [ AuthService ],
})
export class AuthModule {}
