// Пока нет базы данных объявляем массив с постами
import {PostOutput} from "../types/postsTypes";
import {DB_RESULTS} from "../common/constants";

export let postsDB: PostOutput[] = []
export const postsRepository = {
    deleteAllPosts(): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        postsDB = []
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    getAllPosts(): PostOutput[] {
        return postsDB
    },
    createPost(newPost: PostOutput): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        postsDB.push(newPost)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}