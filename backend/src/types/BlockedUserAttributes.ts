import type User from "../models/User";

export interface BlockedUserAttributes {
    id: number;
    blockerId: number;
    blockedId: number;
    createdAt?: Date;
    updatedAt?: Date;
    blocker?: User;
    blocked?: User;
}
