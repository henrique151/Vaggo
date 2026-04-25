export interface UserAttributes {
    id: number;
    email: string;
    password: string;
    lastLogin: Date;
    isBlocked: boolean;
    isAdmin: boolean;
    permissionLevel: '1' | '2' | '3';
    avatarUrl: string;
    personId: number;
}
