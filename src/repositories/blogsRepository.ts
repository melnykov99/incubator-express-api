import {BlogOutput} from "../types/blogsTypes";
import {DB_RESULTS} from "../common/constants";

//Пока нет базы данных объявляем массив с блогами
export let blogsDB: BlogOutput[] = []

export const blogsRepository = {
    /**
     * Делаем массив пустым, удаляя все данные
     */
    deleteAllBlogs(): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        blogsDB = []
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Отдаем весь массив с блогами
     */
    getAllBlogs(): BlogOutput[] {
        return blogsDB
    },
    /**
     * Добавляем объект блога в массив
     * @param newBlog объект блога, который сформировали в blogsService из присланных данных в запросе
     */
    createBlog(newBlog: BlogOutput): BlogOutput {
        blogsDB.push(newBlog)
        return newBlog
    },
    /**
     * Находим блог по id и возвращаем его или undefined
     * @param id id блога
     */
    getBlogById(id: string): BlogOutput | undefined {
        return blogsDB.find(b => b.id === id)
    },
    /**
     * Обновляем блог по id. findIndex точно найдет блог потому что до этого в service искали блог. Сюда не дошли, если бы не было
     * @param updatedBlog объект блога с обновленными значениями, его нужно занести в БД вместо текущего блога
     */
    updateBlogById(updatedBlog: BlogOutput): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const blogIndex: number = blogsDB.findIndex(b => b.id === updatedBlog.id)
        blogsDB[blogIndex] = updatedBlog
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Ищем индекс блога, который совпадает по id. Если не находим, то возвращаем DB_RESULTS.NOT_FOUND
     * Если блог есть, то по индексу удаляем его из массива
     * @param id id блога
     */
    deleteBlogById(id: string): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const blogIndex: number = blogsDB.findIndex(b => b.id === id)
        if(blogIndex === -1) {
            return DB_RESULTS.NOT_FOUND
        }
        blogsDB.splice(blogIndex, 1)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}