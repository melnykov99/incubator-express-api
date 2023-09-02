import {body, ValidationChain} from "express-validator";
import {authErrors} from "./errors/authErrors";

/**
 * Содержит цепочки валидаций для проверки значений из req.body. В этом запросе просто проверка на строку.
 */
export const loginValidation: ValidationChain[] = [
    body('loginOrEmail').isString().withMessage(authErrors.loginOrEmail),
    body('password').isString().withMessage(authErrors.password)
]