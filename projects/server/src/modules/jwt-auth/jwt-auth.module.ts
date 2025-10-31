import { JwtModule, JwtService } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Global, Module, forwardRef } from '@nestjs/common'

import { JwtAuthService } from './jwt-auth.service'

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (_: ConfigService) => {
        return {}
      },
    }),

  ],
  providers: [
    JwtAuthService,
    JwtService,
  ],
  exports: [
    JwtAuthService,
  ],
})

export class JwtAuthModule {}
