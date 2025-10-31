import { Controller, Get, Req } from "@nestjs/common";
import { UserService } from "./user.service";
import { IsLogin } from "src/guards";

@Controller('user')
export class UserController {
  constructor(
    private readonly _userSrv: UserService,
  ) { }

  @Get('/own/profile')
  @IsLogin()
  getOwnProfile(
    @Req() req: FastifyRequest,
  ) { 
    const id = req.user?.id || ''

    return this._userSrv.getOwnProfile(id)
  }
}