import {videosRepository} from "../repositories/videosRepository";
import {VideoOutput} from "../types/videosTypes";
import {DB_RESULTS} from "../common/constants";
import {RequestWithBody} from "../types/commonTypes";
import {CreateVideo} from "../dto/videos/CreateVideo";

export const videosService = {
    getAllVideos(): VideoOutput[] {
        return videosRepository.getAllVideos()
    },
    getVideoById(id: string): VideoOutput | DB_RESULTS.NOT_FOUND {
        const numberId: number = parseInt(id)
        const video: VideoOutput | DB_RESULTS.NOT_FOUND = videosRepository.getVideoById(numberId)
        return video === DB_RESULTS.NOT_FOUND ? DB_RESULTS.NOT_FOUND : video
    },
    createVideo(req: RequestWithBody<CreateVideo>): VideoOutput {
        const newVideo: VideoOutput = {
            id: Date.now(),
            title: req.body.title,
            author: req.body.author,
            canBeDownloaded: req.body.canBeDownloaded ?? false,
            minAgeRestriction: req.body.minAgeRestriction ?? null,
            createdAt: (new Date().toISOString()),
            publicationDate: req.body.publicationDate ?? (new Date(new Date().setDate(new Date().getDate() + 1))).toISOString(),
            availableResolutions: req.body.availableResolutions
        }
        videosRepository.createVideo(newVideo)
        return newVideo
    },
    deleteVideoById(id: string): DB_RESULTS {
        const numberId: number = parseInt(id)
        const deletionResult: DB_RESULTS = videosRepository.deleteVideoById(numberId)
        return deletionResult === DB_RESULTS.NOT_FOUND ? DB_RESULTS.NOT_FOUND : DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}