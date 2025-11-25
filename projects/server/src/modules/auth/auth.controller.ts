import { Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from 'express';

import { AuthService } from "./auth.service";
import { JwtAuthService } from "../jwt-auth/jwt-auth.service";
import { IsLogin } from "src/guards";
import { ConfigService } from "@nestjs/config";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly _authSrv: AuthService,
    private readonly _jwtAuthSrv: JwtAuthService,
    private readonly _cfgSrv: ConfigService,
  ) { }

  @Get('/login')
  getAuthRedirect(@Res() res: Response) {
    const clientId = this._cfgSrv.get('CLIENT_ID');
    return res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}`)
  }

  @Get('/github/login')
  getAuthToken(
    @Query() query: { code: string },
    @Res() res: Response
  ) {
    return this._authSrv.loginAuth(query.code, res);
  }

  @Post('logout')
  @IsLogin()
  public async logout(
    @Req() req: Request,
    @Res() res: Response
  ) {
    await this._jwtAuthSrv.destroyLoginAuthToken(req.token!)
    res.clearCookie('token')
    return res.status(200).json({
      status: 0,
      message: 'success',
      data: null
    })
  }

  @Get('test')
  public async test() {
    return 'test'
  }
}