import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Le code est obligatoire' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType, { message: 'Type de coupon invalide (PERCENT ou FIXED)' })
  type!: CouponType;

  @ApiProperty({ example: 10 })
  value!: number;

  @ApiPropertyOptional()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Date de début (ISO)' })
  @IsOptional()
  startsAt?: string;

  @ApiPropertyOptional({ description: 'Date de fin (ISO)' })
  @IsOptional()
  endsAt?: string;

  @ApiPropertyOptional({ default: 0, description: '0 = illimité' })
  @IsOptional()
  maxUsage?: number;

  @ApiPropertyOptional({ default: 0, description: 'Montant HT minimum' })
  @IsOptional()
  minAmount?: number;
}
