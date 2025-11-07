import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ModelService } from './model.service';
import { CreateModelDto, UpdateModelDto } from './dto';
import { IsLogin } from 'src/guards';

@Controller('model')
export class ModelController {
  constructor(private readonly _modelSrv: ModelService) {}

  /**
   * 获取所有启用的模型（公开接口）
   */
  @Get('active')
  getActiveModels() {
    return this._modelSrv.getActiveModels();
  }

  /**
   * 获取所有模型（管理员接口）
   */
  @Get()
  @IsLogin()
  getAllModels() {
    return this._modelSrv.getAllModels();
  }

  /**
   * 获取单个模型
   */
  @Get(':id')
  @IsLogin()
  getModelById(@Param('id') id: string) {
    return this._modelSrv.getModelById(id);
  }

  /**
   * 创建模型（管理员接口）
   */
  @Post()
  @IsLogin()
  createModel(@Body() dto: CreateModelDto) {
    return this._modelSrv.createModel(dto);
  }

  /**
   * 更新模型（管理员接口）
   */
  @Put(':id')
  @IsLogin()
  updateModel(@Param('id') id: string, @Body() dto: UpdateModelDto) {
    return this._modelSrv.updateModel(id, dto);
  }

  /**
   * 删除模型（管理员接口）
   */
  @Delete(':id')
  @IsLogin()
  deleteModel(@Param('id') id: string) {
    return this._modelSrv.deleteModel(id);
  }
}
