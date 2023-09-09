export type CommentatorInfo = {
    userId: string,
    userLogin: string
}

export type CommentOutput = {
    id: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string
}
export type CommentsViewModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: CommentOutput[]
}
export type CommentInDB = {
    id: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string,
    postId: string
}