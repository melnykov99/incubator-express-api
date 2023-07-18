import {videosRepository} from "../repositories/videosRepository";
import {VideoOutput} from "../types/videosTypes";
import {SEARCH_RESULTS} from "../common/constants";

export const videosService = {
    getAllVideos() {
        return videosRepository.getAllVideos()
    },
    getVideoById(id: string): VideoOutput | SEARCH_RESULTS.NOT_FOUND {
        const numberId: number = parseInt(id)
        const video: VideoOutput | undefined = videosRepository.getVideoById(numberId)
        if(video === undefined) {
            return SEARCH_RESULTS.NOT_FOUND
        } else {
            return video
        }
    }
}