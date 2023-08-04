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
    getAllBlogs(): BlogOutput[] {
        return blogsRepository.getAllBlogs()
    },
    /**
     * Принимаем весь запрос и из его body достаем инфу для нового объекта blog. Созданный объект передаем в blogsRepository для создания
     * Возвращаем созданный блог
     * @param req запрос в теле которого значения для создания блога
     */
    createBlog(req: RequestWithBody<CreateUpdateBlog>): BlogOutput {
        const newBlog: BlogOutput = {
            id: Date.now().toString(),
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        }
        return blogsRepository.createBlog(newBlog)
    },
    /**
     * Передаем в blogsRepository id блога для поиска. Если от БД приходит undefined, то возвращаем константу, что сущность не найдена
     * Если блог нашли по id, то возаращем его
     * @param id id блога
     */
    getBlogById(id: string): BlogOutput | DB_RESULTS.NOT_FOUND {
        const foundBlog: BlogOutput | undefined = blogsRepository.getBlogById(id)
        if (foundBlog === undefined) {
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
    updateBlogById(req: RequestWithParamsAndBody<GetDeleteBlogById, CreateUpdateBlog>): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const blogId: string = req.params.id
        const foundBlog: BlogOutput | undefined = blogsRepository.getBlogById(blogId)
        if (foundBlog === undefined) {
            return DB_RESULTS.NOT_FOUND
        }
        const updatedBlog: BlogOutput = {
            id: foundBlog.id,
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        }
        return blogsRepository.updateBlogById(updatedBlog)
    },
    /**
     * Передаем id блога в blogsRepository для поиска и удаления, если есть.
     * Если блога нет, то вернем DB_RESULTS.NOT_FOUND
     * Если блог есть, то удалим его в репозитории и вернется DB_RESULTS.SUCCESSFULLY_COMPLETED
     * @param id id блога
     */
    deleteBlogById(id: string): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        return blogsRepository.deleteBlogById(id)
    }
}