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
                ],

            }
        ];
    }

    static async createProperty(propertyData: CreatePropertyInput, userId: number, files: FileData[]) {
        if (!files || files.length === 0) throw new Error('PROPERTY_REQUIRES_AT_LEAST_ONE_IMAGE');
        if (files.length > 3) throw new Error('PROPERTY_IMAGE_LIMIT');

        const transaction = await sequelize.transaction();

        let uploadedPublicIds: string[] = [];

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

            const imageUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const uploadResult = await ImageService.uploadPropertyImage(files[i], userId, property.id, i);
                uploadedPublicIds.push(uploadResult.public_id);
                imageUrls.push(uploadResult.secure_url);
            }

            await property.update({ images: imageUrls }, { transaction });

            await transaction.commit();
            return this.getPropertyById(property.id);

        } catch (error) {
            await transaction.rollback();
            uploadedPublicIds.forEach(id => ImageService.deleteImage(id).catch(console.error));
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
            include: this.defaultInclude,
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
                    attributes: [],        // não retorna dados do user, só filtra
                    through: { attributes: [] }, // esconde a tabela pivô PropertyUser
                }
            ],
        });
    }
    static async deleteProperty(id: number) {
        const transaction = await sequelize.transaction();

        try {
            const property = await Property.findByPk(id, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            // Opção A: Soft Delete (Recomendado para manter histórico)
            // await property.update({ isActive: false });

            const addressId = property.addressId;

            // Buscar userId via PropertyUser
            const propertyUser = await PropertyUser.findOne({
                where: { propertyId: id },
                transaction
            });
            const userId = propertyUser?.userId;

            await property.destroy({ transaction });
            await Address.destroy({ where: { id: addressId }, transaction });

            await transaction.commit();

            // Deletar pasta de propriedades do usuário se houver
            if (userId) {
                await ImageService.deleteFolder(`vaggo/users/user_${userId}/properties`);
            }
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateProperty(id: number, propertyData: CreatePropertyInput, newFiles: FileData[], imagesToRemove: string[] = []) {
        const transaction = await sequelize.transaction();
        let uploadedPublicIds: string[] = [];

        try {
            const property = await Property.findByPk(id, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            const externalData = await ExternalAddressService.getAddressByCep(propertyData.zipCode);
            if (!externalData) throw new Error('EXTERNAL_API_FAILURE');

            const city = await City.findByPk(externalData.cityIbgeCode, { transaction });
            if (!city) throw new Error('CITY_NOT_FOUND');

            // Buscar userId via PropertyUser
            const propertyUser = await PropertyUser.findOne({
                where: { propertyId: id },
                transaction
            });
            const userId = propertyUser?.userId;
            if (!userId) throw new Error('PROPERTY_OWNER_NOT_FOUND');

            let currentImages = property.images || [];
          
            const toRemove = imagesToRemove.map(url => url.trim());

            currentImages = currentImages.filter(url => !toRemove.includes(url));

            if ((currentImages.length + newFiles.length) < 1) throw new Error('PROPERTY_REQUIRES_AT_LEAST_ONE_IMAGE');
            if ((currentImages.length + newFiles.length) > 3) throw new Error('PROPERTY_IMAGE_LIMIT');

            // Upload das novas
            const newImageUrls: string[] = [];
            for (let i = 0; i < newFiles.length; i++) {
                const result = await ImageService.uploadPropertyImage(newFiles[i], userId, property.id, currentImages.length + i);
                uploadedPublicIds.push(result.public_id);
                newImageUrls.push(result.secure_url);
            }

            const finalImages = [...currentImages, ...newImageUrls];

            await property.update({
                ...propertyData,
                images: finalImages,
                latitude: externalData.latitude,
                longitude: externalData.longitude
            }, { transaction })

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
            })

            await transaction.commit();

            imagesToRemove.forEach(url => {
                const publicId = ImageService.extractPublicId(url);
                if (publicId) ImageService.deleteImage(publicId).catch(console.error);
            });
            return this.getPropertyById(id);

        } catch (error) {
            await transaction.rollback();
            uploadedPublicIds.forEach(id => ImageService.deleteImage(id).catch(console.error));
            throw error;
        }
    }

}
