import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { PageVersionsService } from './page-versions.service';

@Controller('page-versions')
export class PageVersionsController {
  constructor(private pageVersionsService: PageVersionsService) {}

  @Post('create-originals')
  async createOriginalVersions() {
    return this.pageVersionsService.createOriginalVersions();
  }

  @Post('page/:pageId/original')
  async createOriginalVersion(@Param('pageId', ParseIntPipe) pageId: number) {
    return this.pageVersionsService.createOriginalVersion(pageId);
  }

  @Post('page/:pageId')
  async createVersion(
    @Param('pageId', ParseIntPipe) pageId: number,
    @Body() body: { description?: string }
  ) {
    return this.pageVersionsService.createVersion(pageId, body.description);
  }

  @Get('page/:pageId')
  async getVersionsByPageId(@Param('pageId', ParseIntPipe) pageId: number) {
    return this.pageVersionsService.getVersionsByPageId(pageId);
  }

  @Get()
  async getAllVersions() {
    return this.pageVersionsService.getAllVersions();
  }

  @Put(':versionId/restore')
  async restoreVersion(@Param('versionId', ParseIntPipe) versionId: number) {
    return this.pageVersionsService.restoreVersion(versionId);
  }

  @Put(':versionId/set-original')
  async setAsOriginal(@Param('versionId', ParseIntPipe) versionId: number) {
    return this.pageVersionsService.setAsOriginal(versionId);
  }

  @Delete(':versionId')
  async deleteVersion(@Param('versionId', ParseIntPipe) versionId: number) {
    return this.pageVersionsService.deleteVersion(versionId);
  }
}