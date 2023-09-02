export type UserInDB = {
    id: string,
    login: string,
    email: string,
    passwordHash: string,
    createdAt: string
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