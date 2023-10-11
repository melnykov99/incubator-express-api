import {Response, Router} from "express";
import {postsService} from "../services/postsService";
import {PostOutput, PostViewModel} from "../types/postsTypes";
import {DB_RESULTS, HTTP_STATUSES} from "../utils/common/constants";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../types/requestGenerics";
import {CreateUpdatePost} from "../dto/posts/CreateUpdatePost";
import {GetDeletePostById} from "../dto/posts/GetDeletePostById";
import {validator} from "../validators/validator";
import {postsValidation} from "../validators/postsValidation";
import {basicAuth} from "../middlewares/basicAuth";
import {GetPostsWithQuery} from "../dto/posts/GetPostsWithQuery";
import {accessTokenAuth} from "../middlewares/jwtAuth";
import {GetCommentsByPostId} from "../dto/posts/GetCommentsByPostId";
import {CreateCommentByPostId} from "../dto/posts/CreateCommentByPostId";
import {commentsValidation} from "../validators/commentsValidation";
import {CommentsViewModel, CommentOutput} from "../types/commentsTypes";
import {GetCommentsByPostIdWithQuery} from "../dto/posts/GetCommentsByPostIdWithQuery";

export const postsRouter = Router()

postsRouter.get('/', async (req: RequestWithQuery<GetPostsWithQuery>, res: Response) => {
    const {sortBy, sortDirection, pageNumber, pageSize} = req.query
    const posts: PostViewModel = await postsService.getPosts(sortBy, sortDirection, pageNumber, pageSize)
    res.status(HTTP_STATUSES.OK_200).send(posts)
})
postsRouter.post('/', basicAuth, validator(postsValidation), async (req: RequestWithBody<CreateUpdatePost>, res: Response) => {
    const {title, shortDescription, content, blogId} = req.body
    const newPost: PostOutput | DB_RESULTS.NOT_FOUND = await postsService.createPost(title, shortDescription, content, blogId)
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
    const postId: string = req.params.id
    const {title, shortDescription, content, blogId} = req.body
    const updateResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED = await postsService.updatePostById(postId, title, shortDescription, content, blogId)
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
postsRouter.get('/:postId/comments', async (req: RequestWithParamsAndQuery<GetCommentsByPostId, GetCommentsByPostIdWithQuery>, res: Response) => {
    const postId: string = req.params.postId
    const {sortBy, sortDirection, pageNumber, pageSize} = req.query
    const foundComments: DB_RESULTS.NOT_FOUND | CommentsViewModel = await postsService.getCommentsByPostId(postId, sortBy, sortDirection, pageNumber, pageSize)
    if (foundComments === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(foundComments)
})
postsRouter.post('/:postId/comments', accessTokenAuth, validator(commentsValidation), async (req: RequestWithParamsAndBody<GetCommentsByPostId, CreateCommentByPostId>, res: Response) => {
    const postId: string = req.params.postId
    const {content} = req.body
    const {id, login} = req.user
    const newComment: CommentOutput | DB_RESULTS.NOT_FOUND = await postsService.createCommentByPostId(postId, content, id, login)
    if (newComment === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.CREATED_201).send(newComment)

})