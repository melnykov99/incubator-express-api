import express, {Request, Response} from 'express'
import {HTTP_STATUSES} from "./common/constants";

export const app = express()

app.get('/', (req: Request, res: Response) => {
    res.status(HTTP_STATUSES.OK_200).send('Main Page')
})
app.get('/videos', (req: Request, res: Response) => {
    res.status(HTTP_STATUSES.OK_200).send([])
})