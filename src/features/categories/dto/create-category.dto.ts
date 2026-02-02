import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsString } from 'class-validator';

@ApiSchema({ description: 'Data Transfer Object pour créer une catégorie' })
export class CreateCategoryDto {
  @IsString({ message: 'Le nom est obligatoire' })
  @ApiProperty()
  name: string;
  @ApiProperty()
  slug: string;
  @ApiPropertyOptional()
  image: string;

  @ApiPropertyOptional()
  description: string;

  @ApiPropertyOptional()
  order: number;
}
