export interface UserAttributes {
    id: number;
    email: string;
    password: string;
    type: string;
    lastLogin: Date;
    isBlocked: boolean;
    isAdmin: boolean;
    permissionLevel: '1' | '2' | '3';
    personId: number;
}
