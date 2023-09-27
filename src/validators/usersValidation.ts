import {body, CustomValidator, ValidationChain} from "express-validator";
import {usersErrors} from "./errors/usersErrors";
import {regexEmailCheck, regexLoginCheck} from "../utils/common/regex";
import {UserInDB} from "../types/usersTypes";
import {usersRepository} from "../repositories/usersRepository";
import {DB_RESULTS} from "../utils/common/constants";

/**
 * Валидация логина. Логин должен соответствовать регулярке /^[a-zA-Z0-9_-]*$/ и пользователя с таким логином не должно быть в БД
 * Результат проверки значения на регулярное выражение кладем в checkLoginByRegex. Если значение не соответствует, то будет null
 * В случае с null валидацию не проходит, возвращаем ошибку. Текст ошибки дальше в цепочке валидации.
 * В foundUser кладем результат поиска в БД по логину. Если юзера с таким логином не найдем то вернем DB_RESULTS.NOT_FOUND
 * Если юзера нашли и значение foundUser НЕ DB_RESULTS.NOT_FOUND, то валидация не пройдена, возвращаем ошибку.
 * @param value login из body запроса
 */
const checkLogin: CustomValidator = async (value: string) => {
    const checkLoginByRegex: RegExpMatchArray | null = value.match(regexLoginCheck)
    if (checkLoginByRegex === null) {
        throw new Error()
    }
    const foundUser: UserInDB | DB_RESULTS.NOT_FOUND = await usersRepository.foundUserByLoginOrEmail(value)
    if (foundUser !== DB_RESULTS.NOT_FOUND) {
        throw new Error()
    }
    return true
}
/**
 * Валидация email. Email должен соответствовать регулярке /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ и пользователя с таким email не должно быть в БД
 * Результат проверки значения на регулярное выражение кладем в checkEmailByRegex. Если значение не соответствует, то будет null
 * В случае с null валидацию не проходит, возвращаем ошибку. Текст ошибки дальше в цепочке валидации.
 * В foundUser кладем результат поиска в БД по email. Если юзера с таким email не найдем, то вернем DB_RESULTS.NOT_FOUND
 * Если юзера нашли и значение foundUser НЕ DB_RESULTS.NOT_FOUND, то валидация не пройдена, возвращаем ошибку.
 * @param value email из body запрос
 */
const checkEmail: CustomValidator = async (value: string) => {
    const checkEmailByRegex: RegExpMatchArray | null = value.match(regexEmailCheck)
    if (checkEmailByRegex === null) {
        throw new Error()
    }
    const foundUser: UserInDB | DB_RESULTS.NOT_FOUND = await usersRepository.foundUserByLoginOrEmail(value)
    if (foundUser !== DB_RESULTS.NOT_FOUND) {
        throw new Error()
    }
    return true
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