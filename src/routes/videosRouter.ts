import {Response, Router} from "express";
import {DB_RESULTS, HTTP_STATUSES} from "../utils/common/constants";
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
    const {sortBy, sortDirection, pageNumber, pageSize} = req.query
    const videos: VideoViewModel = await videosService.getVideos(sortBy, sortDirection, pageNumber, pageSize)
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
    const {
        title,
        author,
        canBeDownloaded,
        minAgeRestriction,
        publicationDate,
        availableResolutions
    } = req.body
    const createdVideo: VideoOutput = await videosService.createVideo(title, author, canBeDownloaded, minAgeRestriction, publicationDate, availableResolutions)
    res.status(HTTP_STATUSES.CREATED_201).send(createdVideo)
})

videosRouter.put('/:id', validator(videosValidation), async (req: RequestWithParamsAndBody<GetDeleteVideoById, CreateUpdateVideo>, res: Response) => {
    const videoId: string = req.params.id
    const {
        title,
        author,
        canBeDownloaded,
        minAgeRestriction,
        publicationDate,
        availableResolutions
    } = req.body
    const updateResult: DB_RESULTS = await videosService.updateVideo(videoId, title, author, canBeDownloaded, minAgeRestriction, publicationDate, availableResolutions)
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