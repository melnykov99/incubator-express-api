import {body, ValidationChain} from "express-validator";
import {authErrors} from "./errors/authErrors";

export const authValidation: ValidationChain[] = [
    body('loginOrEmail').isString().withMessage(authErrors.loginOrEmail),
    body('password').isString().withMessage(authErrors.password)
]