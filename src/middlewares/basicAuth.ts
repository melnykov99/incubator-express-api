import {Request, Response, NextFunction} from "express";
import {HTTP_STATUSES} from "../utils/common/constants";

/**
 * Проверка авторизации пользователя. В запросе должна быть basic авторизация с значением admin:qwerty
 * Если авторизацию не прошли, то возвращаем 401 статус
 * Если авторизация пройдна, то вызываем следуюущую мидлвару
 * @param req запрос Request
 * @param res ответ Response
 * @param next вызов следующей функции после мидлвары
 */
export function basicAuth(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization !== 'Basic YWRtaW46cXdlcnR5') {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    next()
}