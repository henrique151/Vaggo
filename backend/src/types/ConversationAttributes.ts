import Conversation from "../models/Conversation";
import type Message from "../models/Message";
import Person from "../models/Person";
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


export type ConversationWithParticipants = Conversation & {
    requester?: User & { person?: Person };
    owner?: User & { person?: Person };
    property?: Property;
    messages?: Message[];
};