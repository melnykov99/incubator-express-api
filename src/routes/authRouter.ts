import {Request, Response, Router} from "express";
import {RequestWithBody} from "../types/requestGenerics";
import {LoginUser} from "../dto/auth/LoginUser";
import {validator} from "../validators/validator";
import {emailResendingValidation, loginValidation} from "../validators/authValidation";
import {DB_RESULTS, HTTP_STATUSES} from "../utils/common/constants";
import {authService} from "../services/authService";
import {jwtAuth} from "../middlewares/jwtAuth";
import {usersValidation} from "../validators/usersValidation";
import {CreateUser} from "../dto/users/CreateUser";
import {RegistrationConfirmation} from "../dto/auth/RegistrationConfirmation";
import {RegistrationEmailResending} from "../dto/auth/RegistrationEmailResending";
import {authErrors} from "../validators/errors/authErrors";
import {AccessRefreshToken} from "../types/commonTypes";

export const authRouter = Router()

//авторизация созданного и подтвержденного пользователя. Возвращаем refreshToken в куках и accessToken в теле ответа.
authRouter.post('/login', validator(loginValidation), async (req: RequestWithBody<LoginUser>, res: Response) => {
    const {loginOrEmail, password} = req.body
    const tokens: AccessRefreshToken | DB_RESULTS.INVALID_DATA = await authService.loginUser(loginOrEmail, password)
    if (tokens === DB_RESULTS.INVALID_DATA) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    res.cookie('refreshToken', tokens.refreshToken, {httpOnly: true, secure: true})
    res.status(HTTP_STATUSES.OK_200).send({accessToken: tokens.accessToken})
})

// регистрация пользователя. Создание записи в БД и отправка письма с кодом на почту для подтверждения
authRouter.post('/registration', validator(usersValidation), async (req: RequestWithBody<CreateUser>, res: Response) => {
    const {login, password, email} = req.body
    const registrationResult: DB_RESULTS.SUCCESSFULLY_COMPLETED | DB_RESULTS.UNSUCCESSFULL = await authService.registrationUser(login, password, email)
    if (registrationResult === DB_RESULTS.UNSUCCESSFULL) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

// подтверждение пользователя. Проверяем код из тела запроса
authRouter.post('/registration-confirmation', async (req: RequestWithBody<RegistrationConfirmation>, res: Response) => {
    const confirmationResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.UNSUCCESSFULL | DB_RESULTS.SUCCESSFULLY_COMPLETED = await authService.confirmationUser(req.body.code)
    if (confirmationResult === DB_RESULTS.SUCCESSFULLY_COMPLETED) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        return
    }
    res.status(HTTP_STATUSES.BAD_REQUEST_400).send({"errorsMessages": [authErrors.confirmationCode]})
})

// повторная отправка письма с кодом подтверждения на email пользователя.
authRouter.post('/registration-email-resending', validator(emailResendingValidation), async (req: RequestWithBody<RegistrationEmailResending>, res: Response) => {
    const resendingResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.INVALID_DATA | DB_RESULTS.SUCCESSFULLY_COMPLETED = await authService.registrationEmailResending(req.body.email)
    if (resendingResult === DB_RESULTS.SUCCESSFULLY_COMPLETED) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        return
    }
    res.status(HTTP_STATUSES.BAD_REQUEST_400).send({"errorsMessages": [authErrors.email]})
})
// роут для выдачи новой пары токенов
authRouter.post('/refresh-token', async (req: Request, res: Response) => {
    const tokens: DB_RESULTS.INVALID_DATA | AccessRefreshToken = await authService.refreshTokens(req.cookies.refreshToken)
    if (tokens === DB_RESULTS.INVALID_DATA) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    res.cookie('refreshToken', tokens.refreshToken, {httpOnly: true, secure: true})
    res.status(HTTP_STATUSES.OK_200).send({accessToken: tokens.accessToken})
})

authRouter.post('/logout', async (req: Request, res: Response) => {

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