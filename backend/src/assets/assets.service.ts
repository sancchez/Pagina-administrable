import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: DatabaseService) {}

  async create(data: CreateAssetDto) {
    return this.prisma.asset.create({ data });
  }

  async findAll() {
    return this.prisma.asset.findMany();
  }

  async findOne(id: number) {
    return this.prisma.asset.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateAssetDto) {
    return this.prisma.asset.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.asset.delete({ where: { id } });
  }
}