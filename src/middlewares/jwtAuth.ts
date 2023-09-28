import {DB_RESULTS, HTTP_STATUSES} from "../utils/common/constants";
import {NextFunction, Request, Response} from "express";
import {jwtService} from "../utils/common/jwtService";
import {usersService} from "../services/usersService";
import {UserOutput} from "../types/usersTypes";

/**
 * мидлавара jwt авторизации
 * Если в headers.authorization ничего не преедали. то сразу прерываем запрос и возвращаем 401
 * У нас bearer авторизация, поэтому в headers.authorization будет строка вида bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 * Поэтому сплитим и в токен кладем вторую часть строки
 * Обращаемся к функции getUserIdByToken и ищем юзера по этому токену. Если юзера нет или токен невалидный, то прерываем запрос, возвращая 401
 * Если id юзера получили, то обращаемся к БД и достаем этого юзера по id
 * Если юзера не нашли, то прерываем запрос и возвращаем 401
 * Если юзер найден, то кладем данные о нем в req.user. Данные соответтсвенно UserOutput. И передаем выполнение запроса дальше
 * @param req
 * @param res
 * @param next
 */
export const jwtAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    const token: string = req.headers.authorization.split(' ')[1]
    const userId: string | null = await jwtService.getUserIdByToken(token)
    if (!userId) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    const foundUser: UserOutput | DB_RESULTS.NOT_FOUND = await usersService.getUserById(userId)
    if (foundUser === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    req.user = foundUser
    next()
}