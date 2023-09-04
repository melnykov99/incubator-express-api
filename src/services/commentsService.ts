import {commentsRepository} from "../repositories/commentsRepository";
import {DB_RESULTS} from "../utils/common/constants";
import {CommentViewModel} from "../types/commentsTypes";

export const commentsService = {
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
    async getCommentById(id: string): Promise<DB_RESULTS.NOT_FOUND | CommentViewModel> {
        return commentsRepository.getCommentById(id)
    }
}