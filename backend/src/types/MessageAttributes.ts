import type Conversation from "../models/Conversation";
import type User from "../models/User";

export interface MessageAttributes {
    id: number;
    conversationId: number;
    senderId: number;
    content?: string | null;
    imageUrl?: string | null;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    conversation?: Conversation;
    sender?: User;
}
