import { IsString, IsOptional, IsJSON, IsEnum, IsNumber, IsObject } from 'class-validator';
import { PageStatus } from '../pages.service';

export class CreatePageDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsJSON()
  draft_json?: string;

  @IsOptional()
  @IsJSON()
  published_json?: string;

  @IsOptional()
  @IsString()
  craftData?: string;

  @IsEnum(PageStatus)
  status: PageStatus;

  @IsOptional()
  @IsNumber()
  version?: number;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsJSON()
  draft_json?: string;

  @IsOptional()
  @IsJSON()
  published_json?: string;

  @IsOptional()
  @IsString()
  craftData?: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @IsOptional()
  @IsNumber()
  version?: number;
}