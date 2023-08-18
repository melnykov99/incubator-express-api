export type PostInput = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
}
export type PostOutput = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string
}