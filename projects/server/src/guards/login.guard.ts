import { Reflector } from '@nestjs/core';
import {Request, Response} from 'express'
import { applyDecorators, CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UseGuards } from '@nestjs/common';
import { getReflectorValue } from 'src/utils';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    public readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest()
    const res: Response = context.switchToHttp().getResponse()

    const loginRequired = getReflectorValue<boolean>(
      this.reflector,
      context,
      'loginRequired',
      true,
    )

    const user = req.user
    if (!user && loginRequired) {
      res.clearCookie('token')
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: '登录过期',
        },
        HttpStatus.FORBIDDEN,
      )
    }
      
    
    return !!req.user
  }
}

/**
 * 判断用户是否登录的守卫
 */
export function IsLogin() {
  return applyDecorators(
    UseGuards(LoginGuard),
  )
}