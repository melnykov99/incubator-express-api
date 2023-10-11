import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../utils/common/constants";


export const securityRouter = Router()

securityRouter.get('/devices', async (req: Request, res: Response) => {


    res.status(HTTP_STATUSES.OK_200).send('sessions')
})

securityRouter.delete('/devices', async (req: Request, res: Response) => {

})

securityRouter.delete('/devices/:deviceId', async (req: Request, res: Response) => {

})