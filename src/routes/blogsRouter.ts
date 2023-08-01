import {Request, Response, Router} from "express";
import {blogsService} from "../services/blogsService";
import {BlogOutput} from "../types/blogsTypes";
import {DB_RESULTS, HTTP_STATUSES} from "../common/constants";
import {RequestWithBody, RequestWithParams} from "../types/requestGenerics";
import {CreateUpdateBlog} from "../dto/blogs/CreateUpdateBlog";
import {GetDeleteBlogById} from "../dto/blogs/GetDeleteBlogById";

export const blogsRouter = Router()

blogsRouter.get('/', (req: Request, res: Response) => {
    const blogs: BlogOutput[] = blogsService.getAllBlogs()
    res.status(HTTP_STATUSES.OK_200).send(blogs)
})
blogsRouter.post('/', (req: RequestWithBody<CreateUpdateBlog>, res: Response) => {
    const newBlog: BlogOutput = blogsService.createBlog()
    res.status(HTTP_STATUSES.CREATED_201).send(newBlog)
})
blogsRouter.get('/:id', (req: RequestWithParams<GetDeleteBlogById>, res: Response) => {
    const foundBlog: BlogOutput | DB_RESULTS.NOT_FOUND = blogsService.getBlogById(req.params.id as string)
    if (foundBlog === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.status(HTTP_STATUSES.OK_200).send(foundBlog)
})