import { Controller, Get, Post, Query, Req, Res } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { Response } from 'express'; 

@Controller('auth')
export class AuthController {
  constructor(private readonly _authSrv: AuthService) { }

  @Get('/login')
  getAuthRedirect(@Res() res: Response) {
    return res.redirect('https://github.com/login/oauth/authorize?client_id=Iv23liKibAIzXlVKY2it')
  }

  @Get('/github/login')
  getAuthToken(
    @Query() query: { code: string },
    @Res() res: Response
  ) {
    return this._authSrv.loginAuth(query.code, res);
  }

  @Post('logout')
  public async logout(
    @Req() req: FastifyRequest,
    @Res() res: Response
  ) {
    console.log(req.token);
    
    res.clearCookie('token')
    return this._authSrv.logout(req.token!)
  }
}