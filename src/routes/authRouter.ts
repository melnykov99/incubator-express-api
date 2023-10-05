import {Request, Response, Router} from "express";
import {RequestWithBody} from "../types/requestGenerics";
import {LoginUser} from "../dto/auth/LoginUser";
import {validator} from "../validators/validator";
import {emailResendingValidation, loginValidation} from "../validators/authValidation";
import {AUTH, HTTP_STATUSES} from "../utils/common/constants";
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
    const tokens: AccessRefreshToken | AUTH.USER_NOT_FOUND | AUTH.UNCONFIRMED_USER | AUTH.INVALID_PASSWORD = await authService.loginUser(loginOrEmail, password)
    if (tokens === AUTH.USER_NOT_FOUND || tokens === AUTH.UNCONFIRMED_USER || tokens === AUTH.INVALID_PASSWORD) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    res.cookie('refreshToken', tokens.refreshToken, {httpOnly: true, secure: true})
    res.status(HTTP_STATUSES.OK_200).send({accessToken: tokens.accessToken})
})

// регистрация пользователя. Создание записи в БД и отправка письма с кодом на почту для подтверждения
authRouter.post('/registration', validator(usersValidation), async (req: RequestWithBody<CreateUser>, res: Response) => {
    const {login, password, email} = req.body
    const registrationResult: AUTH.USER_NOT_CREATED | AUTH.USER_CREATED = await authService.registrationUser(login, password, email)
    if (registrationResult === AUTH.USER_NOT_CREATED) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

// подтверждение пользователя. Проверяем код из тела запроса
authRouter.post('/registration-confirmation', async (req: RequestWithBody<RegistrationConfirmation>, res: Response) => {
    const confirmationResult: AUTH.USER_NOT_FOUND | AUTH.USER_ALREADY_CONFIRMED | AUTH.CONFIRMATION_CORE_EXPIRED | AUTH.SUCCESSFUL_CONFIRMATION = await authService.confirmationUser(req.body.code)
    if (confirmationResult === AUTH.SUCCESSFUL_CONFIRMATION) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        return
    }
    res.status(HTTP_STATUSES.BAD_REQUEST_400).send({"errorsMessages": [authErrors.confirmationCode]})
})

// повторная отправка письма с кодом подтверждения на email пользователя.
authRouter.post('/registration-email-resending', validator(emailResendingValidation), async (req: RequestWithBody<RegistrationEmailResending>, res: Response) => {
    const resendingResult: AUTH.USER_NOT_FOUND | AUTH.USER_ALREADY_CONFIRMED | AUTH.SUCCESSFUL_RESENDING = await authService.registrationEmailResending(req.body.email)
    if (resendingResult === AUTH.SUCCESSFUL_RESENDING) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        return
    }
    res.status(HTTP_STATUSES.BAD_REQUEST_400).send({"errorsMessages": [authErrors.email]})
})
// роут для выдачи новой пары токенов
authRouter.post('/refresh-token', async (req: Request, res: Response) => {
    const tokens: AUTH.REFRESHTOKEN_IS_MISSING | AUTH.REFRESHTOKEN_FAILED_VERIFICATION | AUTH.USER_NOT_FOUND | AccessRefreshToken = await authService.refreshTokens(req.cookies.refreshToken)
    if (tokens === AUTH.REFRESHTOKEN_IS_MISSING || tokens === AUTH.REFRESHTOKEN_FAILED_VERIFICATION || tokens === AUTH.USER_NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    res.cookie('refreshToken', tokens.refreshToken, {httpOnly: true, secure: true})
    res.status(HTTP_STATUSES.OK_200).send({accessToken: tokens.accessToken})
})
// роут выхода юзера из ЛК. Делаем refreshToken неактуальным. При логине выдадим новый.
authRouter.post('/logout', async (req: Request, res: Response) => {
    const logoutResult: AUTH.REFRESHTOKEN_IS_MISSING | AUTH.REFRESHTOKEN_FAILED_VERIFICATION | AUTH.USER_NOT_FOUND | AUTH.SUCCESSFUL_LOGOUT = await authService.logout(req.cookies.refreshToken)
    if (logoutResult === AUTH.SUCCESSFUL_LOGOUT) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        return
    }
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
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