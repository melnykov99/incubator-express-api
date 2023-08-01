import {blogsRepository} from "../repositories/blogsRepository";
import {BlogOutput} from "../types/blogsTypes";
import {DB_RESULTS} from "../common/constants";

export const blogsService = {
    getAllBlogs(): BlogOutput[] {
        return blogsRepository.getAllBlogs()
    },
    createBlog(): BlogOutput {
        return blogsRepository.createBlog()
    },
    getBlogById(id: string): BlogOutput | DB_RESULTS.NOT_FOUND {
        return blogsRepository.getBlogById(id)
    }
}