import {Response, Router} from "express";
import {DB_RESULTS, HTTP_STATUSES} from "../common/constants";
import {videosService} from "../services/videosService";
import {VideoOutput, VideoViewModel} from "../types/videosTypes";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery} from "../types/requestGenerics";
import {GetDeleteVideoById} from "../dto/videos/GetDeleteVideoById";
import {CreateUpdateVideo} from "../dto/videos/CreateUpdateVideo";
import {videosValidation} from "../validators/videosValidation";
import {validator} from "../validators/validator";
import {GetVideosWithQuery} from "../dto/videos/GetVideosWithQuery";

export const videosRouter = Router()

videosRouter.get('/', async (req: RequestWithQuery<GetVideosWithQuery>, res: Response) => {
    const videos: VideoViewModel = await videosService.getVideos(req)
    res.status(HTTP_STATUSES.OK_200).send(videos)
})

videosRouter.get('/:id', async (req: RequestWithParams<GetDeleteVideoById>, res: Response) => {
    const video: VideoOutput | DB_RESULTS.NOT_FOUND = await videosService.getVideoById(req.params.id as string)
    if (video === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(video)
})

videosRouter.post('/', validator(videosValidation), async (req: RequestWithBody<CreateUpdateVideo>, res: Response) => {
    const createdVideo: VideoOutput = await videosService.createVideo(req)
    res.status(HTTP_STATUSES.CREATED_201).send(createdVideo)
})

videosRouter.put('/:id', validator(videosValidation), async (req: RequestWithParamsAndBody<GetDeleteVideoById, CreateUpdateVideo>, res: Response) => {
    const updateResult: DB_RESULTS = await videosService.updateVideo(req)
    if (updateResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

videosRouter.delete('/:id', async (req: RequestWithParams<GetDeleteVideoById>, res: Response) => {
    const deleteResult: DB_RESULTS = await videosService.deleteVideoById(req.params.id as string)
    if (deleteResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})