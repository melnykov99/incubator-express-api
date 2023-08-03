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
     * Сначала находим blog по id. Он всегда здесь будет найден, поскольку на этапе валидации запроса мы это проверяем.
     * Не дошли бы сюда, если бы блога с таким id не было
     * @param req
     */
    createPost(req: RequestWithBody<CreateUpdatePost>): PostOutput | DB_RESULTS.NOT_FOUND {
        const foundBlog: BlogOutput | undefined = blogsRepository.getBlogById(req.body.blogId)
        const newPost: PostOutput = {
            id: Date.now().toString(),
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
            blogName: foundBlog!.name
        }
        postsRepository.createPost(newPost)
        return newPost
    },
    getPostById(id: string): DB_RESULTS.NOT_FOUND | PostOutput {
        return postsRepository.getPostById(id)
    },
    /**
     * Сначала находим blog по id. Он всегда здесь будет найден, поскольку на этапе валидации запроса мы это проверяем.
     * Не дошли бы сюда, если бы блога с таким id не было
     * @param req
     */
    updatePostById(req: RequestWithParamsAndBody<GetDeletePostById, CreateUpdatePost>): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const foundBlog: undefined | BlogOutput = blogsRepository.getBlogById(req.body.blogId)
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
            blogName: foundBlog!.name
        }
        postsRepository.updatePostById(updatedPost)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    deletePostById(id: string): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        return postsRepository.deletePostById(id)
    }
}