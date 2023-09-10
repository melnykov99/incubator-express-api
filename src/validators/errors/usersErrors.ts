import {ErrorsObject} from "../../types/errorsTypes";

export const usersErrors: ErrorsObject = {
    login: {
        message: 'This login has already been registered or it does not match the format. Login must be string with a minimum length 3 characters and maximum length of 10 characters. May contain Latin letters, numbers, hyphen and underscore',
        field: 'login'
    },
    password: {
        message: 'password must be string with a minimum length 6 characters and maximum length of 20 characters',
        field: 'password'
    },
    email: {
        message: 'This email has already been registered or it does not match the format. Email must be string and be in email format',
        field: 'email'
    }
}