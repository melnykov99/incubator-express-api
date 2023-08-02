import {BlogOutput} from "../types/blogsTypes";
import {DB_RESULTS} from "../common/constants";

//Пока нет базы данных объявляем массив с блогами
export let blogsDB: BlogOutput[] = []

export const blogsRepository = {
    deleteAllBlogs(): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        blogsDB = []
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    getAllBlogs(): BlogOutput[] {
        return blogsDB
    },
    createBlog(newBlog: BlogOutput): BlogOutput {
        blogsDB.push(newBlog)
        return newBlog
    },
    getBlogById(id: string): BlogOutput | DB_RESULTS.NOT_FOUND {
        const foundVideo: BlogOutput | undefined = blogsDB.find(b => b.id === id)
        if (foundVideo === undefined) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundVideo
    },
    /**
     * Обновляем блог по id. findIndex точно найдет блог потому что до этого в service искали блог. Сюда не дошли, если бы не было
     * @param id
     * @param updatedBlog
     */
    updateBlogById(id: string, updatedBlog: BlogOutput): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const videoIndex: number = blogsDB.findIndex(b => b.id === id)
        blogsDB[videoIndex] = updatedBlog
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    deleteBlogById(id: string): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const videoIndex: number = blogsDB.findIndex(b => b.id === id)
        if(videoIndex === -1) {
            return DB_RESULTS.NOT_FOUND
        }
        blogsDB.splice(videoIndex, 1)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}