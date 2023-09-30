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
        message: 'confirmation code expired, invalid or this email has already been confirmed',
        field: 'code'
    },
    emailResending: {
        message: 'incorrect email or user with such email has already been confirmed',
        field: 'email'
    }
}