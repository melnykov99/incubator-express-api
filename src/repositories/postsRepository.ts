// Пока нет базы данных объявляем массив с постами
import {PostOutput} from "../types/postsTypes";
import {DB_RESULTS} from "../common/constants";

export let postsDB: PostOutput[] = []
export const postsRepository = {
    /**
     * Делаем массив пустым, удаляя все данные
     */
    deleteAllPosts(): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        postsDB = []
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Отдаем весь массив с постами
     */
    getAllPosts(): PostOutput[] {
        return postsDB
    },
    /**
     * Добавляем объект поста в массив
     * @param newPost объект поста, который сформировали в postsService из присланных данных в запросе
     */
    createPost(newPost: PostOutput): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        postsDB.push(newPost)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Находим пост по id и возвращаем его или undefined
     * @param id id поста
     */
    getPostById(id: string): DB_RESULTS.NOT_FOUND | PostOutput {
        const foundPost: undefined | PostOutput = postsDB.find(p => p.id === id)
        if (foundPost === undefined) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundPost
    },
    /**
     * Обновляем пост по id. findIndex точно найдет пост потому что до этого в service искали пост. Сюда не дошли, если бы не было
     * @param updatedPost объект поста с обновленными значениями, его нужно занести в БД вместо текущего поста
     */
    updatePostById(updatedPost: PostOutput): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const postIndex: number = postsDB.findIndex(p => p.id === updatedPost.id)
        postsDB[postIndex] = updatedPost
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Ищем индекс поста, который совпадает по id. Если не находим, то возвращаем DB_RESULTS.NOT_FOUND
     * Если пост есть, то по индексу удаляем его из массива
     * @param id id поста
     */
    deletePostById(id: string): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const postIndex: number = postsDB.findIndex(p => p.id === id)
        if (postIndex === -1) {
            return DB_RESULTS.NOT_FOUND
        }
        postsDB.splice(postIndex, 1)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}