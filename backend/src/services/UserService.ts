import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sequelize from '../database';
import User from '../models/User';
import Person from '../models/Person';
import Vehicle from '../models/Vehicle';
import { CreateUserInput, UpdateUserInput } from '../schemas/usersSchema';
import { FileData, ImageService } from './ImageService';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'super-segredo';
const JWT_EXPIRES_IN = 3600;

// Pick é um utilitário do TypeScript que extrai apenas os campos que você quer de uma interface/tipo existente, sem precisar redeclarar tudo.
type PersonData = Pick<CreateUserInput, 'name' | 'cpf' | 'gender' | 'phone' | 'birthDate'>;
type UserData = Pick<CreateUserInput, 'email' | 'password' | 'permissionLevel'>;

export class UserService {
    static async createAccount(personData: PersonData, userData: UserData, avatarFile?: FileData) {
        if (!avatarFile) throw new Error('PROFILE_IMAGE_REQUIRED');
        const transaction = await sequelize.transaction();

        let uploadedPublicId: string | null = null;

        try {
            const existingCpf = await Person.findOne({ where: { cpf: personData.cpf } });
            if (existingCpf)
                throw new Error('CPF_ALREADY_EXISTS');

            const existingEmail = await User.findOne({ where: { email: userData.email } });
            if (existingEmail)
                throw new Error('EMAIL_ALREADY_EXISTS');

            const person = await Person.create(
                { ...personData, registrationDate: new Date(), isActive: true },
                { transaction }
            );

            const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

            const user = await User.create(
                {
                    ...userData,
                    password: hashedPassword,
                    personId: person.id,
                    lastLogin: new Date(),
                    isBlocked: false,
                    isAdmin: false,
                    permissionLevel: userData.permissionLevel ?? '1',
                    avatarUrl: 'pending',
                },
                { transaction }
            );

            // Agora fazer upload do arquivo (o user.id já existe)
            const uploadResult = await ImageService.uploadUserAvatar(avatarFile, user.id);
            uploadedPublicId = uploadResult.public_id;

            // Atualizar com a URL final do avatar
            await user.update({ avatarUrl: uploadResult.secure_url }, { transaction });
            await transaction.commit();

            const { password: _, ...userResponse } = user.toJSON();
            return userResponse;
        } catch (error) {
            await transaction.rollback();
            if (uploadedPublicId) await ImageService.deleteImage(uploadedPublicId).catch(console.error);
            throw error;
        }
    }

    static async getAllUsers() {
        return User.findAll({
            attributes: { exclude: ['PES_INT_ID'] },
            include: [{ model: Person, as: 'person' }],
        });
    }
    static async getUserById(id: number) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['PES_INT_ID'] },
            include: [{ model: Person, as: 'person' }],
        });
        if (!user) throw new Error('USER_NOT_FOUND');
        return user;
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

            await Vehicle.destroy({ where: { userId: id }, transaction })
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

    static async authenticate(email: string, password: string) {
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('INVALID_CREDENTIALS');
        }

        await user.update({ lastLogin: new Date() });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return {
            token,
            expiresIn: JWT_EXPIRES_IN,
            user: {
                id: user.id,
                email: user.email,
                permissionLevel: user.permissionLevel,
            },
        };
    }
}