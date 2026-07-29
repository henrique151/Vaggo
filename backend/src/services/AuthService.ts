import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { col, fn, Op, where } from 'sequelize';
import User from '../models/User';
import Person from '../models/Person';
import { TokenUtils } from '../utils/tokenUtils';
import EmailJSService from './EmailJSService';
import { UserService } from './UserService';
import { normalizeRole } from '../types/Roles';

const SALT_ROUNDS = 10;
const OTP_TTL_SECONDS = 10 * 60;
const RESET_TOKEN_TTL_SECONDS = 15 * 60;
const JWT_ACCESS_SECRET = process.env.JWT_SECRET || 'super-segredo';

export class AuthService {
    static async authenticate(email: string, password: string) {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Person, as: 'person' }],
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('INVALID_CREDENTIALS');
        }

        await user.update({ lastLogin: new Date() });

        const role = normalizeRole(user.permissionLevel);
        const accessToken = TokenUtils.generateAccessToken(user.id, role);
        const refreshToken = TokenUtils.generateRefreshToken();
        const refreshTokenHash = await TokenUtils.hashRefreshToken(refreshToken);
        const refreshTokenExpiresAt = TokenUtils.getRefreshTokenExpiresAt();

        await user.update({
            refreshTokenHash,
            refreshTokenExpiresAt,
        });

        return {
            accessToken,
            expiresIn: TokenUtils.getAccessTokenExpiresIn(),
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                permissionLevel: user.permissionLevel,
            },
        };
    }

    static async refreshAccessTokenFromRequest(refreshToken: string, authorizationHeader?: string) {
        const userId = this.extractUserIdFromAuthorizationHeader(authorizationHeader);
        if (!userId) {
            return this.refreshAccessTokenWithoutAuthorizationHeader(refreshToken);
        }

        return this.refreshAccessToken(userId, refreshToken);
    }

    static async refreshAccessToken(userId: number, refreshToken: string) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('USER_NOT_FOUND');

        if (!user.refreshTokenHash || !user.refreshTokenExpiresAt) {
            throw new Error('NO_REFRESH_TOKEN');
        }

        if (new Date() > user.refreshTokenExpiresAt) {
            await user.update({ refreshTokenHash: null, refreshTokenExpiresAt: null });
            throw new Error('REFRESH_TOKEN_EXPIRED');
        }

        const isValidToken = await TokenUtils.verifyRefreshTokenHash(refreshToken, user.refreshTokenHash);
        if (!isValidToken) throw new Error('INVALID_REFRESH_TOKEN');

        const role = normalizeRole(user.permissionLevel);
        const newAccessToken = TokenUtils.generateAccessToken(user.id, role);

        return {
            accessToken: newAccessToken,
            expiresIn: TokenUtils.getAccessTokenExpiresIn(),
            user: {
                id: user.id,
                email: user.email,
                permissionLevel: user.permissionLevel,
            },
        };
    }

    static async logout(userId: number) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('USER_NOT_FOUND');

        await user.update({
            refreshTokenHash: null,
            refreshTokenExpiresAt: null,
        });

        return true;
    }

    static async resendRegistrationOtp(identifier: string) {
        return UserService.resendRegistrationOtp(identifier);
    }

    static async confirmRegistrationOtp(email: string, code: string) {
        return UserService.confirmPendingRegistration(email, code);
    }

    static async requestPasswordReset(email: string) {
        const { user, person } = await this.findUserByEmailOrPhone(email);
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        await user.update({
            passwordResetOtpHash: tokenHash,
            passwordResetOtpExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_SECONDS * 1000),
        });

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${token}`;

        EmailJSService.dispatchInBackground(() =>
            EmailJSService.sendPasswordResetToken(user.email, resetLink, person.name)
        );

        return {
            expiresIn: RESET_TOKEN_TTL_SECONDS,
            deliveryChannel: 'email',
        };
    }

    static async resetPasswordWithToken(resetToken: string, newPassword: string) {
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            where: {
                passwordResetOtpHash: tokenHash,
                passwordResetOtpExpiresAt: { [Op.gt]: new Date() },
            },
        });

        if (!user) throw new Error('INVALID_PASSWORD_RESET_TOKEN');

        await user.update({
            password: await bcrypt.hash(newPassword, SALT_ROUNDS),
            refreshTokenHash: null,
            refreshTokenExpiresAt: null,
            passwordResetOtpHash: null,
            passwordResetOtpExpiresAt: null,
        });

        return true;
    }

    private static extractUserIdFromAuthorizationHeader(authorizationHeader?: string): number | undefined {
        if (!authorizationHeader) return undefined;

        const [, token] = authorizationHeader.split(' ');
        if (!token) return undefined;

        try {
            const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { id: string };
            return Number(decoded.id);
        } catch {
            const decoded = jwt.decode(token) as { id: string } | null;
            return decoded ? Number(decoded.id) : undefined;
        }
    }

    private static async refreshAccessTokenWithoutAuthorizationHeader(refreshToken: string) {
        const users = await User.findAll({
            where: {
                refreshTokenHash: { [Op.ne]: null },
                refreshTokenExpiresAt: { [Op.gt]: new Date() },
            },
        });

        for (const user of users) {
            if (user.refreshTokenHash && await TokenUtils.verifyRefreshTokenHash(refreshToken, user.refreshTokenHash)) {
                return this.refreshAccessToken(user.id, refreshToken);
            }
        }

        throw new Error('INVALID_REFRESH_TOKEN');
    }

    private static async findUserByEmailOrPhone(identifier: string): Promise<{ user: User; person: Person }> {
        const normalizedIdentifier = identifier.trim().toLowerCase();

        if (normalizedIdentifier.includes('@')) {
            const user = await User.findOne({
                where: { email: normalizedIdentifier },
                include: [{ model: Person, as: 'person' }],
            });

            if (!user || !user.person) throw new Error('USER_NOT_FOUND');
            return { user, person: user.person };
        }

        const phoneCandidates = this.getPhoneCandidates(this.onlyDigits(normalizedIdentifier));
        if (phoneCandidates.length === 0) throw new Error('USER_NOT_FOUND');

        const person = await Person.findOne({
            where: where(
                fn('regexp_replace', col('PES_STR_PHONE'), '\\D', '', 'g'),
                { [Op.in]: phoneCandidates }
            ),
        });

        if (!person) throw new Error('USER_NOT_FOUND');

        const user = await User.findOne({
            where: { personId: person.id },
        });

        if (!user) throw new Error('USER_NOT_FOUND');
        return { user, person };
    }

    private static onlyDigits(value: string): string {
        return value.replace(/\D/g, '');
    }

    private static getPhoneCandidates(phoneDigits: string): string[] {
        if (!phoneDigits) return [];

        const candidates = new Set<string>([phoneDigits]);
        if (phoneDigits.startsWith('55') && phoneDigits.length > 11) {
            candidates.add(phoneDigits.slice(2));
        } else if ([10, 11].includes(phoneDigits.length)) {
            candidates.add(`55${phoneDigits}`);
        }

        return Array.from(candidates);
    }
}
