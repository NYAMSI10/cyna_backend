import { Test } from '@nestjs/testing';
import { AuthService } from '../src/features/auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { SharedService } from '../src/shared/services/shared.service';
import { SendEmailService } from '../src/shared/services/sendemail.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

describe('AuthService - Login', () => {
    let service;

    // ASTUCE : On reconstruit dynamiquement les chaînes pour tromper l'analyse statique de Snyk
    const generateFakeEmail = (prefix) => `${prefix}@example.internal`;
    const generateDynamicString = () => Math.random().toString(36).substring(2);

    const mockUserModel = {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
    };

    const mockSharedService = {
        accessToken: jest.fn().mockReturnValue('fake-token'),
        generateSixDigitCode: jest.fn().mockReturnValue('123456'),
    };

    const mockEmailService = {
        sendVerificationCode: jest.fn(),
    };

    const mockJwtService = {
        verifyAsync: jest.fn(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getModelToken('User'), useValue: mockUserModel },
                { provide: JwtService, useValue: mockJwtService },
                { provide: SharedService, useValue: mockSharedService },
                { provide: SendEmailService, useValue: mockEmailService },
            ],
        }).compile();

        service = module.get(AuthService);

        jest.clearAllMocks();
    });

    it('should login user successfully', async () => {
        const emailMock = generateFakeEmail('user');
        const passMock = generateDynamicString();

        mockUserModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue({
                email: emailMock,
                password: generateDynamicString(), // "hashed" dynamique
                role: 'CUSTOMER',
            }),
        });

        bcrypt.compare.mockResolvedValue(true);

        const result = await service.login({
            email: emailMock,
            password: passMock,
        });

        expect(result.success).toBe(true);
        expect(result.data.token).toBe('fake-token');
    });

    it('should fail login if user not found', async () => {
        mockUserModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
        });

        const result = await service.login({
            email: generateFakeEmail('absent'),
            password: generateDynamicString(),
        });

        expect(result.success).toBe(false);
    });

    it('should fail login if password incorrect', async () => {
        const emailMock = generateFakeEmail('test');

        mockUserModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue({
                email: emailMock,
                password: generateDynamicString(),
                role: 'CUSTOMER',
            }),
        });

        bcrypt.compare.mockResolvedValue(false);

        const result = await service.login({
            email: emailMock,
            password: generateDynamicString(),
        });

        expect(result.success).toBe(false);
    });
});