import {postsRepository} from "../repositories/postsRepository";
import {PostOutput, PostViewModel} from "../types/postsTypes";
import {
    RequestWithBody,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../types/requestGenerics";
import {CreateUpdatePost} from "../dto/posts/CreateUpdatePost";
import {BlogOutput} from "../types/blogsTypes";
import {blogsRepository} from "../repositories/blogsRepository";
import {DB_RESULTS} from "../utils/common/constants";
import {GetDeletePostById} from "../dto/posts/GetDeletePostById";
import {GetPostsWithQuery} from "../dto/posts/GetPostsWithQuery";
import {GetCommentsByPostId} from "../dto/posts/GetCommentsByPostId";
import {CreateCommentByPostId} from "../dto/posts/CreateCommentByPostId";
import {CommentInDB, CommentOutput, CommentsViewModel} from "../types/commentsTypes";
import {commentsRepository} from "../repositories/commentsRepository";
import {GetCommentsByPostIdWithQuery} from "../dto/posts/GetCommentsByPostIdWithQuery";

export const postsService = {
    /**
     * Обращаемся к postsRepository, запрашивая посты. Отдаем весь запрос.
     * @param req запрос в котором параметры для пагинации и сортировки
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
        const foundBlog: BlogOutput | DB_RESULTS.NOT_FOUND = await blogsRepository.getBlogById(req.body.blogId)
        if (foundBlog === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const newPost: PostOutput = {
            id: Date.now().toString(),
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
            blogName: foundBlog.name,
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
        const foundPost: PostOutput | DB_RESULTS.NOT_FOUND = await postsRepository.getPostById(id)
        if (foundPost === DB_RESULTS.NOT_FOUND) {
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
        const foundBlog: DB_RESULTS.NOT_FOUND | BlogOutput = await blogsRepository.getBlogById(req.body.blogId)
        if (foundBlog === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const postId: string = req.params.id
        const foundPost: PostOutput | DB_RESULTS.NOT_FOUND = await postsRepository.getPostById(postId)
        if (foundPost === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const updatedPost: PostOutput = {
            id: foundPost.id,
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
            blogName: foundBlog.name,
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
    },
    /**
     * Поиск комментариев, которые принадлежат конкретному посту
     * Определяем константу postId и кладем в нее значение из params
     * Ищем пост по id, если не находим, то прерываем функцию и возвращаем DB_RESULTS.NOT_FOUND
     * Если пост есть, то идем за всеми комментариями к этому посту вызывая getCommentsByPostId и передавая весь запрос
     * @param req запрос, где в params лежит postId, а в query могут содержаться значения для пагинации и сортировки
     */
    async getCommentsByPostId(req: RequestWithParamsAndQuery<GetCommentsByPostId, GetCommentsByPostIdWithQuery>): Promise<DB_RESULTS.NOT_FOUND | CommentsViewModel> {
        const postId: string = req.params.postId
        const foundPost: PostOutput | DB_RESULTS.NOT_FOUND = await postsRepository.getPostById(postId)
        if (foundPost === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        return await commentsRepository.getCommentsByPostId(req)
    },
    /**
     * Создание комментарией к определенному посту
     * Ищем пост по postId из params. Если не находим, то прерываем функцию и возвращаем DB_RESULTS.NOT_FOUND
     * Если пост есть, то создаем объект с новым комментарием
     * Новый комментарий передаем в repository для добавления в БД
     * В return собираем те данные, которые нужно вернуть клиенту
     * @param req запрос в котором лежит postId в params, информация о комментарии в теле и информация о юзере в req.user
     */
    async createCommentByPostId(req: RequestWithParamsAndBody<GetCommentsByPostId, CreateCommentByPostId>): Promise<DB_RESULTS.NOT_FOUND | CommentOutput> {
        const foundPost: PostOutput | DB_RESULTS.NOT_FOUND = await postsRepository.getPostById(req.params.postId)
        if (foundPost === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const newComment: CommentInDB = {
            id: Date.now().toString(),
            content: req.body.content,
            commentatorInfo: {
                userId: req.user.id,
                userLogin: req.user.login
            },
            createdAt: (new Date().toISOString()),
            postId: req.params.postId
        }
        await commentsRepository.createCommentByPostId(newComment)
        return {
            id: newComment.id,
            content: newComment.content,
            commentatorInfo: newComment.commentatorInfo,
            createdAt: newComment.createdAt
        }
    }
}