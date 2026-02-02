// pagination.dto.ts
import { IsIn, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
@ApiSchema({ description: 'Description of the CreateCatDto schema' })
export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filters?: string;
}
