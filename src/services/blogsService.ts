import {blogsRepository} from "../repositories/blogsRepository";
import {BlogOutput} from "../types/blogsTypes";
import {DB_RESULTS} from "../common/constants";
import {RequestWithBody, RequestWithParamsAndBody} from "../types/requestGenerics";
import {CreateUpdateBlog} from "../dto/blogs/CreateUpdateBlog";
import {GetDeleteBlogById} from "../dto/blogs/GetDeleteBlogById";

export const blogsService = {
    getAllBlogs(): BlogOutput[] {
        return blogsRepository.getAllBlogs()
    },
    createBlog(req: RequestWithBody<CreateUpdateBlog>): BlogOutput {
        const newBlog: BlogOutput = {
            id: Date.now().toString(),
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        }
        return blogsRepository.createBlog(newBlog)
    },
    getBlogById(id: string): BlogOutput | DB_RESULTS.NOT_FOUND {
        const foundBlog: BlogOutput | undefined = blogsRepository.getBlogById(id)
        if (foundBlog === undefined) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundBlog
    },
    updateBlogById(req: RequestWithParamsAndBody<GetDeleteBlogById, CreateUpdateBlog>) {
        const blogId: string = req.params.id
        const foundBlog: BlogOutput | undefined = blogsRepository.getBlogById(blogId)
        if (foundBlog === undefined) {
            return DB_RESULTS.NOT_FOUND
        }
        const updatedBlog: BlogOutput = {
            id: foundBlog.id,
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        }
        return blogsRepository.updateBlogById(blogId, updatedBlog)
    },
    deleteBlogById(id: string): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        return blogsRepository.deleteBlogById(id)
    }
}