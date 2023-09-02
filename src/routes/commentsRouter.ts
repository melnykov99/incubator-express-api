import {Response, Router} from "express";
import {HTTP_STATUSES} from "../utils/common/constants";
import {RequestWithParams, RequestWithParamsAndBody} from "../types/requestGenerics";
import {GetCommentById} from "../dto/comments/GetCommentById";
import {UpdateDeleteCommentById} from "../dto/comments/UpdateDeleteCommentById";
import {UpdateComment} from "../dto/comments/UpdateComment";
import {validator} from "../validators/validator";
import {commentsValidation} from "../validators/commentsValidation";

export const commentsRouter = Router()
commentsRouter.put('/:commentId', validator(commentsValidation), async (req: RequestWithParamsAndBody<UpdateDeleteCommentById, UpdateComment>, res: Response) => {
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
commentsRouter.delete('/:commentId', async (req: RequestWithParams<UpdateDeleteCommentById>, res: Response) => {
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
commentsRouter.get('/:id', async (req: RequestWithParams<GetCommentById>, res: Response) => {
    res.status(HTTP_STATUSES.OK_200).send()
})