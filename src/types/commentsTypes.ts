export type CommentatorInfo = {
    userId: string,
    userLogin: string
}

export type CommentViewModel = {
    id: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string
}