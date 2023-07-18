import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../common/constants";
import {videosRepository} from "../repositories/videosRepository";

export const deleteDataRouter = Router()

//Удаляем все данные
deleteDataRouter.delete('/', (req: Request, res: Response) => {
    videosRepository.deleteAllVideos()
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})