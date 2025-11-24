import { IsEnum, IsObject } from "class-validator";
import { ConfigDto, SysConfig } from "src/dto";


export class UpsertConfigBodyDto {

  @IsEnum(SysConfig)
  version: SysConfig;

  @IsObject()
  sdk?: ConfigDto[SysConfig.SDK]
}
