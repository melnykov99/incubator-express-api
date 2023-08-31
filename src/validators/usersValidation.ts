import {body, CustomValidator, ValidationChain} from "express-validator";
import {usersErrors} from "./errors/usersErrors";
import {regexEmailCheck, regexLoginCheck} from "../utils/common/regex";

/**
 * Проверка соответствия login регулярному выражению из документации
 * @param value login из body запроса
 */
const checkLogin: CustomValidator = (value: string) => {
    return value.match(regexLoginCheck)
}
/**
 * Проверка соответствия email регулярному выражению из документации
 * @param value email из body запрос
 */
const checkEmail: CustomValidator = (value: string) => {
    return value.match(regexEmailCheck)
}
/**
 * Содержит цепочки валидаций для проверки значений из req.body
 * В каждом условии bail() для прерывания цепочки валидации, чтобы не было дублей ошибок при несоблюдении нескольких условий у значения
 */
export const usersValidation: ValidationChain[] = [
    body('login')
        .isString().withMessage(usersErrors.login).bail()
        .isLength({min: 3, max: 10}).withMessage(usersErrors.login).bail()
        .custom(checkLogin).withMessage(usersErrors.login),
    body('password')
        .isString().withMessage(usersErrors.password).bail()
        .isLength({min: 6, max: 20}).withMessage(usersErrors.password),
    body('email')
        .isString().withMessage(usersErrors.email).bail()
        .custom(checkEmail).withMessage(usersErrors.email)
]