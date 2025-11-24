import { SysConfig, ConfigDto } from "src/dto"
import { Column, Entity, PrimaryColumn } from "typeorm"

@Entity()
export class Config {
  @PrimaryColumn({
    type: 'enum',
    enum: SysConfig,
  })
  version: SysConfig

  @Column({
    type: 'json',
    nullable: true,
  })
  config?: ConfigDto[SysConfig]
}