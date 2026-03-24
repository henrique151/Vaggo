import bcrypt from 'bcrypt';
import sequelize from '../database';
import User from '../models/User';
import Person from '../models/Person';

export class UserService {
    static async createAccount(personData: any, userData: any) {
        const transaction = await sequelize.transaction();

        try {
            const person = await Person.create({
                ...personData,
                registrationDate: new Date(),
                isActive: true
            }, { transaction });

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            const user = await User.create({
                ...userData,
                password: hashedPassword,
                personId: person.id,
                lastLogin: new Date(),
                isBlocked: false,
                isAdmin: false,
                type: userData.type || "Cliente",
                permissionLevel: userData.permissionLevel || '1'
                // COLOCAR defaultValue: false, // O Sequelize preenche se você esquecer
            }, { transaction })

            await transaction.commit()

            const userResponse = user.toJSON();
            delete userResponse.password;

            return userResponse;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateAccount(id: number, updateData: any) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }
        if (updateData.password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        }

        await user.update(updateData);

        const updatedUser = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        return updatedUser;
    }
}