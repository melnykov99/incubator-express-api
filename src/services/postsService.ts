import {postsRepository} from "../repositories/postsRepository";
import {PostOutput} from "../types/postsTypes";
import {RequestWithBody, RequestWithParamsAndBody} from "../types/requestGenerics";
import {CreateUpdatePost} from "../dto/posts/CreateUpdatePost";
import {BlogOutput} from "../types/blogsTypes";
import {blogsRepository} from "../repositories/blogsRepository";
import {DB_RESULTS} from "../common/constants";
import {GetDeletePostById} from "../dto/posts/GetDeletePostById";

export const postsService = {
    getAllPosts(): PostOutput[] {
        return postsRepository.getAllPosts()
    },
    /**
     * По требованию API не нужно в POST запросе posts возвращать 404, если блог по id не найден, предполагается, что он всегда есть. Но добавил такую проверку
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
    },
    getPostById(id: string): DB_RESULTS.NOT_FOUND | PostOutput {
        return postsRepository.getPostById(id)
    },
    //ищем блог, если его нет, то 404
    //ищем пост, если его нет, то 404
    // name поменять на имя нового блога
    updatePostById(req: RequestWithParamsAndBody<GetDeletePostById, CreateUpdatePost>): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const foundBlog: DB_RESULTS.NOT_FOUND | BlogOutput = blogsRepository.getBlogById(req.body.blogId)
        if (foundBlog === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const foundPost: DB_RESULTS.NOT_FOUND | PostOutput = postsRepository.getPostById(req.params.id)
        if (foundPost === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const updatedPost: PostOutput = {
            id: foundPost.id,
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
            blogName: foundBlog.name
        }
        postsRepository.updatePostById(updatedPost)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    deletePostById(id: string): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        return postsRepository.deletePostById(id)
    }
}