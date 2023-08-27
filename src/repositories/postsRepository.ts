// Пока нет базы данных объявляем массив с постами
import {PostOutput} from "../types/postsTypes";
import {DB_RESULTS} from "../common/constants";
import {db} from "./db";
import {DeleteResult} from "mongodb";

export const postsRepository = {
    /**
     * Обращаемся к коллеакции постов в БД и удаляем все данные
     */
    async deleteAllPosts(): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.postsCollection.deleteMany({})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Отдаем все посты из БД. Отдаем без монговского _id
     */
    async getAllPosts(): Promise<PostOutput[]> {
        return await db.postsCollection.find({}, {projection: {_id: 0}}).toArray()
    },
    /**
     * Добавляем объект поста в массив
     * @param newPost объект поста, который сформировали в postsService из присланных данных в запросе
     */
    async createPost(newPost: PostOutput): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.postsCollection.insertOne(newPost)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Находим пост по id и возвращаем его или null
     * @param id id поста
     */
    async getPostById(id: string): Promise<PostOutput | null> {
        return await db.postsCollection.findOne({id})
    },
    /**
     * Обновляем пост по id. Пост точно будет найден потому что до этого в service искали его. Сюда не дошли, если бы не было
     * Поэтому возвращаем всегда константу об успешном выполнении
     * @param id id поста
     * @param updatedPost объект поста с обновленными значениями, его нужно занести в БД вместо текущего поста
     */
    async updatePostById(id: string, updatedPost: PostOutput): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.postsCollection.updateOne({id}, updatedPost)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Удаляем пост по id. Если поста нет, то в deletedCount будте 0. В таком случае вернем NOT_FOUND
     * @param id id поста
     */
    async deletePostById(id: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const deleteResult: DeleteResult = await db.postsCollection.deleteOne({id})
        if (deleteResult.deletedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}