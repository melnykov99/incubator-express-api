import {VideoOutput} from "../types/videosTypes";
import {DB_RESULTS} from "../common/constants";

//Пока нет базы данных объявляем просто массив с видео
export let videosDB: VideoOutput[] = []

export const videosRepository = {
    deleteAllVideos(): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        videosDB = []
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    getAllVideos(): VideoOutput[] {
        return videosDB
    },
    getVideoById(id: number): DB_RESULTS.NOT_FOUND | VideoOutput {
        const foundVideo: VideoOutput | undefined = videosDB.find(v => v.id === id)
        if (foundVideo === undefined) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundVideo

    },
    createVideo(newVideo: VideoOutput) {
        videosDB.push(newVideo)
        return videosDB
    },
    updateVideo() {

    },
    deleteVideoById(id: number): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const videoIndex: number = videosDB.findIndex(v => v.id === id)
        if (videoIndex === -1) {
            return DB_RESULTS.NOT_FOUND
        }
        videosDB.splice(1, videoIndex)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}