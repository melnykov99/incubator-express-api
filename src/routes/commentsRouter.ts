import {Response, Router} from "express";
import {DB_RESULTS, HTTP_STATUSES} from "../utils/common/constants";
import {RequestWithParams, RequestWithParamsAndBody} from "../types/requestGenerics";
import {GetCommentById} from "../dto/comments/GetCommentById";
import {UpdateDeleteCommentById} from "../dto/comments/UpdateDeleteCommentById";
import {UpdateComment} from "../dto/comments/UpdateComment";
import {validator} from "../validators/validator";
import {commentsValidation} from "../validators/commentsValidation";
import {jwtAuth} from "../middlewares/jwtAuth";
import {commentsService} from "../services/commentsService";
import {CommentViewModel} from "../types/commentsTypes";

export const commentsRouter = Router()
commentsRouter.put('/:commentId', jwtAuth, validator(commentsValidation), async (req: RequestWithParamsAndBody<UpdateDeleteCommentById, UpdateComment>, res: Response) => {
    const updateResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.INVALID_DATA | DB_RESULTS.SUCCESSFULLY_COMPLETED = await commentsService.updateCommentById(req.params.commentId, req.user.id, req.body.content)
    if (updateResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    if (updateResult === DB_RESULTS.INVALID_DATA) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
commentsRouter.delete('/:commentId', jwtAuth, async (req: RequestWithParams<UpdateDeleteCommentById>, res: Response) => {
    const deleteResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.INVALID_DATA | DB_RESULTS.SUCCESSFULLY_COMPLETED = await commentsService.deleteCommentById(req.params.commentId, req.user.id)
    if (deleteResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    if (deleteResult === DB_RESULTS.INVALID_DATA) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
commentsRouter.get('/:id', jwtAuth, async (req: RequestWithParams<GetCommentById>, res: Response) => {
    const foundComment: DB_RESULTS.NOT_FOUND | CommentViewModel = await commentsService.getCommentById(req.params.id)
    if (foundComment === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    res.status(HTTP_STATUSES.OK_200).send(foundComment)
})