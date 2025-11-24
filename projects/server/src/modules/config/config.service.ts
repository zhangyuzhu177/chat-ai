import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Config } from "src/entities";
import { ConfigDto, SysConfig } from "src/dto";


@Injectable()
export class SysConfigService {
  constructor(
    @InjectRepository(Config)
    private readonly _sysCfgRepo: Repository<Config>
  ) { }
  
  /**
   * 获取指定系统配置
   */
  public async getConfig<T extends SysConfig>(version: SysConfig) {
    return (await this._sysCfgRepo.findOne({
      where: { version: version },
    }))?.config as ConfigDto[T]
  }

  repo() {
    return this._sysCfgRepo
  }
}