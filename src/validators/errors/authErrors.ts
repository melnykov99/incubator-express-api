import {ErrorsObject} from "../../types/errorsTypes";

export const authErrors: ErrorsObject = {
    loginOrEmail: {
        message: 'loginOrEmail must be string',
        field: 'loginOrEmail'
    },
    password: {
        message: 'password must be string',
        field: 'password'
    },
    confirmationCode: {
        message: 'confirmationCode expired, invalid or this email has already been confirmed',
        field: 'confirmationCode'
    }
}