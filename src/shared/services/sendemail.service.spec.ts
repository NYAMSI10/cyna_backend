import { SendEmailService } from './sendemail.service';

const mockSendMail = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

describe('SendEmailService', () => {
  let service: SendEmailService;

  beforeEach(() => {
    mockSendMail.mockClear();
    service = new SendEmailService();
  });

  it('does not insert user-controlled email text in confirmation HTML', async () => {
    await service.confirmedEmail(
      'test<script>alert(1)</script>@example.com',
      'token',
    );

    const mailOptions = mockSendMail.mock.calls[0][0];

    expect(mailOptions.html).not.toContain('test');
    expect(mailOptions.html).not.toContain('<script>alert(1)</script>');
  });

  it('keeps encoded tokens out of HTML and places them in text links', async () => {
    const token = 'abc"><script>alert(1)</script>';

    await service.sendResetPassword('user@example.com', token);

    const mailOptions = mockSendMail.mock.calls[0][0];

    expect(mailOptions.text).toContain(encodeURIComponent(token));
    expect(mailOptions.html).not.toContain(encodeURIComponent(token));
    expect(mailOptions.html).not.toContain(token);
  });
});
