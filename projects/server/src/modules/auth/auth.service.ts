import type { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import { User } from 'src/entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly _httpSrv: HttpService,
    private readonly _cfgSrv: ConfigService,
    private readonly _userSrv: UserService,
    private readonly _jwtAuthSrv: JwtAuthService,
  ) {}

  /**
   * 登录 自动注册
   */
  public async loginAuth(code: string, res: Response) {
      const client_id = this._cfgSrv.get('CLIENT_ID');
      const client_secret = this._cfgSrv.get('CLIENT_SECRET');

    try {
      // 获取 access_token
      const result = await this._httpSrv.axiosRef({
        method: 'post',
        url: `https://github.com/login/oauth/access_token`,
        params: {
          client_id,
          client_secret,
          code,
        },
      });
      const params = new URLSearchParams(result.data);
      const accessToken = params.get('access_token');
      if (!accessToken) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            message: '获取access_token失败',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // 获取用户信息
      const userInfo = await this._httpSrv.axiosRef({
        method: 'get',
        url: `https://api.github.com/user`,
        headers: {
          accept: 'application/json',
          Authorization: `token ${accessToken}`,
        },
      });

      if (!userInfo) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            message: '获取用户信息失败',
          },
          HttpStatus.FORBIDDEN,
        );
      }
        
      
      const body: Partial<User> = {
        account: userInfo.data.login,
        name: userInfo.data.name,
        avatar: userInfo.data.avatar_url,
        email: userInfo.data.email
      }

      // 检查用户是否存在，不存在则创建
      const user = await this._userSrv.repo().findOne({
        where: {
          account: body.account,
        }
      })
      
      if (!user)
        await this._userSrv.createUser({
          ...body,
          status: true,
        });

      const token = await this._jwtAuthSrv.signLoginAuthToken(body);

      res.cookie('token', token.sign.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge:token.sign.expireAt,
      })

      return res.redirect(`http://localhost:3000`);
    } catch (error) {
      console.log(error);

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '登录失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      return res.redirect(`http://localhost:3000/auth`);
    }
  }

  /**
   * 退出登录
   */
  public async logout(token: string) {
    await this._jwtAuthSrv.destroyLoginAuthToken(token)
    return true
  }
}
