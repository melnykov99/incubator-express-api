import {Request, Response, Router} from "express";
import {RequestWithBody} from "../types/requestGenerics";
import {LoginUser} from "../dto/auth/LoginUser";
import {validator} from "../validators/validator";
import {loginValidation} from "../validators/authValidation";
import {DB_RESULTS, HTTP_STATUSES} from "../utils/common/constants";
import {authService} from "../services/authService";
import {jwtAuth} from "../middlewares/jwtAuth";

export const authRouter = Router()
authRouter.post('/login', validator(loginValidation), async (req: RequestWithBody<LoginUser>, res: Response) => {
    const {loginOrEmail, password} = req.body
    const loginResult: { accessToken: string } | DB_RESULTS.INVALID_DATA = await authService.loginUser(loginOrEmail, password)
    if (loginResult === DB_RESULTS.INVALID_DATA) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(loginResult)
})
/**
 * Роут для проверки токена. Проверяем токен в мидлваре jwtAuth. Если токен валидный, то в req.user будет вся информация из БД о юзере
 * Никуда не обращаемся, просто выводим нужные данные из req в ответе
 */
authRouter.get('/me', jwtAuth, async (req: Request, res: Response) => {
    const user: { [key: string]: string } = {
        email: req.user.email,
        login: req.user.login,
        userId: req.user.id
    }
    res.status(HTTP_STATUSES.OK_200).send(user)
})