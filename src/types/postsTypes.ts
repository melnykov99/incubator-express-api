export type PostOutput = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string
}

export type PostViewModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: PostOutput[]
}