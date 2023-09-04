import {db} from "./db";
import {CommentViewModel} from "../types/commentsTypes";
import {DB_RESULTS} from "../utils/common/constants";
import {DeleteResult, UpdateResult} from "mongodb";

export const commentsRepository = {
    async updateCommentById(id: string, content: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const updateResult: UpdateResult = await db.commentsCollection.updateOne({id}, {$set: {content}})
        if (updateResult.matchedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    async deleteCommentById(id: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const deleteResult: DeleteResult = await db.commentsCollection.deleteOne({id})
        if (deleteResult.deletedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    async getCommentById(id: string): Promise<DB_RESULTS.NOT_FOUND | CommentViewModel> {
        const foundComment: CommentViewModel | null = await db.commentsCollection.findOne({id})
        if (!foundComment) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundComment
    }
}