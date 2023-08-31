import {Response, Router} from "express";
import {postsService} from "../services/postsService";
import {PostOutput, PostViewModel} from "../types/postsTypes";
import {DB_RESULTS, HTTP_STATUSES} from "../common/constants";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery} from "../types/requestGenerics";
import {CreateUpdatePost} from "../dto/posts/CreateUpdatePost";
import {GetDeletePostById} from "../dto/posts/GetDeletePostById";
import {validator} from "../validators/validator";
import {postsValidation} from "../validators/postsValidation";
import {basicAuth} from "../middlewares/basicAuth";
import {GetPostsWithQuery} from "../dto/posts/GetPostsWithQuery";

export const postsRouter = Router()

postsRouter.get('/', async (req: RequestWithQuery<GetPostsWithQuery>, res: Response) => {
    const posts: PostViewModel = await postsService.getPosts(req)
    res.status(HTTP_STATUSES.OK_200).send(posts)
})
postsRouter.post('/', basicAuth, validator(postsValidation), async (req: RequestWithBody<CreateUpdatePost>, res: Response) => {
    const newPost: PostOutput | DB_RESULTS.NOT_FOUND = await postsService.createPost(req)
    if (newPost === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.CREATED_201).send(newPost)
})
postsRouter.get('/:id', async (req: RequestWithParams<GetDeletePostById>, res: Response) => {
    const foundPost: DB_RESULTS.NOT_FOUND | PostOutput = await postsService.getPostById(req.params.id)
    if (foundPost === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(foundPost)
})
postsRouter.put('/:id', basicAuth, validator(postsValidation), async (req: RequestWithParamsAndBody<GetDeletePostById, CreateUpdatePost>, res: Response) => {
    const updateResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED = await postsService.updatePostById(req)
    if (updateResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
postsRouter.delete('/:id', basicAuth, async (req: RequestWithParams<GetDeletePostById>, res: Response) => {
    const deleteResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED = await postsService.deletePostById(req.params.id)
    if (deleteResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})