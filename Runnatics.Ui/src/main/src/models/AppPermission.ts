export enum AppPermission {
    Admin = 'Admin',
    SuperUser = 'SuperUser',
    Ops = 'Ops',
    Support = 'Support',
    Readonly = 'Readonly'
}

export const appPermissions = Object.values(AppPermission);