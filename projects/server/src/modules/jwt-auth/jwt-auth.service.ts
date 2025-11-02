import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common'

import { objectPick } from 'src/utils'
import type { User } from 'src/entities/user'

import { RedisService } from '../redis/redis.service'

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly _jwtSrv: JwtService,
    private readonly _cfgSrv: ConfigService,
    private readonly _redisSrv: RedisService,
  ) { }

  /**
   * 根据用户签发登录成功的授权token
   */
  public async signLoginAuthToken(user: Partial<User>, ip?: string) {
    const expiresIn = this._cfgSrv.get<number>('jwt.loginAuthExpireInSeconds')!
    const secret = this._cfgSrv.get<string>('jwt.loginAuthSecret')
    const signObj = {
      ...objectPick(user, 'id', 'account', 'email'),
      ip,
      timestamp: Date.now(),
    }
    const access_token = this._jwtSrv.sign(signObj, { secret, expiresIn })
    const client = this._redisSrv.getClient(RedisType.AUTH_JWT)!
    client.setEx(access_token, expiresIn, `${expiresIn}`)

    return {
      sign: {
        access_token,
        expireAt: Date.now() + expiresIn,
      },
      user: user,
    }
  }

  /**
   * 校验签发的用户授权 token
   */
  public async validateLoginAuthToken(token: string) {
    // 1. 检查 redis
    try {
      const client = this._redisSrv.getClient(RedisType.AUTH_JWT)!
      const exists = await client.exists(token)
      if (!exists)
        return
    }
    catch (e) {
      return
    }

    // 2. 检查 token 是否有效
    return this._jwtSrv.verifyAsync(token, {
      secret: this._cfgSrv.get<string>('jwt.loginAuthSecret'),
    })
  }

  /**
   * 删除指定的token
   */
  public async destroyLoginAuthToken(token: string) {
    const client = this._redisSrv.getClient(RedisType.AUTH_JWT)!
    try {
      const exists = await client.exists(token)
      
      if (!exists)
        throw new Error('AccessToken not exists in cache')
    }
    catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: '登录过期',
        },
        HttpStatus.FORBIDDEN,
      )
    }
    await client.del(token)
    return true
  }
}
