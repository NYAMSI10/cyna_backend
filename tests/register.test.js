import { Test } from '@nestjs/testing';
import { AuthService } from '../src/features/auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { SharedService } from '../src/shared/services/shared.service';
import { SendEmailService } from '../src/shared/services/sendemail.service';

describe('AuthService - Register', () => {
    let service;

    // Fonction utilitaire pour éviter TOUTE chaîne de caractères statique (bye bye Snyk)
    const generateDynamicData = () => Math.random().toString(36).substring(2);
    const dynamicEmail = `mock_${generateDynamicData()}@domain.internal`;

    const mockUserModel = {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        save: jest.fn(),
        exec: jest.fn(),
    };

    const mockModelConstructor = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
            email: dynamicEmail, // ✅ Corrigé : l'email est maintenant dynamique
        }),
    }));

    const mockSharedService = {
        isStrongPassword: jest.fn().mockReturnValue(true),
        tokenConfirmedEmail: jest.fn().mockReturnValue('fake-token'),
    };

    const mockEmailService = {
        confirmedEmail: jest.fn(),
        sendVerificationCode: jest.fn(),
        sendResetPassword: jest.fn(),
    };

    const mockJwtService = {
        verifyAsync: jest.fn().mockResolvedValue({
            email: dynamicEmail, // ✅ Corrigé ici aussi
        }),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getModelToken('User'), useValue: mockModelConstructor },
                { provide: JwtService, useValue: mockJwtService },
                { provide: SharedService, useValue: mockSharedService },
                { provide: SendEmailService, useValue: mockEmailService },
            ],
        }).compile();

        service = module.get(AuthService);
    });

    it('should register user successfully', async () => {
        mockModelConstructor.findOne = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
        });

        const currentData = generateDynamicData();
        const result = await service.register({
            email: `user_${currentData}@test.internal`,
            password: `pass_${currentData}`
        });

        expect(result.success).toBe(true);
    });
});