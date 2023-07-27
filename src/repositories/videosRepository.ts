import {AvailableResolutions, VideoOutput} from "../types/videos";
import {DB_RESULTS} from "../common/constants";

//Пока нет базы данных объявляем просто массив с видео
export let videosDB: VideoOutput[] = [
    {
        id: 1,
        title: 'title',
        author: 'author',
        canBeDownloaded: true,
        minAgeRestriction: 18,
        createdAt: '2023-07-27T05:07:50.901Z',
        publicationDate: '2023-07-28T05:07:50.901Z',
        availableResolutions: [AvailableResolutions.P480, AvailableResolutions.P720, AvailableResolutions.P1080]
    }
]

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
    createVideo(newVideo: VideoOutput): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        videosDB.push(newVideo)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    updateVideo(updatedVideo: VideoOutput, id: number): DB_RESULTS {
        const videoIndex: number = videosDB.findIndex(v => v.id === id)
        videosDB[videoIndex] = updatedVideo
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    deleteVideoById(id: number): DB_RESULTS {
        const videoIndex: number = videosDB.findIndex(v => v.id === id)
        if (videoIndex === -1) {
            return DB_RESULTS.NOT_FOUND
        }
        videosDB.splice(1, videoIndex)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}