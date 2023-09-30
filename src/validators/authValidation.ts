import {body, CustomValidator, ValidationChain} from "express-validator";
import {authErrors} from "./errors/authErrors";
import {regexEmailCheck} from "../utils/common/regex";

/**
 * Проверяем, что email соответствует нужном формату по регулярному выражению
 * Если не соответствует, то возвращаем ошибку. Текст ошибки дальше в цепочке валидации
 * @param value email из тела запроса
 */
const checkEmail: CustomValidator = async (value: string) => {
    const checkEmailByRegex: RegExpMatchArray | null = value.match(regexEmailCheck)
    if (checkEmailByRegex === null) {
        throw new Error()
    }
    return true
}

/**
 * Содержит цепочки валидаций для проверки значений из req.body. В этом запросе просто проверка на строку.
 */
export const loginValidation: ValidationChain[] = [
    body('loginOrEmail')
        .isString().withMessage(authErrors.loginOrEmail).bail()
        .trim().notEmpty().withMessage(authErrors.loginOrEmail),
    body('password')
        .isString().withMessage(authErrors.password).bail()
        .trim().notEmpty().withMessage(authErrors.loginOrEmail)
]
export const emailResendingValidation: ValidationChain[] = [
    body('email')
        .isString().withMessage(authErrors.emailResending).bail()
        .custom(checkEmail).withMessage(authErrors.emailResending)
]