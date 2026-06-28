import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseGuards,
  ValidationPipe,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorators';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from '../users/entities/user.entity';
import { FormDataTransformPipe } from 'src/shared/pipes/formdata-transform.pipe';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Allow2FAPending } from 'src/shared/decorators/allow-2fa-pending.decorator';
import { ApiResponse } from 'src/shared/responses/api-response';
// Durée de vie du cookie JWT (7 jours, en ms).
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/** Pose le cookie httpOnly accessToken sur la réponse. */
function setAuthCookie(res: any, token: string): void {
  const prod = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: prod,
    // cynaapi.vercel.app et cynaapp.vercel.app sont cross-site (vercel.app est
    // dans la Public Suffix List). SameSite=None;Secure est requis pour que le
    // cookie httpOnly traverse les requêtes cross-site en production.
    sameSite: prod ? 'none' : 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/** Supprime le cookie accessToken côté serveur. */
function clearAuthCookie(res: any): void {
  const prod = process.env.NODE_ENV === 'production';
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? 'none' : 'strict',
    path: '/',
  });
}
@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth/')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(NoFilesInterceptor())
  login(@Body(FormDataTransformPipe, ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post('check-code')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: '123456',
          description: 'Le code à 6 chiffres reçu par email',
          minLength: 6,
          maxLength: 6,
        },
      },
      required: ['code'],
    },
  })
  // Anti brute-force du code 2FA (6 chiffres) : 5 essais/minute.
  // Jeton pre-auth requis (identifie l'utilisateur) + autorise malgre le
  // flag twoFactorPending via @Allow2FAPending.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(AuthGuard)
  @Allow2FAPending()
  @Post('check-code')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: '123456',
          description: 'Le code à 6 chiffres reçu par email',
          minLength: 6,
          maxLength: 6,
        },
      },
      required: ['code'],
    },
  })
  async verify2FA(
    @Body('code') code: string,
    @CurrentUser() currentUser: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.verifyCode2FA(code, currentUser);
    const token = (result?.data as any)?.token;
    if (result?.success && token) {
      setAuthCookie(res, token);
    }
    return result;
  }
  // ── 2FA management (utilisateur connecté) ──
  @UseGuards(AuthGuard)
  @Post('2fa/totp/init')
  setupTotp(@CurrentUser() currentUser: any) {
    return this.authService.setupTotp(currentUser);
  }

  @UseGuards(AuthGuard)
  @Post('2fa/totp/activate')
  activateTotp(@Body('code') code: string, @CurrentUser() currentUser: any) {
    return this.authService.activateTotp(code, currentUser);
  }

  @UseGuards(AuthGuard)
  @Post('2fa/email/activate')
  activateEmail2FA(@CurrentUser() currentUser: any) {
    return this.authService.activateEmail2FA(currentUser);
  }

  @UseGuards(AuthGuard)
  @Post('2fa/disable')
  disable2FA(
    @Body('password') password: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.authService.disable2FA(password, currentUser);
  }

  // Étape 2FA de connexion pour la méthode TOTP (jeton pre-auth accepte ici).
  @UseGuards(AuthGuard)
  @Allow2FAPending()
  @Post('2fa/totp/verify')
  async verifyTotpLogin(
    @Body('code') code: string,
    @CurrentUser() currentUser: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.verifyTotpLogin(code, currentUser);
    const token = (result?.data as any)?.token;
    if (result?.success && token) {
      setAuthCookie(res, token);
    }
    return result;
  }
  @Post('register')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(NoFilesInterceptor())
  register(
    @Body(FormDataTransformPipe, ValidationPipe) registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto);
  }
  @Get('email-confirmation')
  emailConfirmation(@Query('token') token: string) {
    return this.authService.emailConfirmation(token);
  }
  @UseGuards(AuthGuard)
  @Get('user/me')
  getProfileUser(@CurrentUser() currentUser: User) {
    return currentUser;
  }
  // reset de mot de passe de l'utlisateur
  @Post('forgot-password')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
      required: ['email'],
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(NoFilesInterceptor())
  resetforgotPassword(@Body(FormDataTransformPipe) body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }
  @Post('change-password')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', example: 'NewPassword@123' },
      },
      required: ['password'],
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(NoFilesInterceptor())
  changePassword(
    @Query('token') token: string,
    @Body(FormDataTransformPipe) body: { password: string },
  ) {
    return this.authService.resetPassword(token, body.password);
  }
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookie(res);
    return ApiResponse.success('Déconnecté avec succès');
  }
}
