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

export const authRouter = Router()
authRouter.post('/login', validator(loginValidation), async (req: RequestWithBody<LoginUser>, res: Response) => {
    const {loginOrEmail, password} = req.body
    const loginResult: {
        accessToken: string
    } | DB_RESULTS.INVALID_DATA = await authService.loginUser(loginOrEmail, password)
    if (loginResult === DB_RESULTS.INVALID_DATA) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(loginResult)
})
authRouter.post('/registration', validator(usersValidation), async (req: RequestWithBody<CreateUser>, res: Response) => {
    const {login, password, email} = req.body
    const registrationResult: DB_RESULTS.SUCCESSFULLY_COMPLETED | DB_RESULTS.UNSUCCESSFULL = await authService.registrationUser(login, password, email)
    if (registrationResult === DB_RESULTS.UNSUCCESSFULL) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
authRouter.post('/registration-confirmation', async (req: RequestWithBody<RegistrationConfirmation>, res: Response) => {
    const confirmationResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.UNSUCCESSFULL | DB_RESULTS.SUCCESSFULLY_COMPLETED = await authService.confirmationUser(req.body.code)
    if (confirmationResult === DB_RESULTS.SUCCESSFULLY_COMPLETED) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        return
    }
    res.status(HTTP_STATUSES.BAD_REQUEST_400).send({"errorsMessages": [authErrors.confirmationCode]})
})
authRouter.post('/registration-email-resending', validator(emailResendingValidation), async (req: RequestWithBody<RegistrationEmailResending>, res: Response) => {
    // здесь не будет NOT_FOUND потому что на этапе валидации проверяли наличие юзера
    const resendingResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED = await authService.registrationEmailResending(req.body.email)
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
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