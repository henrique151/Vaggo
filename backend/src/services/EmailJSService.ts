import axios from 'axios';

interface EmailJSResult {
    status: number;
    text: string;
    to: string;
}

class EmailJSService {
    async sendRegistrationOtp(toEmail: string, passcode: string, name?: string): Promise<EmailJSResult> {
        const response = await axios.post(
            'https://api.emailjs.com/api/v1.0/email/send',
            {
                service_id: this.getRequiredEnv('EMAILJS_SERVICE_ID'),
                template_id: this.getRequiredEnv('EMAILJS_TEMPLATE_ID'),
                user_id: this.getRequiredEnv('EMAILJS_PUBLIC_KEY'),
                accessToken: this.getRequiredEnv('EMAILJS_PRIVATE_KEY'),
                template_params: {
                    passcode,
                    to_email: toEmail,
                    to_name: name ?? toEmail,
                    email: toEmail,
                    user_email: toEmail,
                    reply_to: toEmail,
                    from_name: 'Vaggo',
                    from_email: toEmail,
                    name: name ?? toEmail,
                },
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            }
        );

        return {
            status: response.status,
            text: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
            to: toEmail,
        };
    }

    dispatchInBackground(sendEmail: () => Promise<EmailJSResult>): void {
        setImmediate(() => {
            void sendEmail()
                .then((result) => {
                    console.log(`[EmailJS Success] E-mail enviado para ${result.to} (status ${result.status}).`);
                })
                .catch((error) => this.logEmailJSError(error));
        });
    }

    private logEmailJSError(error: unknown): void {
        if (axios.isAxiosError(error)) {
            const details = typeof error.response?.data === 'string'
                ? error.response.data
                : JSON.stringify(error.response?.data);
            console.error(
                `[EmailJS Error] Status: ${error.response?.status ?? 'UNKNOWN'} - ${details || error.message}.`
            );
            return;
        }

        if (error instanceof Error) {
            console.error(`[EmailJS Error] ${error.message}.`);
            return;
        }

        console.error('[EmailJS Error] Erro desconhecido ao enviar e-mail.');
    }

    private getRequiredEnv(name: string): string {
        const value = process.env[name];
        if (!value) {
            throw new Error(`${name}_NOT_CONFIGURED`);
        }

        return value;
    }
}

export default new EmailJSService();
