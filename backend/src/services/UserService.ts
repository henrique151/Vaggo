import crypto from 'crypto';
import bcrypt from 'bcrypt';
import sequelize from '../database';
import User from '../models/User';
import Person from '../models/Person';
import Vehicle from '../models/Vehicle';
import PropertyUser from '../models/PropertyUser';
import Spot from '../models/Spot';
import { CreateUserInput, UpdateUserInput, SearchUsersInput } from '../schemas/usersSchema';
import { FileData, ImageService } from './ImageService';
import TwilioWhatsAppService from './TwilioWhatsAppService';
import { Roles } from '../types/Roles';
import { Op } from 'sequelize';

const SALT_ROUNDS = 10;
const REGISTRATION_OTP_TTL_SECONDS = 10 * 60;
const SENSITIVE_USER_ATTRIBUTES = [
    'password',
    'refreshTokenHash',
    'refreshTokenExpiresAt',
    'passwordResetOtpHash',
    'passwordResetOtpExpiresAt',
    'PES_INT_ID',
];

type PersonData = Pick<CreateUserInput, 'name' | 'cpf' | 'gender' | 'phone' | 'birthDate'>;
type UserData = Pick<CreateUserInput, 'email' | 'password' | 'permissionLevel'>;

interface PendingRegistrationData {
    name: string;
    cpf: string;
    gender: string;
    phone: string;
    birthDate: Date;
    email: string;
    passwordHash: string;
    permissionLevel: '1' | '2' | '3';
    avatarFile: FileData;
    otpHash: string;
    otpExpiresAt: Date;
}

const pendingRegistrations = new Map<string, PendingRegistrationData>();

export class UserService {
    static async createAccount(personData: PersonData, userData: UserData, avatarFile?: FileData) {
        if (!avatarFile) throw new Error('PROFILE_IMAGE_REQUIRED');

        await this.assertRegistrationIsAvailable(personData.cpf, userData.email);
        ImageService.validateFile(avatarFile);

        const normalizedEmail = userData.email.toLowerCase().trim();
        const verificationCode = this.generateOtpCode();

        this.removeConflictingPendingRegistrations(normalizedEmail, personData.cpf, personData.phone);
        pendingRegistrations.set(normalizedEmail, {
            name: personData.name,
            cpf: personData.cpf,
            gender: personData.gender,
            phone: personData.phone,
            birthDate: personData.birthDate,
            email: normalizedEmail,
            passwordHash: await bcrypt.hash(userData.password, SALT_ROUNDS),
            permissionLevel: userData.permissionLevel ?? '1',
            avatarFile: {
                buffer: Buffer.from(avatarFile.buffer),
                mimetype: avatarFile.mimetype,
            },
            otpHash: await bcrypt.hash(verificationCode, SALT_ROUNDS),
            otpExpiresAt: new Date(Date.now() + REGISTRATION_OTP_TTL_SECONDS * 1000),
        });

        TwilioWhatsAppService.dispatchInBackground(() =>
            TwilioWhatsAppService.sendEmailVerificationOtp(personData.phone, verificationCode)
        );

        return {
            email: normalizedEmail,
            requiresOtpVerification: true,
            otpExpiresIn: REGISTRATION_OTP_TTL_SECONDS,
            deliveryChannel: 'whatsapp',
        };
    }

    static async resendRegistrationOtp(identifier: string) {
        const pendingRegistration = this.findPendingRegistration(identifier);
        const code = this.generateOtpCode();

        pendingRegistration.otpHash = await bcrypt.hash(code, SALT_ROUNDS);
        pendingRegistration.otpExpiresAt = new Date(Date.now() + REGISTRATION_OTP_TTL_SECONDS * 1000);
        pendingRegistrations.set(pendingRegistration.email, pendingRegistration);

        TwilioWhatsAppService.dispatchInBackground(() =>
            TwilioWhatsAppService.sendEmailVerificationOtp(pendingRegistration.phone, code)
        );

        return {
            expiresIn: REGISTRATION_OTP_TTL_SECONDS,
            deliveryChannel: 'whatsapp',
        };
    }

    static async confirmPendingRegistration(email: string, code: string) {
        const normalizedEmail = email.toLowerCase().trim();
        const pendingRegistration = pendingRegistrations.get(normalizedEmail);
        if (!pendingRegistration) throw new Error('PENDING_REGISTRATION_NOT_FOUND');

        if (new Date() > pendingRegistration.otpExpiresAt) {
            pendingRegistrations.delete(normalizedEmail);
            throw new Error('OTP_EXPIRED');
        }

        const isValidCode = await bcrypt.compare(code, pendingRegistration.otpHash);
        if (!isValidCode) throw new Error('INVALID_OTP');

        const transaction = await sequelize.transaction();
        let uploadedPublicId: string | null = null;

        try {
            await this.assertRegistrationIsAvailable(pendingRegistration.cpf, pendingRegistration.email);

            const person = await Person.create(
                {
                    name: pendingRegistration.name,
                    cpf: pendingRegistration.cpf,
                    gender: pendingRegistration.gender,
                    phone: pendingRegistration.phone,
                    birthDate: pendingRegistration.birthDate,
                    registrationDate: new Date(),
                    isActive: true,
                },
                { transaction }
            );

            const user = await User.create(
                {
                    email: pendingRegistration.email,
                    password: pendingRegistration.passwordHash,
                    personId: person.id,
                    lastLogin: new Date(),
                    isBlocked: false,
                    permissionLevel: pendingRegistration.permissionLevel,
                    avatarUrl: 'pending',
                },
                { transaction }
            );

            const uploadResult = await ImageService.uploadUserAvatar(pendingRegistration.avatarFile, user.id);
            uploadedPublicId = uploadResult.public_id;

            await user.update({ avatarUrl: uploadResult.secure_url }, { transaction });
            await transaction.commit();
            pendingRegistrations.delete(normalizedEmail);

            const {
                password: _password,
                refreshTokenHash: _refreshTokenHash,
                refreshTokenExpiresAt: _refreshTokenExpiresAt,
                passwordResetOtpHash: _passwordResetOtpHash,
                passwordResetOtpExpiresAt: _passwordResetOtpExpiresAt,
                ...userResponse
            } = user.toJSON();

            return userResponse;
        } catch (error) {
            await transaction.rollback();
            if (uploadedPublicId) await ImageService.deleteImage(uploadedPublicId).catch(console.error);
            throw error;
        }
    }

    static async getAllUsers() {
        return User.findAll({
            attributes: { exclude: SENSITIVE_USER_ATTRIBUTES },
            include: [{ model: Person, as: 'person' }],
        });
    }

    static async getUserById(id: number) {
        const user = await User.findByPk(id, {
            attributes: { exclude: SENSITIVE_USER_ATTRIBUTES },
            include: [{ model: Person, as: 'person' }],
        });
        if (!user) throw new Error('USER_NOT_FOUND');
        return user;
    }

    static async toggleBlockUser(id: number, blocked: boolean) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('USER_NOT_FOUND');

        await user.update({ isBlocked: blocked });
        return this.getUserById(id);
    }

    static async getBlockedUsersCount() {
        return User.count({ where: { isBlocked: true } });
    }

    static async updateAccount(id: number, updateData: UpdateUserInput, fileData: { buffer: Buffer; mimetype: string }) {
        const transaction = await sequelize.transaction();
        let newAvatarPublicId: string | null = null;

        try {
            const user = await User.findByPk(id);
            if (!user) throw new Error('USER_NOT_FOUND');

            if (fileData) {
                const upload = await ImageService.uploadUserAvatar(fileData, id);
                newAvatarPublicId = upload.public_id;
                await user.update({ avatarUrl: upload.secure_url }, { transaction });
            }

            const { email, password, permissionLevel, ...personFields } = updateData;

            if (password) {
                await user.update(
                    { password: await bcrypt.hash(password, SALT_ROUNDS) },
                    { transaction }
                );
            }

            if (email || permissionLevel) {
                await user.update({ email, permissionLevel }, { transaction });
            }

            if (Object.keys(personFields).length > 0 && user.personId) {
                await Person.update(personFields, {
                    where: { id: user.personId },
                    transaction,
                });
            }

            await transaction.commit();
            return this.getUserById(id);
        } catch (error) {
            await transaction.rollback();
            if (newAvatarPublicId) await ImageService.deleteImage(newAvatarPublicId).catch(console.error);
            throw error;
        }
    }

    static async deleteAccount(id: number) {
        const transaction = await sequelize.transaction();

        try {
            const user = await User.findByPk(id);
            if (!user) throw new Error('USER_NOT_FOUND');

            await Vehicle.destroy({ where: { userId: id }, transaction });
            await User.destroy({ where: { id }, transaction });
            await Person.destroy({ where: { id: user.personId }, transaction });

            await transaction.commit();
            await ImageService.deleteFolder(`vaggo/users/user_${id}`).catch(console.error);

            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private static async assertRegistrationIsAvailable(cpf: string, email: string): Promise<void> {
        const [existingCpf, existingEmail] = await Promise.all([
            Person.findOne({ where: { cpf } }),
            User.findOne({ where: { email: email.toLowerCase().trim() } }),
        ]);

        if (existingCpf) throw new Error('CPF_ALREADY_EXISTS');
        if (existingEmail) throw new Error('EMAIL_ALREADY_EXISTS');
    }

    private static findPendingRegistration(identifier: string): PendingRegistrationData {
        const normalizedIdentifier = identifier.trim().toLowerCase();

        if (normalizedIdentifier.includes('@')) {
            const pending = pendingRegistrations.get(normalizedIdentifier);
            if (!pending) throw new Error('PENDING_REGISTRATION_NOT_FOUND');
            return pending;
        }

        const candidates = this.getPhoneCandidates(this.onlyDigits(normalizedIdentifier));
        const pending = Array.from(pendingRegistrations.values()).find((registration) => {
            const pendingPhoneDigits = this.onlyDigits(registration.phone);
            return candidates.includes(pendingPhoneDigits);
        });

        if (!pending) throw new Error('PENDING_REGISTRATION_NOT_FOUND');
        return pending;
    }

    private static removeConflictingPendingRegistrations(email: string, cpf: string, phone: string): void {
        const phoneCandidates = this.getPhoneCandidates(this.onlyDigits(phone));

        for (const [pendingEmail, registration] of pendingRegistrations.entries()) {
            const sameEmail = pendingEmail === email;
            const sameCpf = registration.cpf === cpf;
            const samePhone = phoneCandidates.includes(this.onlyDigits(registration.phone));

            if (sameEmail || sameCpf || samePhone) {
                pendingRegistrations.delete(pendingEmail);
            }
        }
    }

    private static generateOtpCode(): string {
        return crypto.randomInt(100000, 1000000).toString();
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

    static async searchUsers(filters: SearchUsersInput) {
        const where: any = {};
        const personWhere: any = {};

        if (filters.email) where.email = { [Op.iLike]: `%${filters.email}%` };
        if (filters.name) personWhere.name = { [Op.iLike]: `%${filters.name}%` };
        if (filters.phone) personWhere.phone = { [Op.iLike]: `%${filters.phone}%` };

        return User.findAll({
            where,
            include: [
                {
                    model: Person,
                    as: 'person',
                    where: Object.keys(personWhere).length > 0 ? personWhere : undefined
                }
            ],
            order: [['email', 'ASC']]
        });
    }
}
