import {blogsRepository} from "../repositories/blogsRepository";
import {BlogOutput, BlogViewModel} from "../types/blogsTypes";
import {DB_RESULTS} from "../utils/common/constants";
import {PostOutput, PostViewModel} from "../types/postsTypes";
import {postsRepository} from "../repositories/postsRepository";

export const blogsService = {
    /**
     * обращаемся к blogsRepository, чтобы достать блоги из БД
     * @param searchNameTerm name блога по которому будет осуществляться поиск
     * @param sortBy по какому полю выполнить сортировку и вернуть результат
     * @param sortDirection с каким направлением сделать сортировку asc или desc
     * @param pageNumber номер страницы для вывода
     * @param pageSize размер выводимой страницы
     */
    async getBlogs(searchNameTerm: string | undefined,
                   sortBy: string | undefined,
                   sortDirection: string | undefined,
                   pageNumber: string | undefined,
                   pageSize: string | undefined): Promise<BlogViewModel> {
        return await blogsRepository.getBlogs(searchNameTerm, sortBy, sortDirection, pageNumber, pageSize)
    },
    /**
     * Принимаем данные из body запроса для нового объекта blog. Созданный объект передаем в blogsRepository для создания
     * Возвращаем созданный блог
     * @param name название блога
     * @param description описание блога
     * @param websiteUrl адрес блога
     */
    async createBlog(name: string, description: string, websiteUrl: string): Promise<BlogOutput> {
        const newBlog: BlogOutput = {
            id: Date.now().toString(),
            name: name,
            description: description,
            websiteUrl: websiteUrl,
            createdAt: (new Date().toISOString()),
            isMembership: false
        }
        //здесь создаем новую константу newBlogForDB и прокидываем в нее значения из newBlog.
        //иначе MongoDB добавляет в newBlog ключ _id при выполнении функции createBlog и мы возвращаем неправильные данные
        const newBlogForDB: BlogOutput = {...newBlog}
        //здесь mongoDB под капотом добавляет передаваемому объекту ключ _id
        await blogsRepository.createBlog(newBlogForDB)
        return newBlog
    },
    /**
     * Передаем в blogsRepository id блога для поиска. Если от БД приходит null, то возвращаем константу, что сущность не найдена
     * Если блог нашли по id, то возаращем его
     * @param id id блога
     */
    async getBlogById(id: string): Promise<BlogOutput | DB_RESULTS.NOT_FOUND> {
        return await blogsRepository.getBlogById(id)
    },
    /**
     * Принимаем id блога и значения для обновления этого блога из body запроса
     * Ищем блог по id, если его нет, то выходим из функции
     * Если блог есть, то создаем новый объект с его id + значениями из запроса и передаем это в blogsRepository для обновления
     * @param id id блога, который нужно изменить
     * @param name новое имя блога
     * @param description новое описание блога
     * @param websiteUrl новый адрес блога
     */
    async updateBlogById(id: string, name: string, description: string, websiteUrl: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const foundBlog: BlogOutput | DB_RESULTS.NOT_FOUND = await blogsRepository.getBlogById(id)
        if (foundBlog === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const updatedBlog: BlogOutput = {
            id: foundBlog.id,
            name: name,
            description: description,
            websiteUrl: websiteUrl,
            createdAt: foundBlog.createdAt,
            isMembership: foundBlog.isMembership
        }
        return await blogsRepository.updateBlogById(id, updatedBlog)
    },
    /**
     * Передаем id блога в blogsRepository для поиска и удаления, если есть.
     * Если блога нет, то вернем DB_RESULTS.NOT_FOUND
     * Если блог есть, то удалим его в репозитории и вернется DB_RESULTS.SUCCESSFULLY_COMPLETED
     * @param id id блога
     */
    async deleteBlogById(id: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        return await blogsRepository.deleteBlogById(id)
    },
    /**
     * Ищем посты которые привязаны к конкретному блогу.
     * Обращаемся к postsRepository для этого. Если блога нет или постов у этого блога нет, то в items будет пустой массив
     * @param blogId id блога по которому нужно достать почты
     * @param sortBy по какому полю выполнить сортировку и вернуть результат
     * @param sortDirection с каким направлением сделать сортировку asc или desc
     * @param pageNumber номер страницы для вывода
     * @param pageSize размер выводимой страницы
     */
    async getPostsByBlogId(blogId: string,
                           sortBy: string | undefined,
                           sortDirection: string | undefined,
                           pageNumber: string | undefined,
                           pageSize: string | undefined): Promise<DB_RESULTS.NOT_FOUND | PostViewModel> {
        const foundPosts: PostViewModel = await postsRepository.getPostsByBlogId(blogId, sortBy, sortDirection, pageNumber, pageSize)
        if (!foundPosts.items.length) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundPosts
    },
    /** Создаем пост для конкретного блога.
     * Находим blog по id. Если блога нет, то выходим из функции сразу.
     * Если блог есть, то создаем объект поста, передаем ему значения из тела запроса и blogName из найденного блога.
     * Созданный объект передаем в postsRepository для создания поста. Возвращаемый созданный пост
     * @param blogId id блога к которому создаем пост
     * @param title название поста
     * @param shortDescription описание поста
     * @param content контент поста
     */
    async createPostByBlogId(blogId: string, title: string, shortDescription: string, content: string): Promise<DB_RESULTS.NOT_FOUND | PostOutput> {
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
    }
}