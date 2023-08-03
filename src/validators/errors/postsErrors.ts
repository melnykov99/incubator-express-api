import {ErrorsObject} from "../../types/errorsTypes";

export const postsErrors: ErrorsObject = {
    title: {
        message: 'title must be string with a maximum length of 30 characters',
        field: 'title'
    },
    shortDescription: {
        message: 'shortDescription must be string with a maximum length of 100 characters',
        field: 'shortDescription'
    },
    content: {
        message: 'content must be string with a maximum length of 1000 characters',
        field: 'content'
    },
    blogId: {
        message: 'blogId must be string',
        field: 'blogId'
    },
    blogIdNotFound: {
        message: 'blogId not found',
        field: 'blogId'
    }
}