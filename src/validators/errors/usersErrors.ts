import {ErrorsObject} from "../../types/errorsTypes";

export const usersErrors: ErrorsObject = {
    login: {
        message: 'login must be string with a minimum length 3 characters and maximum length of 10 characters. Must contain Latin letters and a number',
        field: 'login'
    },
    password: {
        message: 'password must be string with a minimum length 6 characters and maximum length of 20 characters',
        field: 'password'
    },
    email: {
        message: 'email must be string and be in email format',
        field: 'email'
    }
}