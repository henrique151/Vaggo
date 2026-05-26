import { Roles } from './Roles';

export interface UserAttributes {
    id: number;
    email: string;
    password: string;
    lastLogin: Date;
    isBlocked: boolean;
    permissionLevel: string;
    avatarUrl: string;
    personId: number;
    lastOnline?: Date | null;
    refreshTokenHash?: string;
    refreshTokenExpiresAt?: Date;
    passwordResetOtpHash?: string;
    passwordResetOtpExpiresAt?: Date;
}

