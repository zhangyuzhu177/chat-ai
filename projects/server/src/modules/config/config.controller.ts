import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";

import { SysConfig } from "src/dto";
import { IsLogin } from "src/guards";
import { SysConfigService } from "./config.service";
import { UpsertConfigBodyDto } from "./dto/upsert-config.body.dto";
import { Config } from "src/entities";
import { rsaDecrypt, rsaEncrypt } from "src/utils";

@Controller('config')
export class ConfigController {
  constructor(
    private readonly _sysCfgSrv: SysConfigService
  ) { }
  
  @Get(':version')
  public getConfig(@Param('version') version: SysConfig) {
    return this._sysCfgSrv.getConfig(version);
  }

  @Post()
  // @IsLogin()
  public async upsertConfig(
    @Body() body: UpsertConfigBodyDto,
  ) {
    try {
      const { version, ...config } = body
    const obj: Config = {
      version,
      config: config[version],
    }

    await this._sysCfgSrv.repo().save(obj)

    return 'ok'
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: '更新系统配置失败',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}