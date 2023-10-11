import {Response, Router} from "express";
import {COMMENTS, HTTP_STATUSES} from "../utils/common/constants";
import {RequestWithParams, RequestWithParamsAndBody} from "../types/requestGenerics";
import {GetCommentById} from "../dto/comments/GetCommentById";
import {UpdateDeleteCommentById} from "../dto/comments/UpdateDeleteCommentById";
import {UpdateComment} from "../dto/comments/UpdateComment";
import {validator} from "../validators/validator";
import {commentsValidation} from "../validators/commentsValidation";
import {accessTokenAuth} from "../middlewares/jwtAuth";
import {commentsService} from "../services/commentsService";
import {CommentOutput} from "../types/commentsTypes";

export const commentsRouter = Router()
commentsRouter.put('/:commentId', accessTokenAuth, validator(commentsValidation), async (req: RequestWithParamsAndBody<UpdateDeleteCommentById, UpdateComment>, res: Response) => {
    const updateResult: COMMENTS.NOt_FOUND | COMMENTS.NOT_OWNER | COMMENTS.SUCCESSFUL_UPDATE = await commentsService.updateCommentById(req.params.commentId, req.user.id, req.body.content)
    if (updateResult === COMMENTS.NOt_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    if (updateResult === COMMENTS.NOT_OWNER) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
commentsRouter.delete('/:commentId', accessTokenAuth, async (req: RequestWithParams<UpdateDeleteCommentById>, res: Response) => {
    const deleteResult: COMMENTS.NOt_FOUND | COMMENTS.NOT_OWNER | COMMENTS.SUCCESSFUL_DELETE = await commentsService.deleteCommentById(req.params.commentId, req.user.id)
    if (deleteResult === COMMENTS.NOt_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    if (deleteResult === COMMENTS.NOT_OWNER) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
commentsRouter.get('/:id', async (req: RequestWithParams<GetCommentById>, res: Response) => {
    const foundComment: COMMENTS.NOt_FOUND | CommentOutput = await commentsService.getCommentById(req.params.id)
    if (foundComment === COMMENTS.NOt_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(foundComment)
})