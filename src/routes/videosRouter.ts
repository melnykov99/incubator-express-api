import {Request, Response, Router} from "express";
import {DB_RESULTS, HTTP_STATUSES} from "../common/constants";
import {videosService} from "../services/videosService";
import {VideoOutput} from "../types/videosTypes";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/commonTypes";
import {GetVideoById} from "../dto/videos/GetVideoById";
import {CreateUpdateVideo} from "../dto/videos/CreateVideo";

export const videosRouter = Router()

videosRouter.get('/', (req: Request, res: Response) => {
    const videos: VideoOutput[] = videosService.getAllVideos()
    res.status(HTTP_STATUSES.OK_200).send(videos)
})

videosRouter.get('/:id', (req: RequestWithParams<GetVideoById>, res: Response) => {
    const video: VideoOutput | DB_RESULTS.NOT_FOUND = videosService.getVideoById(req.params.id as string)
    if (video === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(video)
})

videosRouter.post('/', (req: RequestWithBody<CreateUpdateVideo>, res: Response) => {
    const createdVideo: VideoOutput = videosService.createVideo(req)
    res.status(HTTP_STATUSES.CREATED_201).send(createdVideo)
})

videosRouter.put('/:id', (req: RequestWithParamsAndBody<GetVideoById, CreateUpdateVideo>, res: Response) => {
    const updateResult: DB_RESULTS = videosService.updateVideo(req)
    if (updateResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

videosRouter.delete('/:id', (req: RequestWithParams<GetVideoById>, res: Response) => {
    const deletionResult: DB_RESULTS = videosService.deleteVideoById(req.params.id as string)
    if (deletionResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})