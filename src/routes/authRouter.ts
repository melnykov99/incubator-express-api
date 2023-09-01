import {Response, Router} from "express";
import {RequestWithBody} from "../types/requestGenerics";
import {Login} from "../dto/auth/Login";
import {validator} from "../validators/validator";
import {authValidation} from "../validators/authValidation";
import {DB_RESULTS, HTTP_STATUSES} from "../utils/common/constants";
import {authService} from "../services/authService";

export const authRouter = Router()
authRouter.post('/login', validator(authValidation), async (req: RequestWithBody<Login>, res: Response) => {
    const authResult: DB_RESULTS.DATA_CORRECT | DB_RESULTS.INVALID_DATA = await authService.authUser(req)
    if (authResult === DB_RESULTS.INVALID_DATA) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})