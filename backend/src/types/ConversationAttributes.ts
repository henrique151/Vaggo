import type Message from "../models/Message";
import type Property from "../models/Property";
import type User from "../models/User";

export interface ConversationAttributes {
    id: number;
    solicitationId: number;
    propertyId: number;
    userRequesterId: number;
    userOwnerId: number;
    deletedBy: number[];
    createdAt?: Date;
    updatedAt?: Date;
    property?: Property;
    requester?: User;
    owner?: User;
    messages?: Message[];
}
