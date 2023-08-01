import {VideoOutput} from "../types/videosTypes";
import {DB_RESULTS} from "../common/constants";

//Пока нет базы данных объявляем просто массив с видео
export let videosDB: VideoOutput[] = []

export const videosRepository = {
    /**
     * Делаем массив videosDB пустым, тем самым удаляем все данные
     */
    deleteAllVideos(): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        videosDB = []
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Отдаем все видео. Возвращаем массив videosDB
     */
    getAllVideos(): VideoOutput[] {
        return videosDB
    },
    /**
     * Ищем видео в базе по id
     * @param {number} id числовой id видео, которое нужно отдать
     * @return если видео по id не нашли в базе, то возвращаем константу NOT_FOUND. Иначе возвращаем найденное видео
     */
    getVideoById(id: number): DB_RESULTS.NOT_FOUND | VideoOutput {
        const foundVideo: VideoOutput | undefined = videosDB.find(v => v.id === id)
        if (foundVideo === undefined) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundVideo

    },
    /**
     * Добавляем присланное видео в базу данных
     * @param newVideo присланное видео, которое нужно добавить в БД
     * @return возвращаем константу об успешном выполнении
     */
    createVideo(newVideo: VideoOutput): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        videosDB.push(newVideo)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Принимаем новый объект и id. По id нахдим видео и заменяем его на присланный объект
     * @param updatedVideo обновленный объект видео
     * @param id числовой id видео, который нужно обновить
     * @return возвращаем константу об успешном выполнении
     */
    updateVideo(updatedVideo: VideoOutput, id: number): DB_RESULTS {
        const videoIndex: number = videosDB.findIndex(v => v.id === id)
        videosDB[videoIndex] = updatedVideo
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * По id находим видео в БД, если оно есть, то удаляем.
     * @param id числовой id видео, который нужно удалить
     * @return если видео по id не нашли, то возвращаем константу NOT_FOUND. Если нашли и удалили, возвращаем константу об успешном выполнении
     */
    deleteVideoById(id: number): DB_RESULTS {
        const videoIndex: number = videosDB.findIndex(v => v.id === id)
        if (videoIndex === -1) {
            return DB_RESULTS.NOT_FOUND
        }
        videosDB.splice(videoIndex, 1)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}