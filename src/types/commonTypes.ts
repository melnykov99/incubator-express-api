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