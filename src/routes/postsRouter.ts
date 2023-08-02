import {Request, Response, Router} from "express";
import {postsService} from "../services/postsService";
import {PostOutput} from "../types/postsTypes";
import {DB_RESULTS, HTTP_STATUSES} from "../common/constants";
import {RequestWithBody} from "../types/requestGenerics";
import {CreateUpdatePost} from "../dto/posts/CreateUpdatePost";

export const postsRouter = Router()

postsRouter.get('/', (req: Request, res: Response) => {
    const posts: PostOutput[] = postsService.getAllPosts()
    res.status(HTTP_STATUSES.OK_200).send(posts)
})
postsRouter.post('/', (req: RequestWithBody<CreateUpdatePost>, res: Response) => {
    const newPost: PostOutput | DB_RESULTS.NOT_FOUND = postsService.createPost(req)
    if (newPost === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    res.status(HTTP_STATUSES.CREATED_201).send(newPost)
})