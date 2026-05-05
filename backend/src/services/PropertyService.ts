import sequelize from "../database";
import Property from "../models/Property";
import Address from "../models/Address";
import { CreatePropertyInput } from "../schemas/propertiesSchema";
import City from "../models/City";
import { ExternalAddressService } from "./ExternalAddressService";
import User from "../models/User";
import PropertyUser from "../models/PropertyUser";
import { FileData, ImageService } from "./ImageService";

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

    static async createProperty(propertyData: CreatePropertyInput, userId: number, files: FileData[]) {
        if (!files || files.length === 0) throw new Error('PROPERTY_REQUIRES_AT_LEAST_ONE_IMAGE');
        if (files.length > 3) throw new Error('PROPERTY_IMAGE_LIMIT');

        const transaction = await sequelize.transaction();
        const uploadedPublicIds: string[] = [];

        try {
            const externalData = await ExternalAddressService.getAddressByCep(propertyData.zipCode);
            if (!externalData) throw new Error('EXTERNAL_API_FAILURE');

            const city = await City.findByPk(externalData.cityIbgeCode);
            if (!city) throw new Error('CITY_NOT_FOUND');

            const address = await Address.create({
                street: externalData.street || propertyData.street,
                number: propertyData.number,
                complement: propertyData.complement,
                neighborhood: externalData.neighborhood || propertyData.neighborhood,
                zipCode: propertyData.zipCode,
                cityId: externalData.cityIbgeCode
            }, { transaction });

            const property = await Property.create({
                ...propertyData,
                description: propertyData.description || '',
                addressId: address.id,
                latitude: externalData.latitude,
                longitude: externalData.longitude
            }, { transaction });

            await PropertyUser.create({
                userId,
                propertyId: property.id,
                role: 'DONO'
            }, { transaction });

            const uploadedImages = await Promise.all(
                files.map((file, index) =>
                    ImageService.uploadPropertyImage(file, userId, property.id, index)
                )
            );

            uploadedPublicIds.push(...uploadedImages.map((image) => image.public_id));

            await property.update({
                images: uploadedImages.map((image) => image.secure_url)
            }, { transaction });

            await transaction.commit();
            return this.getPropertyById(property.id);
        } catch (error) {
            await transaction.rollback();
            await Promise.all(
                uploadedPublicIds.map((publicId) =>
                    ImageService.deleteImage(publicId).catch(console.error)
                )
            );
            throw error;
        }
    }

    static async getAllProperties() {
        return Property.findAll({
            attributes: { exclude: ["END_INT_ID"] },
            include: this.defaultInclude,
            order: [['END_INT_ID', 'ASC']]
        });
    }

    static async getPropertyById(id: number, userId?: number) {
        const property = await Property.findByPk(id, {
            attributes: { exclude: ['END_INT_ID'] },
            include: this.defaultInclude
        });

        if (!property) throw new Error('PROPERTY_NOT_FOUND');

        if (userId) {
            const membership = await PropertyUser.findOne({
                where: { propertyId: id, userId }
            });

            if (!membership) throw new Error('PROPERTY_ACCESS_DENIED');
        }

        return property;
    }

    static async getMyProperties(userId: number) {
        return Property.findAll({
            attributes: { exclude: ['END_INT_ID'] },
            include: [
                ...this.defaultInclude,
                {
                    model: User,
                    as: 'residentsAndOwners',
                    where: { id: userId },
                    attributes: [],
                    through: { attributes: [] }
                }
            ]
        });
    }

    static async deleteProperty(id: number) {
        const transaction = await sequelize.transaction();

        try {
            const property = await Property.findByPk(id, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            const propertyUser = await PropertyUser.findOne({
                where: { propertyId: id },
                transaction
            });

            await property.destroy({ transaction });
            await Address.destroy({
                where: { id: property.addressId },
                transaction
            });

            await transaction.commit();

            if (propertyUser?.userId) {
                ImageService.deleteFolderAsync(`vaggo/users/user_${propertyUser.userId}/properties`).catch(console.error);
            }

            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateProperty(id: number, propertyData: CreatePropertyInput, newFiles: FileData[], imagesToRemove: string[] = []) {
        const transaction = await sequelize.transaction();
        const uploadedPublicIds: string[] = [];

        try {
            const property = await Property.findByPk(id, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            const externalData = await ExternalAddressService.getAddressByCep(propertyData.zipCode);
            if (!externalData) throw new Error('EXTERNAL_API_FAILURE');

            const city = await City.findByPk(externalData.cityIbgeCode, { transaction });
            if (!city) throw new Error('CITY_NOT_FOUND');

            const propertyUser = await PropertyUser.findOne({
                where: { propertyId: id },
                transaction
            });

            const userId = propertyUser?.userId;
            if (!userId) throw new Error('PROPERTY_OWNER_NOT_FOUND');

            const currentImages = (property.images || []).filter(
                (url) => !imagesToRemove.map((image) => image.trim()).includes(url)
            );

            if ((currentImages.length + newFiles.length) < 1) throw new Error('PROPERTY_REQUIRES_AT_LEAST_ONE_IMAGE');
            if ((currentImages.length + newFiles.length) > 3) throw new Error('PROPERTY_IMAGE_LIMIT');

            const uploadedImages = await Promise.all(
                newFiles.map((file, index) =>
                    ImageService.uploadPropertyImage(file, userId, property.id, currentImages.length + index)
                )
            );

            uploadedPublicIds.push(...uploadedImages.map((image) => image.public_id));

            await property.update({
                ...propertyData,
                images: [...currentImages, ...uploadedImages.map((image) => image.secure_url)],
                latitude: externalData.latitude,
                longitude: externalData.longitude
            }, { transaction });

            await Address.update({
                street: externalData.street || propertyData.street,
                number: propertyData.number,
                complement: propertyData.complement,
                neighborhood: externalData.neighborhood || propertyData.neighborhood,
                zipCode: propertyData.zipCode,
                cityId: externalData.cityIbgeCode
            }, {
                where: { id: property.addressId },
                transaction
            });

            await transaction.commit();

            await Promise.all(
                imagesToRemove.map((url) => {
                    const publicId = ImageService.extractPublicId(url);
                    return publicId
                        ? ImageService.deleteImage(publicId).catch(console.error)
                        : Promise.resolve();
                })
            );

            return this.getPropertyById(id);
        } catch (error) {
            await transaction.rollback();
            await Promise.all(
                uploadedPublicIds.map((publicId) =>
                    ImageService.deleteImage(publicId).catch(console.error)
                )
            );
            throw error;
        }
    }
}
