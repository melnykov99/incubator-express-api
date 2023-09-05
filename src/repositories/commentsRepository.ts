import {db} from "./db";
import {CommentViewModel} from "../types/commentsTypes";
import {DB_RESULTS} from "../utils/common/constants";
import {DeleteResult, UpdateResult} from "mongodb";

export const commentsRepository = {
    /**
     * Удаление всех комментариев из БД
     */
    async deleteAllComments(): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.commentsCollection.deleteMany({})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Изменение текста комментария по id
     * Если комментария с таким id нет, то в matchedCount будет 0, в таком случае возвращаем DB_RESULTS.NOT_FOUND
     * В ином случае комментарий обновили и возвращаем константу об успешном выполнении
     * @param id id комментария, который нужно изменить
     * @param content новый текст комментария
     */
    async updateCommentById(id: string, content: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const updateResult: UpdateResult = await db.commentsCollection.updateOne({id}, {$set: {content}})
        if (updateResult.matchedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Удаление комментария по id
     * Если комментария по такому id нет, то в deletedCount будет 0, в таком случае возвращаем DB_RESULTS.NOT_FOUND
     * В ином случае комментарий удалили и возвращаем константу об успешном выполнении
     * @param id id комментария, который нужно удалить
     */
    async deleteCommentById(id: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const deleteResult: DeleteResult = await db.commentsCollection.deleteOne({id})
        if (deleteResult.deletedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Поиск комментария по id
     * Если комментария нет, то вернем DB_RESULTS.NOT_FOUND
     * В ином случае возвращаем объект комментария из БД
     * @param id id комментария, по нему ищем
     */
    async getCommentById(id: string): Promise<DB_RESULTS.NOT_FOUND | CommentViewModel> {
        const foundComment: CommentViewModel | null = await db.commentsCollection.findOne({id})
        if (!foundComment) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundComment
    }
}