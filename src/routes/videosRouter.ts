import {Request, Response, Router} from "express";
import {HTTP_STATUSES, SEARCH_RESULTS} from "../common/constants";
import {videosService} from "../services/videosService";
import {VideoOutput} from "../types/videosTypes";
import {RequestWithParams} from "../types/commonTypes";

export const videosRouter = Router()

videosRouter.get('/', (req: Request, res: Response) => {
    const videos: VideoOutput[] = videosService.getAllVideos()
    res.status(HTTP_STATUSES.OK_200).send(videos)
})
videosRouter.get('/:id', (req: RequestWithParams<{ id: string }>, res: Response) => {
    const video: VideoOutput | SEARCH_RESULTS.NOT_FOUND = videosService.getVideoById(req.query.id as string)
    if(video === SEARCH_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(video)
})