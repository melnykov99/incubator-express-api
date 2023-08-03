import {Request, Response, Router} from "express";
import {DB_RESULTS, HTTP_STATUSES} from "../common/constants";
import {videosService} from "../services/videosService";
import {VideoOutput} from "../types/videosTypes";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/requestGenerics";
import {GetDeleteVideoById} from "../dto/videos/GetDeleteVideoById";
import {CreateUpdateVideo} from "../dto/videos/CreateUodateVideo";
import {videosValidation} from "../validators/videosValidation";
import {validator} from "../validators/validator";
import {basicAuth} from "../middlewares/basicAuth";

export const videosRouter = Router()

videosRouter.get('/', (req: Request, res: Response) => {
    const videos: VideoOutput[] = videosService.getAllVideos()
    res.status(HTTP_STATUSES.OK_200).send(videos)
})

videosRouter.get('/:id', (req: RequestWithParams<GetDeleteVideoById>, res: Response) => {
    const video: VideoOutput | DB_RESULTS.NOT_FOUND = videosService.getVideoById(req.params.id as string)
    if (video === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(video)
})

videosRouter.post('/', basicAuth, validator(videosValidation), (req: RequestWithBody<CreateUpdateVideo>, res: Response) => {
    const createdVideo: VideoOutput = videosService.createVideo(req)
    res.status(HTTP_STATUSES.CREATED_201).send(createdVideo)
})

videosRouter.put('/:id', basicAuth, validator(videosValidation), (req: RequestWithParamsAndBody<GetDeleteVideoById, CreateUpdateVideo>, res: Response) => {
    const updateResult: DB_RESULTS = videosService.updateVideo(req)
    if (updateResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

videosRouter.delete('/:id', basicAuth, (req: RequestWithParams<GetDeleteVideoById>, res: Response) => {
    const deleteResult: DB_RESULTS = videosService.deleteVideoById(req.params.id as string)
    if (deleteResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})