import {BlogOutput} from "../types/blogsTypes";
import {DB_RESULTS} from "../common/constants";
import {db} from "./db";
import {DeleteResult} from "mongodb";

export const blogsRepository = {
    /**
     * Обращаемся к коллеакции блогов в БД и удаляем все данные
     */
    async deleteAllBlogs(): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.blogsCollection.deleteMany({})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Отдаем все блоги из БД. Отдаем без монговского _id
     */
    async getAllBlogs(): Promise<BlogOutput[]> {
        return await db.blogsCollection.find({}, {projection: {_id: 0}}).toArray()
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
        return await db.blogsCollection.findOne({id})
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