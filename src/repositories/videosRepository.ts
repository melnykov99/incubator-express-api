import {VideoOutput} from "../types/videosTypes";
import {DB_RESULTS} from "../common/constants";
import {db} from "./db";
import {DeleteResult} from "mongodb";

export const videosRepository = {
    /**
     * Удаляем все данные из БД
     */
    async deleteAllVideos(): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.videosCollection.deleteMany({})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Отдаем все видео из БД
     */
    async getAllVideos(): Promise<VideoOutput[]> {
        return await db.videosCollection.find({}).toArray()
    },
    /**
     * Ищем видео в базе по id
     * @param {number} id числовой id видео, которое нужно отдать
     * @return если видео по id не нашли в базе, то возвращаем константу NOT_FOUND. Иначе возвращаем найденное видео
     */
    async getVideoById(id: number): Promise<DB_RESULTS.NOT_FOUND | VideoOutput> {
        const foundVideo: VideoOutput | null = await db.videosCollection.findOne({id})
        if (foundVideo === null) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundVideo

    },
    /**
     * Добавляем присланное видео в базу данных
     * @param newVideo присланное видео, которое нужно добавить в БД
     * @return возвращаем константу об успешном выполнении
     */
    async createVideo(newVideo: VideoOutput): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.videosCollection.insertOne(newVideo)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Принимаем новый объект и id. По id нахдим видео и заменяем его на присланный объект. Видео всегда найдем потому что искали ранее в сервисе по id.
     * Не дошли бы сюда, если бы видео не было
     * @param updatedVideo обновленный объект видео
     * @param id числовой id видео, который нужно обновить
     * @return возвращаем константу об успешном выполнении
     */
    async updateVideo(updatedVideo: VideoOutput, id: number): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.videosCollection.updateOne({id}, updatedVideo)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * По id находим видео в БД, если оно есть, то удаляем.
     * @param id числовой id видео, который нужно удалить
     * @return если видео по id не нашли, то в deletedCount будет 0, в таком случае возвращаем константу NOT_FOUND.
     * В ином случае нашли и удалили видео, возвращаем константу об успешном выполнении
     */
    async deleteVideoById(id: number): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const deleteResult: DeleteResult = await db.videosCollection.deleteOne({id})
        if (deleteResult.deletedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}