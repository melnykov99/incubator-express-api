import {videosRepository} from "../repositories/videosRepository";
import {VideoOutput} from "../types/videosTypes";
import {DB_RESULTS} from "../common/constants";

export const videosService = {
    getAllVideos(): VideoOutput[] {
        return videosRepository.getAllVideos()
    },
    getVideoById(id: string): VideoOutput | DB_RESULTS.NOT_FOUND {
        const numberId: number = parseInt(id)
        const video: VideoOutput | DB_RESULTS.NOT_FOUND = videosRepository.getVideoById(numberId)
        return video === DB_RESULTS.NOT_FOUND ? DB_RESULTS.NOT_FOUND : video
    },
    deleteVideoById(id: string): DB_RESULTS {
        const numberId: number = parseInt(id)
        const deletionResult: DB_RESULTS = videosRepository.deleteVideoById(numberId)
        return deletionResult === DB_RESULTS.NOT_FOUND ? DB_RESULTS.NOT_FOUND : DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}