import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Model } from 'src/entities';
import { CreateModelDto, UpdateModelDto } from './dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(Model)
    private readonly _modelRepo: Repository<Model>,

    private readonly _userService: UserService
  ) {}

  /**
   * 创建模型
   */
  async createModel(dto: CreateModelDto) {
    try {
      const model = this._modelRepo.create(dto);
      return await this._modelRepo.save(model);
    } catch (error) {
      console.log(error);
      
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '创建模型失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取所有启用的模型列表
   */
  async getActiveModels() {
    return await this._modelRepo.find({
      where: {
        isActive: true
      },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取所有模型列表（包含禁用的）
   */
  async getAllModels() {

    return await this._modelRepo.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 根据 ID 获取模型
   */
  async getModelById(id: string) {
    const model = await this._modelRepo.findOneBy({ id });
    if (!model) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: '模型不存在',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return model;
  }

  /**
   * 根据名称获取模型
   */
  async getModelByName(name: string) {
    return await this._modelRepo.findOneBy({ name });
  }

  /**
   * 更新模型
   */
  async updateModel(id: string, dto: UpdateModelDto) {
    const model = await this.getModelById(id);
    try {
      Object.assign(model, dto);
      return await this._modelRepo.save(model);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '更新模型失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 删除模型
   */
  async deleteModel(id: string) {
    const model = await this.getModelById(id);
    try {
      await this._modelRepo.delete(id);
      return { message: '删除成功' };
    } catch (error) {
      console.log(error);
      
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '删除模型失败',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取 Repository（供其他服务使用）
   */
  repo() {
    return this._modelRepo;
  }
}
