import {BlogOutput, BlogViewModel} from "../types/blogsTypes";
import {DB_RESULTS} from "../utils/common/constants";
import {db} from "./db";
import {DeleteResult} from "mongodb";
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
     * searchNameTerm затем используем как filter в выводе (.find) и в функции пагинации/сортировки (.countDocuments)
     * Обращаемся к функции пагинации и сортировки, передавая query параметры пагинации и сортировки, а также название коллекции
     * Функция отдает PagSortValues к которым обращаемся для формирования объекта, который будем возвращать
     * Возвращаем информацию о страницах и в объекте items возвращаем массив с блогами. Если блогов по указанному фильтру нет, то будет пустой массив
     * Блоги из БД отдаем без монговского _id
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
        const filter: {} | { name: string } = searchNameTermDefinition(searchNameTerm)
        const pagSortValues: PagSortValues = await paginationAndSorting(sortBy, sortDirection, pageNumber, pageSize, 'blogsCollection', filter)
        return {
            pagesCount: pagSortValues.pagesCount,
            page: pagSortValues.pageNumber,
            pageSize: pagSortValues.pageSize,
            totalCount: pagSortValues.totalCount,
            items: await db.blogsCollection
                .find(filter, {projection: {_id: 0}})
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
     * Находим блог по id, если блога с таким id нет, то БД вернет null
     * Если пришло значение null, то возвращаем константу DB_RESULTS.NOT_FOUND
     * Иначе возвращаем найденный блог
     * @param id id блога
     */
    async getBlogById(id: string): Promise<BlogOutput | DB_RESULTS.NOT_FOUND> {
        const foundBLog: BlogOutput | null = await db.blogsCollection.findOne({id}, {projection: {_id: 0}})
        if (!foundBLog) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundBLog
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