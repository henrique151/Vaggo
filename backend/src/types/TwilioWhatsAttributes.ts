import type { MessageStatus } from 'twilio/lib/rest/api/v2010/account/message';

export type WhatsAppAddress = `whatsapp:+${string}`;
export type ContentVariables = Record<string, string>;

export interface TwilioWhatsAppMessageResult {
    sid: string;
    status: MessageStatus;
    to: WhatsAppAddress;
    from: WhatsAppAddress;
}

export interface TwilioErrorDetails {
    code: string | number;
    message: string;
}

export interface TwilioRestErrorLike {
    code?: string | number;
    message?: string;
}
