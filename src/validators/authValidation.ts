import {body, CustomValidator, ValidationChain} from "express-validator";
import {authErrors} from "./errors/authErrors";
import {regexEmailCheck} from "../utils/common/regex";
import {UserInDB} from "../types/usersTypes";
import {DB_RESULTS} from "../utils/common/constants";
import {usersRepository} from "../repositories/usersRepository";

/**
 * Проверяем, что email соответствует нужном формату по регулярному выражению
 * Ищем юзера по email, если не находим, то возвращаем ошибку. Текст ошибки дальше в цепочке валидации
 * Если юзер есть, но он уже подтвержденный, то возвращаем ошибку. Подтвержденному пользователю не нужно повторно код отправлять
 * @param value email из тела запроса
 */
const checkEmail: CustomValidator = async (value: string) => {
    const checkEmailByRegex: RegExpMatchArray | null = value.match(regexEmailCheck)
    if (checkEmailByRegex === null) {
        throw new Error()
    }
    const foundUser: UserInDB | DB_RESULTS.NOT_FOUND = await usersRepository.foundUserByLoginOrEmail(value)
    if (foundUser === DB_RESULTS.NOT_FOUND) {
        throw new Error()
    }
    if (foundUser.isConfirmed) {
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