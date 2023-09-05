import {commentsRepository} from "../repositories/commentsRepository";
import {DB_RESULTS} from "../utils/common/constants";
import {CommentViewModel} from "../types/commentsTypes";

export const commentsService = {
    /**
     * Изменение комментария по id
     * Если комментарий не нашли, то вернем DB_RESULTS.NOT_FOUND
     * Если id пользователя который хочет изменить комментарий не совпадает с тем id, что лежит в объекте комментария
     * То возвращаем DB_RESULTS.INVALID_DATA. Пользователь не может изменить чужой коммент
     * @param commentId id комментария, который нужно удалить. Получаем в jwtAuth
     * @param userId id юзера, который хочет удалить комментарий
     * @param content новый текст комментария
     */
    async updateCommentById(commentId: string, userId: string, content: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.INVALID_DATA | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const foundComment: DB_RESULTS.NOT_FOUND | CommentViewModel = await commentsRepository.getCommentById(commentId)
        if (foundComment === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        if (foundComment.commentatorInfo.userId !== userId) {
            return DB_RESULTS.INVALID_DATA
        }
        return await commentsRepository.updateCommentById(commentId, content)
    },
    /**
     * Удаление комментария по id
     * Если комментарий не нашли, то вернем DB_RESULTS.NOT_FOUND
     * Если id пользователя который хочет удалить комментарий не совпадает с тем id, что лежит в объекте комментария
     * То возвращаем DB_RESULTS.INVALID_DATA. Пользователь не может удалить чужой коммент
     * @param commentId id комментария, который нужно удалить. Получаем в jwtAuth
     * @param userId id юзера, который хочет удалить комментарий
     */
    async deleteCommentById(commentId: string, userId: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.INVALID_DATA | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const foundComment: DB_RESULTS.NOT_FOUND | CommentViewModel = await commentsRepository.getCommentById(commentId)
        if (foundComment === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        if (foundComment.commentatorInfo.userId !== userId) {
            return DB_RESULTS.INVALID_DATA
        }
        return await commentsRepository.deleteCommentById(commentId)
    },
    /**
     * Поиск комментария по id
     * @param id id комментария по которому делаем поиск
     */
    async getCommentById(id: string): Promise<DB_RESULTS.NOT_FOUND | CommentViewModel> {
        return commentsRepository.getCommentById(id)
    }
}