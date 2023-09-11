import {VideoOutput, VideoViewModel} from "../types/videosTypes";
import {DB_RESULTS} from "../utils/common/constants";
import {db} from "./db";
import {DeleteResult} from "mongodb";
import {paginationAndSorting} from "../utils/common/paginationAndSorting";
import {PagSortValues} from "../types/commonTypes";

export const videosRepository = {
    /**
     * Удаляем все данные из БД
     */
    async deleteAllVideos(): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.videosCollection.deleteMany({})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Обращаемся к функции пагинации и сортировки, передавая query параметры пагинации/сортировки и название коллекции
     * Функция возвращает PagSortValues к которым обращаемся для формирования объекта, который будем возвращать
     * Возвращаем информацию о страницах и в объекте items возвращаем массив с видео
     * Видео из БД отдаем без монговского _id
     * @param sortBy по какому полю выполнить сортировку и вернуть результат
     * @param sortDirection с каким направлением сделать сортировку asc или desc
     * @param pageNumber номер страницы для вывода
     * @param pageSize размер выводимой страницы
     */
    async getVideos(sortBy: string | undefined, sortDirection: string | undefined, pageNumber: string | undefined, pageSize: string | undefined): Promise<VideoViewModel> {
        const pagSortValues: PagSortValues = await paginationAndSorting(sortBy, sortDirection, pageNumber, pageSize, 'videosCollection')
        return {
            pagesCount: pagSortValues.pagesCount,
            page: pagSortValues.pageNumber,
            pageSize: pagSortValues.pageSize,
            totalCount: pagSortValues.totalCount,
            items: await db.videosCollection
                .find({}, {projection: {_id: 0}})
                .skip(pagSortValues.skip)
                .limit(pagSortValues.limit)
                .sort({[pagSortValues.sortBy]: pagSortValues.sortDirection})
                .toArray()
        }
    },
    /**
     * Ищем видео в базе по id
     * @param {number} id числовой id видео, которое нужно отдать
     * @return если видео по id не нашли в базе, то возвращаем константу NOT_FOUND. Иначе возвращаем найденное видео
     */
    async getVideoById(id: number): Promise<DB_RESULTS.NOT_FOUND | VideoOutput> {
        const foundVideo: VideoOutput | null = await db.videosCollection.findOne({id}, {projection: {_id: 0}})
        if (!foundVideo) {
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
     * Принимаем новый объект и id. По id находим видео и заменяем его на присланный объект. Видео всегда найдем потому что искали ранее в сервисе по id.
     * Не дошли бы сюда, если бы видео не было
     * @param id числовой id видео, который нужно обновить
     * @param updatedVideo обновленный объект видео
     * @return возвращаем константу об успешном выполнении
     */
    async updateVideo(id: number, updatedVideo: VideoOutput): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.videosCollection.updateOne({id}, {$set: updatedVideo})
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