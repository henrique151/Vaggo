import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const JWT_ACCESS_SECRET = process.env.JWT_SECRET || 'super-segredo';
const JWT_ACCESS_TOKEN_EXPIRES = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES || '600', 10);
const JWT_REFRESH_TOKEN_EXPIRES = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES || '604800', 10);
const BCRYPT_SALT_ROUNDS = 10;

import { Roles } from '../types/Roles';

export class TokenUtils {
    static generateAccessToken(userId: number, role: Roles): string {
        return jwt.sign({ id: userId, role }, JWT_ACCESS_SECRET, {
            expiresIn: JWT_ACCESS_TOKEN_EXPIRES,
        });
    }

    static generateRefreshToken(): string {
        return randomBytes(32).toString('hex');
    }

    static async hashRefreshToken(token: string): Promise<string> {
        return bcrypt.hash(token, BCRYPT_SALT_ROUNDS);
    }

    static async verifyRefreshTokenHash(token: string, hash: string): Promise<boolean> {
        return bcrypt.compare(token, hash);
    }

    static getRefreshTokenExpiresAt(): Date {
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + JWT_REFRESH_TOKEN_EXPIRES);
        return expiresAt;
    }

    static getAccessTokenExpiresIn(): number {
        return JWT_ACCESS_TOKEN_EXPIRES;
    }
}
