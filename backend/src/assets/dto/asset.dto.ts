import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUrl } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @IsString()
  @IsNotEmpty()
  mime: string;

  @IsNumber()
  @IsNotEmpty()
  size: number;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  altText?: string;
}

export class UpdateAssetDto {
  @IsString()
  @IsOptional()
  filename?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  altText?: string;
}