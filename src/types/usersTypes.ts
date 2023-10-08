import {JwtToken} from "./commonTypes";

export type UserInDB = {
    id: string,
    login: string,
    email: string,
    passwordHash: string,
    createdAt: string
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean,
    refreshTokens?: [JwtToken]
}
export type UserOutput = {
    id: string,
    login: string,
    email: string,
    createdAt: string
}
export type UserViewModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: UserOutput[]
}