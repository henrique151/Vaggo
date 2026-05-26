export enum Roles {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    USER = 'USER',
}

export const ROLE_HIERARCHY: Record<Roles, number> = {
    [Roles.USER]: 1,
    [Roles.MANAGER]: 2,
    [Roles.ADMIN]: 3,
};

export function normalizeRole(permissionLevel?: string | null, isAdmin?: boolean): Roles {
    if (isAdmin) return Roles.ADMIN;

    switch (permissionLevel) {
        case Roles.ADMIN:
        case '3':
            return Roles.ADMIN;
        case Roles.MANAGER:
        case '2':
            return Roles.MANAGER;
        case Roles.USER:
        case '1':
        default:
            return Roles.USER;
    }
}
