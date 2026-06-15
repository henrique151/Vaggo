import sequelize from "../database";
import Property from "../models/Property";
import Address from "../models/Address";
import { CreatePropertyInput, SearchPropertiesInput } from "../schemas/propertiesSchema";
import City from "../models/City";
import { ExternalAddressService } from "./ExternalAddressService";
import User from "../models/User";
import Person from "../models/Person";
import PropertyUser from "../models/PropertyUser";
import { FileData, ImageService } from "./ImageService";
import { Roles } from "../types/Roles";
import { Op, WhereOptions } from "sequelize";

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
            include: [
                ...this.defaultInclude,
                {
                    model: User,
                    as: 'residentsAndOwners',
                    attributes: ['id', 'email'],
                    through: { attributes: [] },
                    include: [{ model: Person, as: 'person', attributes: ['name'] }]
                }
            ],
            order: [['END_INT_ID', 'ASC']]
        });
    }

    static async getAdminPropertyById(id: number) {
        const property = await Property.findByPk(id, {
            attributes: { exclude: ['END_INT_ID'] },
            include: [
                ...this.defaultInclude,
                {
                    model: User,
                    as: 'residentsAndOwners',
                    attributes: ['id', 'email'],
                    through: { attributes: [] },
                    include: [{ model: Person, as: 'person', attributes: ['name'] }]
                }
            ]
        });

        if (!property) throw new Error('PROPERTY_NOT_FOUND');
        return property;
    }

    static async getPropertyById(id: number, authUserId?: number, role?: Roles) {
        const property = await Property.findByPk(id, {
            attributes: { exclude: ['END_INT_ID'] },
            include: [
                ...this.defaultInclude,
                {
                    model: User,
                    as: 'residentsAndOwners',
                    attributes: ['id', 'email'],
                    through: { attributes: ['role'] },
                    required: false
                }
            ]
        });

        if (!property) throw new Error('PROPERTY_NOT_FOUND');

        if (authUserId && role !== Roles.ADMIN && role !== Roles.MANAGER) {
            const membership = await PropertyUser.findOne({
                where: { propertyId: id, userId: authUserId }
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

    static async deleteProperty(id: number, authUserId: number, role?: Roles) {
        const transaction = await sequelize.transaction();

        try {
            const property = await Property.findByPk(id, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            const propertyUser = await PropertyUser.findOne({
                where: { propertyId: id },
                transaction
            });

            if (propertyUser?.userId !== authUserId && role !== Roles.ADMIN) {
                throw new Error('PROPERTY_ACCESS_DENIED');
            }

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

    static async updateProperty(id: number, propertyData: CreatePropertyInput, newFiles: FileData[], imagesToRemove: string[] = [], authUserId: number, role?: Roles) {
        const transaction = await sequelize.transaction();
        const uploadedPublicIds: string[] = [];

        try {
            const property = await Property.findByPk(id, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            const currentAddress = await Address.findByPk(property.addressId, { transaction });
            const zipCodeToUse = propertyData.zipCode || currentAddress?.zipCode;

            let externalData: any = null;
            if (zipCodeToUse) {
                externalData = await ExternalAddressService.getAddressByCep(zipCodeToUse);
                if (!externalData) throw new Error('EXTERNAL_API_FAILURE');

                const city = await City.findByPk(externalData.cityIbgeCode, { transaction });
                if (!city) throw new Error('CITY_NOT_FOUND');
            }

            const propertyUser = await PropertyUser.findOne({
                where: { propertyId: id },
                transaction
            });

            const userId = propertyUser?.userId;
            if (!userId) throw new Error('PROPERTY_OWNER_NOT_FOUND');

            if (userId !== authUserId && role !== Roles.ADMIN) {
                throw new Error('PROPERTY_ACCESS_DENIED');
            }

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
                latitude: externalData?.latitude || property.latitude,
                longitude: externalData?.longitude || property.longitude
            }, { transaction });

            await Address.update({
                street: externalData?.street || propertyData.street || currentAddress?.street,
                number: propertyData.number || currentAddress?.number,
                complement: propertyData.complement !== undefined ? propertyData.complement : currentAddress?.complement,
                neighborhood: externalData?.neighborhood || propertyData.neighborhood || currentAddress?.neighborhood,
                zipCode: zipCodeToUse,
                cityId: externalData?.cityIbgeCode || currentAddress?.cityId
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

    static async searchProperties(filters: SearchPropertiesInput) {
        const where: WhereOptions = { isActive: true };
        const addressWhere: any = {};
        const cityWhere: any = {};

        if (filters.name) where.name = { [Op.iLike]: `%${filters.name}%` };
        if (filters.city) cityWhere.name = { [Op.iLike]: `%${filters.city}%` };
        if (filters.neighborhood) addressWhere.neighborhood = { [Op.iLike]: `%${filters.neighborhood}%` };

        const includes: any[] = [
            {
                model: Address,
                as: 'address',
                attributes: { exclude: ["END_INT_ID", "CID_INT_ID"] },
                where: Object.keys(addressWhere).length > 0 ? addressWhere : undefined,
                include: [
                    {
                        model: City,
                        as: 'city',
                        attributes: { exclude: ["EST_INT_ID"] },
                        where: Object.keys(cityWhere).length > 0 ? cityWhere : undefined
                    }
                ]
            }
        ];

        if (filters.ownerId) {
            includes.push({
                model: User,
                as: 'residentsAndOwners',
                where: { id: filters.ownerId },
                attributes: [],
                through: { attributes: [] }
            });
        }

        return Property.findAll({
            where,
            include: includes,
            order: [['name', 'ASC']]
        });
    }

    static async searchAdminProperties(filters: { id?: number, name?: string, email?: string, ownerName?: string }) {
        const where: any = { isActive: true };
        const userWhere: any = {};
        const personWhere: any = {};

        if (filters.id) where.id = filters.id;
        if (filters.name) where.name = { [Op.iLike]: `%${filters.name}%` };
        if (filters.email) userWhere.email = { [Op.iLike]: `%${filters.email}%` };
        if (filters.ownerName) personWhere.name = { [Op.iLike]: `%${filters.ownerName}%` };

        const hasUserFilter = Object.keys(userWhere).length > 0;
        const hasPersonFilter = Object.keys(personWhere).length > 0;

        return Property.findAll({
            where,
            include: [
                ...this.defaultInclude,
                {
                    model: User,
                    as: 'residentsAndOwners',
                    attributes: ['id', 'email'],
                    where: hasUserFilter ? userWhere : undefined,
                    required: hasUserFilter || hasPersonFilter,
                    through: { attributes: [] },
                    include: [
                        {
                            model: Person,
                            as: 'person',
                            attributes: ['name'],
                            where: hasPersonFilter ? personWhere : undefined,
                            required: hasPersonFilter
                        }
                    ]
                }
            ],
            order: [['name', 'ASC']]
        });
    }
}
