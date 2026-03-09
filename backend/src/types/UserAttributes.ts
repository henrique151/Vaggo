export interface UserAttributes {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    age: number;
    password: string;
    created_at?: Date;
    updated_at?: Date;
}
