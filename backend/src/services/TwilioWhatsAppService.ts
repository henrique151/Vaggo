import twilio = require('twilio');
import type { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import {
    ContentVariables,
    TwilioErrorDetails,
    TwilioRestErrorLike,
    TwilioWhatsAppMessageResult,
    WhatsAppAddress,
} from '../types/TwilioWhatsAttributes';

class TwilioWhatsAppService {
    private client: twilio.Twilio | null = null;
    private readonly loggedErrors = new WeakSet<object>();

    async sendEmailVerificationOtp(to: string, code: string): Promise<TwilioWhatsAppMessageResult> {
        try {
            return await this.sendTemplateMessage(
                to,
                this.getRequiredEnv('TWILIO_TEMPLATE_EMAIL_VERIFICATION'),
                { '1': code }
            );
        } catch (error) {
            this.logTwilioError(error);
            throw error;
        }
    }

    async sendPasswordResetOtp(to: string, code: string): Promise<TwilioWhatsAppMessageResult> {
        try {
            return await this.sendTemplateMessage(
                to,
                this.getRequiredEnv('TWILIO_TEMPLATE_OTP'),
                { '1': code }
            );
        } catch (error) {
            this.logTwilioError(error);
            throw error;
        }
    }

    async sendRentalRequestAlert(
        to: string,
        ownerName: string,
        spotName: string
    ): Promise<TwilioWhatsAppMessageResult> {
        try {
            return await this.sendTemplateMessage(
                to,
                this.getRequiredEnv('TWILIO_TEMPLATE_RENTAL'),
                {
                    '1': ownerName,
                    '2': spotName,
                }
            );
        } catch (error) {
            this.logTwilioError(error);
            throw error;
        }
    }

    async sendNewChatMessage(
        to: string,
        senderName: string,
        chatId: number
    ): Promise<TwilioWhatsAppMessageResult> {
        try {
            this.assertPositiveId(chatId, 'chatId');

            return await this.sendTemplateMessage(
                to,
                this.getRequiredEnv('TWILIO_TEMPLATE_CHAT'),
                { '1': senderName }
            );
        } catch (error) {
            this.logTwilioError(error);
            throw error;
        }
    }

    async sendRentalApprovedAlert(
        to: string,
        userName: string,
        spotName: string,
        ownerName: string,
        chatId: number
    ): Promise<TwilioWhatsAppMessageResult> {
        try {
            this.assertPositiveId(chatId, 'chatId');

            return await this.sendTemplateMessage(
                to,
                this.getRequiredEnv('TWILIO_TEMPLATE_APPROVED'),
                {
                    '1': userName,
                    '2': spotName,
                    '3': ownerName,
                }
            );
        } catch (error) {
            this.logTwilioError(error);
            throw error;
        }
    }

    async sendRentalRejectedAlert(
        to: string,
        tenantName: string,
        spotName: string,
        ownerName: string
    ): Promise<TwilioWhatsAppMessageResult> {
        try {
            return await this.sendTemplateMessage(
                to,
                this.getRequiredEnv('TWILIO_TEMPLATE_RENTAL_REJECTED'),
                {
                    '1': tenantName,
                    '2': spotName,
                    '3': ownerName,
                }
            );
        } catch (error) {
            this.logTwilioError(error);
            throw error;
        }
    }

    async sendSpotApprovedAlert(
        to: string,
        ownerName: string,
        spotName: string
    ): Promise<TwilioWhatsAppMessageResult> {
        try {
            return await this.sendTemplateMessage(
                to,
                this.getRequiredEnv('TWILIO_TEMPLATE_SPOT_APPROVED'),
                {
                    '1': ownerName,
                    '2': spotName,
                }
            );
        } catch (error) {
            this.logTwilioError(error);
            throw error;
        }
    }

    dispatchInBackground(sendNotification: () => Promise<TwilioWhatsAppMessageResult>): void {
        setImmediate(() => {
            void sendNotification().catch((error) => this.logTwilioError(error));
        });
    }

    private async sendTemplateMessage(
        to: string,
        contentSid: string,
        contentVariables: ContentVariables
    ): Promise<TwilioWhatsAppMessageResult> {
        const recipient = this.sanitizeWhatsAppNumber(to);
        const sender = this.sanitizeWhatsAppNumber(this.getRequiredEnv('TWILIO_WHATSAPP_NUMBER'));
        const message = await this.getClient().messages.create({
            from: sender,
            to: recipient,
            contentSid,
            contentVariables: JSON.stringify(contentVariables),
        });

        const result = this.toMessageResult(message, recipient, sender);
        console.log(`[Twilio Success] Mensagem enviada para ${recipient} (SID: ${result.sid}).`);

        return result;
    }

    private getClient(): twilio.Twilio {
        if (!this.client) {
            this.client = twilio(
                this.getRequiredEnv('TWILIO_ACCOUNT_SID'),
                this.getRequiredEnv('TWILIO_AUTH_TOKEN')
            );
        }

        return this.client;
    }

    private sanitizeWhatsAppNumber(value: string): WhatsAppAddress {
        const withoutChannelPrefix = value.trim().replace(/^whatsapp:/i, '');
        const hasExplicitInternationalPrefix = withoutChannelPrefix.trim().startsWith('+');
        let digits = withoutChannelPrefix.replace(/\D/g, '');

        if (digits.startsWith('00')) {
            digits = digits.slice(2);
        }

        if (!hasExplicitInternationalPrefix && !digits.startsWith('55') && [10, 11].includes(digits.length)) {
            digits = `55${digits}`;
        }

        const e164Number = `+${digits}`;

        if (!/^\+[1-9]\d{7,14}$/.test(e164Number)) {
            throw new Error(`INVALID_WHATSAPP_NUMBER: ${e164Number} - Deve conter entre 8 e 15 dígitos após o +`);
        }

        return `whatsapp:${e164Number}` as WhatsAppAddress;
    }

    private buildFrontendUrl(path: string): string {
        const frontendUrl = this.getRequiredEnv('FRONTEND_URL');
        return new URL(path, frontendUrl).toString();
    }

    private assertPositiveId(value: number, fieldName: string): void {
        if (!Number.isInteger(value) || value <= 0) {
            throw new Error(`INVALID_${fieldName.toUpperCase()}`);
        }
    }

    private getRequiredEnv(name: string): string {
        const value = process.env[name];
        if (!value) {
            throw new Error(`${name}_NOT_CONFIGURED`);
        }

        return value;
    }

    private toMessageResult(
        message: MessageInstance,
        recipient: WhatsAppAddress,
        sender: WhatsAppAddress
    ): TwilioWhatsAppMessageResult {
        return {
            sid: message.sid,
            status: message.status,
            to: recipient,
            from: sender,
        };
    }

    private getTwilioErrorDetails(error: unknown): TwilioErrorDetails {
        if (this.isTwilioRestErrorLike(error)) {
            return {
                code: error.code ?? 'UNKNOWN',
                message: error.message ?? 'Erro desconhecido ao enviar mensagem pelo Twilio',
            };
        }

        if (error instanceof Error) {
            return {
                code: 'UNKNOWN',
                message: error.message,
            };
        }

        return {
            code: 'UNKNOWN',
            message: 'Erro desconhecido ao enviar mensagem pelo Twilio',
        };
    }

    private logTwilioError(error: unknown): void {
        if (typeof error === 'object' && error !== null) {
            if (this.loggedErrors.has(error)) {
                return;
            }

            this.loggedErrors.add(error);
        }

        const details = this.getTwilioErrorDetails(error);
        console.error(`[Twilio Error] Código: ${details.code} - Mensagem: ${details.message}.`);
    }

    private isTwilioRestErrorLike(error: unknown): error is TwilioRestErrorLike {
        return typeof error === 'object' && error !== null && ('code' in error || 'message' in error);
    }
}

export default new TwilioWhatsAppService();
