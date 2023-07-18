import {VideoOutput} from "../types/videosTypes";

//Пока нет базы данных объявляем просто массив с видео
export let videosDB: VideoOutput[] = []

export const videosRepository = {
    deleteAllVideos() {
        videosDB = []
    },
    getAllVideos() {
        return videosDB
    },
    getVideoById(id: number): VideoOutput | undefined {
        return videosDB.find(v => v.id === id)
    },
    createVideo(newVideo: VideoOutput) {
        videosDB.push(newVideo)
        return videosDB
    },
    updateVideo() {

    },
    deleteVideo() {

    }
}