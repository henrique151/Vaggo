import sequelize from "../database";
import Property from "../models/Property";
import Address from "../models/Address";
import { CreatePropertyInput } from "../schemas/propertiesSchema";
import City from "../models/City";

export class PropertyService {
    private static get defaultInclude() {
        return [
            {
                model: Address,
                as: 'address',
                attributes: { exclude: ["END_INT_ID", "CID_INT_ID"] },
                include: [
                    {
                        model: City,
                        as: 'city',
                        attributes: { exclude: ["EST_INT_ID"] }
                    }
                ]
            }
        ];
    }

    static async createProperty(propertyData: CreatePropertyInput) {
        const transaction = await sequelize.transaction();
        try {
            const city = await City.findByPk(propertyData.cityId, { transaction })
            if (!city) throw new Error('CITY_NOT_FOUND');

            const address = await Address.create({
                street: propertyData.street,
                number: propertyData.number,
                neighborhood: propertyData.neighborhood,
                zipCode: propertyData.zipCode,
                cityId: propertyData.cityId
            }, { transaction });

            const property = await Property.create({
                ...propertyData,
                addressId: address.id
            }, { transaction });

            await transaction.commit();
            return this.getPropertyById(property.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getAllProperties() {
        return Property.findAll({
            attributes: { exclude: ["END_INT_ID"] },
            include: this.defaultInclude
        });
    }

    static async getPropertyById(id: number) {
        const property = await Property.findByPk(id, {
            attributes: { exclude: ["END_INT_ID"] },
            include: this.defaultInclude
        });
        if (!property) throw new Error('PROPERTY_NOT_FOUND');
        return property;
    }

    static async deleteProperty(id: number) {
        const transaction = await sequelize.transaction();

        try {
            const property = await Property.findByPk(id, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            const addressId = property.addressId;
            await property.destroy({ transaction });
            await Address.destroy({ where: { id: addressId }, transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateProperty(id: number, propertyData: CreatePropertyInput) {
        const transaction = await sequelize.transaction();

        try {
            const property = await Property.findByPk(id, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            await property.update({
                ...propertyData
            }, { transaction })

            await Address.update({
                street: propertyData.street,
                number: propertyData.number,
                neighborhood: propertyData.neighborhood,
                zipCode: propertyData.zipCode,
                cityId: propertyData.cityId
            }, {
                where: { id: property.addressId },
                transaction
            })

            await transaction.commit();
            return this.getPropertyById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

}