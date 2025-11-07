import type { Request } from 'express';
import { Controller, Get, Req } from "@nestjs/common";

import { IsLogin } from "src/guards";
import { UserService } from "./user.service";

@Controller('user')
export class UserController {
  constructor(
    private readonly _userSrv: UserService,
  ) { }

  @Get('/own/profile')
  @IsLogin()
  getOwnProfile(
    @Req() req: Request,
  ) { 
    const id = req.user?.id || ''
    return this._userSrv.getOwnProfile(id)
  }
}