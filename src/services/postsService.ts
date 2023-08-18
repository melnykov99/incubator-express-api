import {postsRepository} from "../repositories/postsRepository";
import {PostOutput} from "../types/postsTypes";
import {RequestWithBody, RequestWithParamsAndBody} from "../types/requestGenerics";
import {CreateUpdatePost} from "../dto/posts/CreateUpdatePost";
import {BlogOutput} from "../types/blogsTypes";
import {blogsRepository} from "../repositories/blogsRepository";
import {DB_RESULTS} from "../common/constants";
import {GetDeletePostById} from "../dto/posts/GetDeletePostById";

export const postsService = {
    /**
     * Обращаемся к postsRepository, запрашивает все посты
     */
    getAllPosts(): PostOutput[] {
        return postsRepository.getAllPosts()
    },
    /**
     * Сначала находим blog по id. Он всегда здесь будет найден, поскольку на этапе валидации запроса мы это проверяем.
     * Не дошли бы сюда, если бы блога с таким id не было
     * Создаем объект нового блога, закидываем в него значения из запроса и blogName из найденного блога
     * Передаем этот объект в postsRepository
     * @param req запрос в теле которого значения для создания поста
     */
    createPost(req: RequestWithBody<CreateUpdatePost>): PostOutput | DB_RESULTS.NOT_FOUND {
        const foundBlog: BlogOutput | undefined = blogsRepository.getBlogById(req.body.blogId)
        const newPost: PostOutput = {
            id: Date.now().toString(),
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
            blogName: foundBlog!.name,
            createdAt: (new Date().toISOString()),
        }
        postsRepository.createPost(newPost)
        return newPost
    },
    /**
     * Обращаемся к postsRepository, передавая id поста
     * Если найдем там пост, то вернем его, если нет, то DB_RESULTS.NOT_FOUND
     * @param id id поста
     */
    getPostById(id: string): DB_RESULTS.NOT_FOUND | PostOutput {
        return postsRepository.getPostById(id)
    },
    /**
     * Сначала находим blog по id. Он всегда здесь будет найден, поскольку на этапе валидации запроса мы это проверяем.
     * Не дошли бы сюда, если бы блога с таким id не было
     * Ищем пост по id, если его нет, то выходим из функции
     * Если пост есть, то создаем новый объект поста с таким же id и присваиваем ему значения из запроса и blogName из найденного блога
     * Передаем объект в postsRepository для обновления
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
            blogName: foundBlog!.name,
            createdAt: foundPost.createdAt
        }
        postsRepository.updatePostById(updatedPost)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Передаем id поста в postsRepository для поиска и удаления, если есть.
     * Если поста нет, то вернем DB_RESULTS.NOT_FOUND
     * Если пост есть, то удалим его в репозитории и вернется DB_RESULTS.SUCCESSFULLY_COMPLETED
     * @param id id блога
     */
    deletePostById(id: string): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        return postsRepository.deletePostById(id)
    }
}