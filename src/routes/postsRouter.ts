import {Request, Response, Router} from "express";
import {postsService} from "../services/postsService";
import {PostOutput} from "../types/postsTypes";
import {DB_RESULTS, HTTP_STATUSES} from "../common/constants";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/requestGenerics";
import {CreateUpdatePost} from "../dto/posts/CreateUpdatePost";
import {GetDeletePostById} from "../dto/posts/GetDeletePostById";

export const postsRouter = Router()

postsRouter.get('/', (req: Request, res: Response) => {
    const posts: PostOutput[] = postsService.getAllPosts()
    res.status(HTTP_STATUSES.OK_200).send(posts)
})
postsRouter.post('/', (req: RequestWithBody<CreateUpdatePost>, res: Response) => {
    const newPost: PostOutput | DB_RESULTS.NOT_FOUND = postsService.createPost(req)
    if (newPost === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.CREATED_201).send(newPost)
})
postsRouter.get('/:id', (req: RequestWithParams<GetDeletePostById>, res: Response) => {
    const foundPost: DB_RESULTS.NOT_FOUND | PostOutput = postsService.getPostById(req.params.id)
    if (foundPost === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(foundPost)
})
postsRouter.put('/:id', (req: RequestWithParamsAndBody<GetDeletePostById, CreateUpdatePost>, res: Response) => {
    const updateResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED = postsService.updatePostById(req)
    if (updateResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
postsRouter.delete('/:id', (req: RequestWithParams<GetDeletePostById>, res: Response) => {
    const deleteResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED = postsService.deletePostById(req.params.id)
    if (deleteResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})