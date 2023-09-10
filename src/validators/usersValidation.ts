import {body, CustomValidator, ValidationChain} from "express-validator";
import {usersErrors} from "./errors/usersErrors";
import {regexEmailCheck, regexLoginCheck} from "../utils/common/regex";
import {UserInDB} from "../types/usersTypes";
import {db} from "../repositories/db";

/**
 * Валидация логина. Логин должен соответствовать регулярке /^[a-zA-Z0-9_-]*$/ и пользователя с таким логином не должно быть в БД
 * Результат проверки значения на регулярное выражение кладем в checkLoginByRegex. Если значение не соответствует, то будет null
 * В searchUserByLogin кладем результат поиска в БД по логину. Если юзера с таким логином нет, то вернется null.
 * Если в checkLoginByRegex null, а в searchUserByLogin НЕ null (юзера нашли), то валидацию такое значение не проходит, возвращаем ошибку. Текст ошибки дальше в цепочки валидации.
 * @param value login из body запроса
 */
const checkLogin: CustomValidator = async (value: string) => {
    const checkLoginByRegex: RegExpMatchArray | null = value.match(regexLoginCheck)
    const searchUserByLogin: UserInDB | null = await db.usersCollection.findOne({login: value})
    if (checkLoginByRegex === null || searchUserByLogin !== null) {
        throw new Error()
    }
    return true
}
/**
 * Валидация email. Email должен соответствовать регулярке /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ и пользователя с таким email не должно быть в БД
 * Результат проверки значения на регулярное выражение кладем в checkEmailByRegex. Если значение не соответствует, то будет null
 * В searchUserByEmail кладем результат поиска в БД по email Если юзера с таким email-ом нет, то вернется null.
 * Если в checkEmailByRegex null, а в searchUserByEmail НЕ null (юзера нашли), то валидацию такое значение не проходит, возвращаем ошибку. Текст ошибки дальше в цепочки валидации.
 * @param value email из body запрос
 */
const checkEmail: CustomValidator = async (value: string) => {
    const checkEmailByRegex: RegExpMatchArray | null = value.match(regexEmailCheck)
    const searchUserByEmail: UserInDB | null = await db.usersCollection.findOne({email: value})
    if (checkEmailByRegex === null || searchUserByEmail !== null) {
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