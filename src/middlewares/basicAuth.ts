import {Request, Response, NextFunction} from "express";
import {HTTP_STATUSES} from "../common/constants";

export function basicAuth(req: Request, res: Response, next: NextFunction) {
    if(req.headers.authorization !== 'Basic YWRtaW46cXdlcnR5'){
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    next()
}