import {BlogOutput, BlogViewModel} from "../types/blogsTypes";
import {DB_RESULTS} from "../utils/common/constants";
import {db} from "./db";
import {DeleteResult} from "mongodb";
import {RequestWithQuery} from "../types/requestGenerics";
import {GetBlogsWithQuery} from "../dto/blogs/GetBlogsWithQuery";
import {paginationAndSorting} from "../utils/common/paginationAndSorting";
import {PagSortValues} from "../types/commonTypes";
import {searchNameTermDefinition} from "../utils/blogs/searchNameTermDefinition";

export const blogsRepository = {
    /**
     * Обращаемся к коллеакции блогов в БД и удаляем все данные
     */
    async deleteAllBlogs(): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.blogsCollection.deleteMany({})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Обращаемся к функции определения searchNameTerm, передавая ей значение из query параметра.
     * searchNameTerm затем используем как фильтр в выводе (.find) и в функции пагинации/сортировки (.countDocuments)
     * Обращаемся к функции пагинации и сортировки, передавая query параметры из запроса и название коллекции
     * Функция возвращает PagSortValues к которым обращаемся для формирования объекта, который будем возвращать
     * Возвращаем информацию о страницах и в объекте items возвращаем массив с блогами
     * Блоги из БД отдаем без монговского _id
     * @param req запрос в котором параметры для пагинации и сортировки. sortBy, sortDirection, pageNumber, pageSize
     */
    async getBlogs(req: RequestWithQuery<GetBlogsWithQuery>): Promise<BlogViewModel> {
        const searchNameTerm: {} | {name: string} = searchNameTermDefinition(req.query.searchNameTerm)
        const pagSortValues: PagSortValues = await paginationAndSorting(
            req.query.sortBy, req.query.sortDirection, req.query.pageNumber, req.query.pageSize, 'blogsCollection',searchNameTerm)
        return {
            pagesCount: pagSortValues.pagesCount,
            page: pagSortValues.pageNumber,
            pageSize: pagSortValues.pageSize,
            totalCount: pagSortValues.totalCount,
            items: await db.blogsCollection
                .find(searchNameTerm, {projection: {_id: 0}})
                .skip(pagSortValues.skip)
                .limit(pagSortValues.limit)
                .sort({[pagSortValues.sortBy]: pagSortValues.sortDirection})
                .toArray()
        }
    },
    /**
     * Добавляем объект блога в БД
     * @param newBlog объект блога, который сформировали в blogsService из присланных данных в запросе
     */
    async createBlog(newBlog: BlogOutput): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.blogsCollection.insertOne(newBlog)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Находим блог по id и возвращаем его или null
     * @param id id блога
     */
    async getBlogById(id: string): Promise<BlogOutput | null> {
        return await db.blogsCollection.findOne({id}, {projection: {_id: 0}})
    },
    /**
     * Обновляем блог по id. Блон точно будет найден потому что до этого в service искали блог. Сюда не дошли, если бы не было
     * Поэтому возвращаем всегда константу об успешном выполнении
     * @param id id блога
     * @param updatedBlog объект блога с обновленными значениями, его нужно занести в БД вместо текущего блога
     */
    async updateBlogById(id: string, updatedBlog: BlogOutput): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.blogsCollection.updateOne({id}, {$set: updatedBlog})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Удаляем блог по id. Если блога нет, то в deletedCount будте 0. В таком случае вернем NOT_FOUND
     * @param id id блога
     */
    async deleteBlogById(id: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const deleteResult: DeleteResult = await db.blogsCollection.deleteOne({id})
        if (deleteResult.deletedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}