import {commentsRepository} from "../repositories/commentsRepository";
import {COMMENTS, DB_RESULTS} from "../utils/common/constants";
import {CommentOutput} from "../types/commentsTypes";

export const commentsService = {
    /**
     * Изменение комментария по id
     * Если комментарий не нашли, то вернем COMMENTS.NOt_FOUND
     * Если id пользователя который хочет изменить комментарий не совпадает с тем id, что лежит в объекте комментария
     * То возвращаем COMMENTS.NOT_OWNER. Пользователь не может изменить чужой коммент
     * Иначе обновляем комментарий и возвращаем константу об успешном выполнении
     * @param commentId id комментария, который нужно удалить. Получаем в accessTokenAuth
     * @param userId id юзера, который хочет удалить комментарий
     * @param content новый текст комментария
     */
    async updateCommentById(commentId: string, userId: string, content: string): Promise<COMMENTS.NOt_FOUND | COMMENTS.NOT_OWNER | COMMENTS.SUCCESSFUL_UPDATE> {
        const foundComment: DB_RESULTS.NOT_FOUND | CommentOutput = await commentsRepository.getCommentById(commentId)
        if (foundComment === DB_RESULTS.NOT_FOUND) {
            return COMMENTS.NOt_FOUND
        }
        if (foundComment.commentatorInfo.userId !== userId) {
            return COMMENTS.NOT_OWNER
        }
        await commentsRepository.updateCommentById(commentId, content)
        return COMMENTS.SUCCESSFUL_UPDATE
    },
    /**
     * Удаление комментария по id
     * Если комментарий не нашли, то вернем COMMENTS.NOt_FOUND
     * Если id пользователя который хочет удалить комментарий не совпадает с тем id, что лежит в объекте комментария
     * То возвращаем COMMENTS.NOT_OWNER. Пользователь не может удалить чужой коммент
     * @param commentId id комментария, который нужно удалить. Получаем в accessTokenAuth
     * @param userId id юзера, который хочет удалить комментарий
     */
    async deleteCommentById(commentId: string, userId: string): Promise<COMMENTS.NOt_FOUND | COMMENTS.NOT_OWNER | COMMENTS.SUCCESSFUL_DELETE> {
        const foundComment: DB_RESULTS.NOT_FOUND | CommentOutput = await commentsRepository.getCommentById(commentId)
        if (foundComment === DB_RESULTS.NOT_FOUND) {
            return COMMENTS.NOt_FOUND
        }
        if (foundComment.commentatorInfo.userId !== userId) {
            return COMMENTS.NOT_OWNER
        }
        await commentsRepository.deleteCommentById(commentId)
        return COMMENTS.SUCCESSFUL_DELETE
    },
    /**
     * Поиск комментария по id. Если комментарий не нашли в БД, то вернем COMMENTS.NOt_FOUND. Если нашли, то вернем комментарийю
     * @param id id комментария по которому делаем поиск
     */
    async getCommentById(id: string): Promise<COMMENTS.NOt_FOUND | CommentOutput> {
        const foundComment: DB_RESULTS.NOT_FOUND | CommentOutput = await commentsRepository.getCommentById(id)
        if (foundComment === DB_RESULTS.NOT_FOUND) {
            return COMMENTS.NOt_FOUND
        }
        return foundComment
    }
}