import {ErrorsObject} from "../../types/errorsTypes";

export const blogsErrors: ErrorsObject = {
    name: {
        message: 'name must be string with a maximum length of 15 characters',
        field: 'name'
    },
    description: {
        message: 'description must be string with a maximum length of 500 characters',
        field: 'description'
    },
    websiteUrl: {
        message: 'websiteUrl must be string with a maximum length of 100 characters and be in url format. For example https://www.google.com/',
        field: 'websiteUrl'
    }
}