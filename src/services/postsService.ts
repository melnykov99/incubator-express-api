import {postsRepository} from "../repositories/postsRepository";
import {PostOutput, PostViewModel} from "../types/postsTypes";
import {BlogOutput} from "../types/blogsTypes";
import {blogsRepository} from "../repositories/blogsRepository";
import {DB_RESULTS} from "../utils/common/constants";
import {CommentInDB, CommentOutput, CommentsViewModel} from "../types/commentsTypes";
import {commentsRepository} from "../repositories/commentsRepository";

export const postsService = {
    /**
     * Обращаемся к postsRepository, запрашивая посты. Отдаем значения для пагинации и сортировки
     * @param sortBy по какому полю выполнить сортировку и вернуть результат
     * @param sortDirection с каким направлением сделать сортировку asc или desc
     * @param pageNumber номер страницы для вывода
     * @param pageSize размер выводимой страницы
     */
    async getPosts(sortBy: string | undefined, sortDirection: string | undefined, pageNumber: string | undefined, pageSize: string | undefined): Promise<PostViewModel> {
        return await postsRepository.getPosts(sortBy, sortDirection, pageNumber, pageSize)
    },
    /**
     * Сначала находим blog по id. Он всегда здесь будет найден, поскольку на этапе валидации запроса мы это проверяем.
     * Не дошли бы сюда, если бы блога с таким id не было. Поэтому доп. проверку здесь не делаем
     * Создаем объект нового блога, закидываем в него значения из запроса и blogName из найденного блога
     * Передаем этот объект в postsRepository
     * @param title название поста
     * @param shortDescription описание поста
     * @param content контент поста
     * @param blogId id блога по которому создаем пост
     */
    async createPost(title: string, shortDescription: string, content: string, blogId: string): Promise<PostOutput | DB_RESULTS.NOT_FOUND> {
        const foundBlog: BlogOutput | DB_RESULTS.NOT_FOUND = await blogsRepository.getBlogById(blogId)
        if (foundBlog === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const newPost: PostOutput = {
            id: Date.now().toString(),
            title: title,
            shortDescription: shortDescription,
            content: content,
            blogId: blogId,
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
     * Ищем пост по id, если его нет, то выходим из функции
     * Если пост есть, то создаем новый объект поста с таким же id и присваиваем ему значения из запроса и blogName из найденного блога
     * Передаем объект в postsRepository для обновления
     * @param postId id поста, который нужно изменить
     * @param title новое название поста
     * @param shortDescription новое описание поста
     * @param content новый контент поста
     * @param blogId новый id блога к которому принадлежит пост
     */
    async updatePostById(postId: string, title: string, shortDescription: string, content: string, blogId: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const foundBlog: DB_RESULTS.NOT_FOUND | BlogOutput = await blogsRepository.getBlogById(blogId)
        if (foundBlog === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const foundPost: PostOutput | DB_RESULTS.NOT_FOUND = await postsRepository.getPostById(postId)
        if (foundPost === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const updatedPost: PostOutput = {
            id: foundPost.id,
            title: title,
            shortDescription: shortDescription,
            content: content,
            blogId: blogId,
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
     * Ищем пост по id, если не находим, то прерываем функцию и возвращаем DB_RESULTS.NOT_FOUND
     * Если пост есть, то идем за всеми комментариями к этому посту вызывая getCommentsByPostId и передавая id поста, значения пагинации и сортировки
     * @param postId id поста по которому запрашиваем комментарии
     * @param sortBy по какому полю выполнить сортировку и вернуть результат
     * @param sortDirection с каким направлением сделать сортировку asc или desc
     * @param pageNumber номер страницы для вывода
     * @param pageSize размер выводимой страницы
     */
    async getCommentsByPostId(postId: string,
                              sortBy: string | undefined,
                              sortDirection: string | undefined,
                              pageNumber: string | undefined,
                              pageSize: string | undefined): Promise<DB_RESULTS.NOT_FOUND | CommentsViewModel> {
        const foundPost: PostOutput | DB_RESULTS.NOT_FOUND = await postsRepository.getPostById(postId)
        if (foundPost === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        return await commentsRepository.getCommentsByPostId(postId, sortBy, sortDirection, pageNumber, pageSize)
    },
    /**
     * Создание комментарией к определенному посту
     * Ищем пост по postId. Если не находим, то прерываем функцию и возвращаем DB_RESULTS.NOT_FOUND
     * Если пост есть, то создаем объект с новым комментарием
     * Новый комментарий передаем в repository для добавления в БД
     * В return собираем те данные, которые нужно вернуть клиенту
     * @param postId id поста к которому создаем комментарий
     * @param content контент комментария
     * @param userId id пользователя, который добавляет комментарий. Пользователя определяем в мидлваре jwtAuth
     * @param userLogin логин пользователя, который добавляет комментарий. Пользователя определяем в мидлваре jwtAuth
     */
    async createCommentByPostId(postId: string, content: string, userId: string, userLogin: string): Promise<DB_RESULTS.NOT_FOUND | CommentOutput> {
        const foundPost: PostOutput | DB_RESULTS.NOT_FOUND = await postsRepository.getPostById(postId)
        if (foundPost === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const newComment: CommentInDB = {
            id: Date.now().toString(),
            content: content,
            commentatorInfo: {
                userId: userId,
                userLogin: userLogin
            },
            createdAt: (new Date().toISOString()),
            postId: postId
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