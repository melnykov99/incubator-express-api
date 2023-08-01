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
    createBlog(): BlogOutput {
        return blogsDB[0]
    },
    getBlogById(id: string): BlogOutput | DB_RESULTS.NOT_FOUND {
        const foundVideo: BlogOutput | undefined = blogsDB.find(b => b.id === id)
        if (foundVideo === undefined) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundVideo
    }
}