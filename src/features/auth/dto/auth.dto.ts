import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

@ApiSchema({ description: 'Description of the RegisterDto schema' })
export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email est obligatoire' })
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(254)
  email: string;
  @ApiProperty()
  @IsNotEmpty({ message: 'Mot de passe est obligatoire' })
  @IsString()
  password: string;
  @ApiProperty()
  @IsNotEmpty({ message: 'Prénom est obligatoire' })
  @IsString()
  @MaxLength(100)
  firstName: string;
  @ApiProperty()
  @IsNotEmpty({ message: 'Nom est obligatoire' })
  @IsString()
  @MaxLength(100)
  lastName: string;
}
@ApiSchema({ description: 'Description of the LoginDto schema' })
export class LoginDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(254)
  email: string;
  @ApiProperty()
  @IsString()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty({ message: 'Email est obligatoire' })
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(254)
  email: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'NewPassword@123' })
  @IsNotEmpty({ message: 'Mot de passe est obligatoire' })
  @IsString()
  password: string;
}
