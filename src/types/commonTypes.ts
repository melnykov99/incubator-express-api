export type PagSortValues = {
    sortBy: string,
    sortDirection: 1 | -1,
    pageNumber: number,
    pageSize: number,
    totalCount: number,
    pagesCount: number,
    skip: number,
    limit: number,
}

// этот тип проверяется в функции assertsJwtToken в jwtService
export type JwtToken = string & {__jwtTokenBrand: 'JwtToken'}
export type AccessRefreshToken = {accessToken: JwtToken, refreshToken: JwtToken}