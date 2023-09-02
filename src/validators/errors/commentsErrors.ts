import {ErrorsObject} from "../../types/errorsTypes";

export const commentsErrors: ErrorsObject = {
    content: {
        message: 'content must be string with a minimum length 20 characters and maximum length of 300 characters',
        field: 'content'
    }
}