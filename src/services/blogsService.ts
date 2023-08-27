import {blogsRepository} from "../repositories/blogsRepository";
import {BlogOutput} from "../types/blogsTypes";
import {DB_RESULTS} from "../common/constants";
import {RequestWithBody, RequestWithParamsAndBody} from "../types/requestGenerics";
import {CreateUpdateBlog} from "../dto/blogs/CreateUpdateBlog";
import {GetDeleteBlogById} from "../dto/blogs/GetDeleteBlogById";

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
    }
}