import {postsRepository} from "../repositories/postsRepository";
import {PostOutput} from "../types/postsTypes";
import {RequestWithBody} from "../types/requestGenerics";
import {CreateUpdatePost} from "../dto/posts/CreateUpdatePost";
import {BlogOutput} from "../types/blogsTypes";
import {blogsRepository} from "../repositories/blogsRepository";
import {DB_RESULTS} from "../common/constants";

export const postsService = {
    getAllPosts(): PostOutput[] {
        return postsRepository.getAllPosts()
    },
    /**
     * По требованию API не нужно в POST запросе posts возвращать 404, если блог по id не найден. Если не найдет, то будет undefined, проверку никакую не ставил
     * @param req
     */
    createPost(req: RequestWithBody<CreateUpdatePost>): PostOutput | DB_RESULTS.NOT_FOUND {
        const foundBlog: BlogOutput | DB_RESULTS.NOT_FOUND = blogsRepository.getBlogById(req.body.blogId)
        if (foundBlog === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const newPost: PostOutput = {
            id: Date.now().toString(),
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
            blogName: foundBlog.name
        }
        postsRepository.createPost(newPost)
        return newPost
    }
}