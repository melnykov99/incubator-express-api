import {Response, Router} from "express";
import {RequestWithBody} from "../types/requestGenerics";
import {LoginUser} from "../dto/auth/LoginUser";
import {validator} from "../validators/validator";
import {loginValidation} from "../validators/authValidation";
import {DB_RESULTS, HTTP_STATUSES} from "../utils/common/constants";
import {authService} from "../services/authService";

export const authRouter = Router()
authRouter.post('/login', validator(loginValidation), async (req: RequestWithBody<LoginUser>, res: Response) => {
    const loginResult: DB_RESULTS.DATA_CORRECT | DB_RESULTS.INVALID_DATA = await authService.loginUser(req)
    if (loginResult === DB_RESULTS.INVALID_DATA) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})