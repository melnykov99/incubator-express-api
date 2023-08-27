import {Request, Response, Router} from "express";
import {blogsService} from "../services/blogsService";
import {BlogOutput} from "../types/blogsTypes";
import {DB_RESULTS, HTTP_STATUSES} from "../common/constants";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/requestGenerics";
import {CreateUpdateBlog} from "../dto/blogs/CreateUpdateBlog";
import {GetDeleteBlogById} from "../dto/blogs/GetDeleteBlogById";
import {validator} from "../validators/validator";
import {blogsValidation} from "../validators/blogsValidation";
import {basicAuth} from "../middlewares/basicAuth";

export const blogsRouter = Router()

blogsRouter.get('/', async (req: Request, res: Response) => {
    const blogs: BlogOutput[] = await blogsService.getAllBlogs()
    res.status(HTTP_STATUSES.OK_200).send(blogs)
})
blogsRouter.post('/', basicAuth, validator(blogsValidation), async (req: RequestWithBody<CreateUpdateBlog>, res: Response) => {
    const newBlog: BlogOutput = await blogsService.createBlog(req)
    res.status(HTTP_STATUSES.CREATED_201).send(newBlog)
})
blogsRouter.get('/:id', async (req: RequestWithParams<GetDeleteBlogById>, res: Response) => {
    const foundBlog: BlogOutput | DB_RESULTS.NOT_FOUND = await blogsService.getBlogById(req.params.id)
    if (foundBlog === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(foundBlog)
})
blogsRouter.put('/:id', basicAuth, validator(blogsValidation), async (req: RequestWithParamsAndBody<GetDeleteBlogById, CreateUpdateBlog>, res: Response) => {
    const updateResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED = await blogsService.updateBlogById(req)
    if (updateResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
blogsRouter.delete('/:id', basicAuth, async (req: RequestWithParams<GetDeleteBlogById>, res: Response) => {
    const deleteResult: DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED = await blogsService.deleteBlogById(req.params.id)
    if (deleteResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})