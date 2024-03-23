export interface IUserDTO{
    username: string,
    password: string
}
export default interface IUser {
    id: number,
    firstname: string,
    lastname: string,
    loginname: string,
    password: string,
    phoneno: string,
    email: string,
    rolename: string,
    companyname: string,
    isAuthenticated: boolean,
    token: string,
    refreshtoken: string,
    expiration: Date
}

