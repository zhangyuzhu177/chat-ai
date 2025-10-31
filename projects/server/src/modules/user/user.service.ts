import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { User } from "src/entities/user";

@Injectable()
export class UserService { 
    constructor(
    @InjectRepository(User)
    private readonly _userRepo: Repository<User>,

    private readonly _cfgSrv: ConfigService,
  ) { }

  /**
   * 创建用户
   */
  public async createUser(user: Partial<User>) {
    try {
      const res = await this._userRepo.insert(user);
      return res.identifiers;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '创建用户失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * 获取当前登录用户
   */
  public async getOwnProfile(id: string) {
    return await this._userRepo.findOneBy({id})
  }

  public repo() {
    return this._userRepo;
  }

  public qb(alias = 'u') {
    return this._userRepo.createQueryBuilder(alias)
  }
}