import {postsRepository} from "../repositories/postsRepository";
import {PostOutput, PostViewModel} from "../types/postsTypes";
import {RequestWithBody, RequestWithParamsAndBody, RequestWithQuery} from "../types/requestGenerics";
import {CreateUpdatePost} from "../dto/posts/CreateUpdatePost";
import {BlogOutput} from "../types/blogsTypes";
import {blogsRepository} from "../repositories/blogsRepository";
import {DB_RESULTS} from "../utils/common/constants";
import {GetDeletePostById} from "../dto/posts/GetDeletePostById";
import {GetPostsWithQuery} from "../dto/posts/GetPostsWithQuery";

export const postsService = {
    /**
     * Обращаемся к postsRepository, запрашивая посты. Отдаем весь запрос.
     * @param req запрос в котором параметры для пагинации. pageNumber и pageSize
     */
    async getPosts(req: RequestWithQuery<GetPostsWithQuery>): Promise<PostViewModel> {
        return await postsRepository.getPosts(req)
    },
    /**
     * Сначала находим blog по id. Он всегда здесь будет найден, поскольку на этапе валидации запроса мы это проверяем.
     * Не дошли бы сюда, если бы блога с таким id не было. Поэтому доп. проверку здесь не делаем
     * Создаем объект нового блога, закидываем в него значения из запроса и blogName из найденного блога
     * Передаем этот объект в postsRepository
     * @param req запрос в теле которого значения для создания поста
     */
    async createPost(req: RequestWithBody<CreateUpdatePost>): Promise<PostOutput | DB_RESULTS.NOT_FOUND> {
        const foundBlog: BlogOutput | null = await blogsRepository.getBlogById(req.body.blogId)
        const newPost: PostOutput = {
            id: Date.now().toString(),
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
            blogName: foundBlog!.name,
            createdAt: (new Date().toISOString()),
        }
        //здесь создаем новую константу newPostForDB и прокидываем в нее значения из newPost.
        //иначе MongoDB добавляет в newPost ключ _id при выполнении функции createPost и мы возвращаем неправильные данные
        const newPostForDB: PostOutput = {...newPost}
        //здесь mongoDB под капотом добавляет передаваемому объекту ключ _id
        await postsRepository.createPost(newPostForDB)
        return newPost
    },
    /**
     * Обращаемся к postsRepository, передавая id поста
     * Если поста нет, то из репозитория придет null. Если пост есть, то придет он
     * @param id id поста
     */
    async getPostById(id: string): Promise<DB_RESULTS.NOT_FOUND | PostOutput> {
        const foundPost: PostOutput | null = await postsRepository.getPostById(id)
        if (foundPost === null) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundPost
    },
    /**
     * Сначала находим blog по id. Он всегда здесь будет найден, поскольку на этапе валидации запроса мы это проверяем.
     * Не дошли бы сюда, если бы блога с таким id не было. Поэтому доп. проверку здесь не делаем
     * Ищем пост по id, если его нет, то выходим из функции
     * Если пост есть, то создаем новый объект поста с таким же id и присваиваем ему значения из запроса и blogName из найденного блога
     * Передаем объект в postsRepository для обновления
     * @param req
     */
    async updatePostById(req: RequestWithParamsAndBody<GetDeletePostById, CreateUpdatePost>): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const foundBlog: null | BlogOutput = await blogsRepository.getBlogById(req.body.blogId)
        const postId: string = req.params.id
        const foundPost: null | PostOutput = await postsRepository.getPostById(postId)
        if (foundPost === null) {
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
        return await postsRepository.updatePostById(postId, updatedPost)
    },
    /**
     * Передаем id поста в postsRepository для поиска и удаления, если есть.
     * Если поста нет, то вернем DB_RESULTS.NOT_FOUND
     * Если пост есть, то удалим его в репозитории и вернется DB_RESULTS.SUCCESSFULLY_COMPLETED
     * @param id id блога
     */
    async deletePostById(id: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        return postsRepository.deletePostById(id)
    }
}