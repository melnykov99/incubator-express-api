import {blogsRepository} from "../repositories/blogsRepository";
import {BlogOutput} from "../types/blogsTypes";
import {DB_RESULTS} from "../common/constants";
import {RequestWithBody, RequestWithParamsAndBody} from "../types/requestGenerics";
import {CreateUpdateBlog} from "../dto/blogs/CreateUpdateBlog";
import {GetDeleteBlogById} from "../dto/blogs/GetDeleteBlogById";
import {PostOutput} from "../types/postsTypes";
import {postsRepository} from "../repositories/postsRepository";
import {CreatePostByBlogId} from "../dto/posts/CreatePostByBlogId";

export const blogsService = {
    /**
     * обращаемся к blogsRepository, чтобы достать все блоги из БД
     */
    async getAllBlogs(): Promise<BlogOutput[]> {
        return await blogsRepository.getAllBlogs()
    },
    /**
     * Принимаем весь запрос и из его body достаем инфу для нового объекта blog. Созданный объект передаем в blogsRepository для создания
     * Возвращаем созданный блог
     * @param req запрос в теле которого значения для создания блога
     */
    async createBlog(req: RequestWithBody<CreateUpdateBlog>): Promise<BlogOutput> {
        const newBlog: BlogOutput = {
            id: Date.now().toString(),
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
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
        const foundBlog: BlogOutput | null = await blogsRepository.getBlogById(id)
        if (foundBlog === null) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundBlog
    },
    /**
     * Принимаем запрос с значениями для обновления блога и id блога
     * Ищем блог по id, если его нет, то выходим из функции
     * Если блог есть, то создаем новый объект с его id + значениями из запроса и передаем это в blogsRepository для обновления
     * @param req запрос в теле которого значения для обновления блога
     */
    async updateBlogById(req: RequestWithParamsAndBody<GetDeleteBlogById, CreateUpdateBlog>): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const blogId: string = req.params.id
        const foundBlog: BlogOutput | null = await blogsRepository.getBlogById(blogId)
        if (foundBlog === null) {
            return DB_RESULTS.NOT_FOUND
        }
        const updatedBlog: BlogOutput = {
            id: foundBlog.id,
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
            createdAt: foundBlog.createdAt,
            isMembership: foundBlog.isMembership
        }
        return await blogsRepository.updateBlogById(blogId, updatedBlog)
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
     * Обращаемся к postsRepository для этого. Если блога нет или постов у этого блога нет, то придет пустой массив
     * @param blogId id блога к которому привязаны посты
     */
    async getPostsByBlogId(blogId: string): Promise<DB_RESULTS.NOT_FOUND | PostOutput[]> {
        const foundPosts: PostOutput[] = await postsRepository.getPostsByBlogId(blogId)
        if (!foundPosts.length) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundPosts
    },
    /** Создаем пост для конкретного блога.
     * Находим blog по id, который есть в параметре запроса. Если блоаг нет, то выходим из функции сразу.
     * Если блог есть, то создаем объект поста, передаем ему значения из запроса, blogName из найденного блога.
     * Созданный объект передаем в postsRepository для создания поста. Возвращаемый созданный пост
     * @param req передаем сюда запрос целиком. В req.params лежит blogId
     * В теле запроса title, shortDescription и content
     */
    async createPostByBlogId(req: RequestWithParamsAndBody<GetDeleteBlogById, CreatePostByBlogId>) {
        const foundBlog: BlogOutput | null = await blogsRepository.getBlogById(req.params.id)
        if (foundBlog === null) {
            return DB_RESULTS.NOT_FOUND
        }
        const newPost: PostOutput = {
            id: Date.now().toString(),
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.params.id,
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