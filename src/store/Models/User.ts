export interface IUserDTO{
    username: string,
    password: string
}
export default interface IUser {
    id: string,
    firstName: string,
    lastName: string,
    loginName: string,
    password: string,
    phoneNo: string,
    email: string,
    roleName: string,
    companyId: string,
    companyName: string,
    isAuthenticated: boolean,
    token: string,
    refreshToken: string,
    expiration: Date,
    filePreference: string
}

