import {PostOutput, PostViewModel} from "../types/postsTypes";
import {DB_RESULTS} from "../utils/common/constants";
import {db} from "./db";
import {DeleteResult} from "mongodb";
import {PagSortValues} from "../types/commonTypes";
import {paginationAndSorting} from "../utils/common/paginationAndSorting";

export const postsRepository = {
    /**
     * Обращаемся к коллеакции постов в БД и удаляем все данные
     */
    async deleteAllPosts(): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.postsCollection.deleteMany({})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Обращаемся к функции пагинации и сортировки, передавая query параметры пагинации/сортировки и название коллекции
     * Функция возвращает PagSortValues к которым обращаемся для формирования объекта
     * Возвращаем информацию о страницах и в объекте items возвращаем массив с постами
     * Посты из БД отдаем без монговского _id
     * @param sortBy по какому полю выполнить сортировку и вернуть результат
     * @param sortDirection с каким направлением сделать сортировку asc или desc
     * @param pageNumber номер страницы для вывода
     * @param pageSize размер выводимой страницы
     */
    async getPosts(sortBy: string | undefined, sortDirection: string | undefined, pageNumber: string | undefined, pageSize: string | undefined): Promise<PostViewModel> {
        const pagSortValues: PagSortValues = await paginationAndSorting(sortBy, sortDirection, pageNumber, pageSize, 'postsCollection')
        return {
            pagesCount: pagSortValues.pagesCount,
            page: pagSortValues.pageNumber,
            pageSize: pagSortValues.pageSize,
            totalCount: pagSortValues.totalCount,
            items: await db.postsCollection
                .find({}, {projection: {_id: 0}})
                .skip(pagSortValues.skip)
                .limit(pagSortValues.limit)
                .sort({[pagSortValues.sortBy]: pagSortValues.sortDirection})
                .toArray()
        }
    },
    /**
     * Добавляем объект поста в БД
     * @param newPost объект поста, который сформировали из присланных данных в запросе
     */
    async createPost(newPost: PostOutput): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.postsCollection.insertOne(newPost)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Находим пост по id, если его нет, то придет null. В этом случае возвращаем константу DB_RESULTS.NOT_FOUND
     * Если пост есть, то вернем его
     * @param id id поста
     */
    async getPostById(id: string): Promise<PostOutput | DB_RESULTS.NOT_FOUND> {
        const foundPost: PostOutput | null = await db.postsCollection.findOne({id}, {projection: {_id: 0}})
        if (!foundPost) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundPost
    },
    /**
     * Обновляем пост по id. Пост точно будет найден потому что до этого в service искали его. Сюда не дошли, если бы не было
     * Поэтому возвращаем всегда константу об успешном выполнении
     * @param id id поста
     * @param updatedPost объект поста с обновленными значениями, его нужно занести в БД вместо текущего поста
     */
    async updatePostById(id: string, updatedPost: PostOutput): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.postsCollection.updateOne({id}, {$set: updatedPost})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Удаляем пост по id. Если поста нет, то в deletedCount будет 0. В таком случае вернем NOT_FOUND
     * @param id id поста
     */
    async deletePostById(id: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const deleteResult: DeleteResult = await db.postsCollection.deleteOne({id})
        if (deleteResult.deletedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Обращаемся к функции пагинации и сортировки, передавая query параметры пагинации и сортировки
     * Функция возвращает PagSortValues к которым обращаемся для формирования объекта, который будем возвращать
     * Возвращаем информацию о страницах и в объекте items возвращаем массив с постами
     * Посты из БД отдаем без монговского _id
     * Ищем посты которые привязаны к конкретному блогу. Если такого блога нет или у блога нет постов, то в items будет пустой массив
     * @param blogId id блога по которому нужно достать почты
     * @param sortBy по какому полю выполнить сортировку и вернуть результат
     * @param sortDirection с каким направлением сделать сортировку asc или desc
     * @param pageNumber номер страницы для вывода
     * @param pageSize размер выводимой страницы
     */
    async getPostsByBlogId(blogId: string,
                           sortBy: string | undefined,
                           sortDirection: string | undefined,
                           pageNumber: string | undefined,
                           pageSize: string | undefined): Promise<PostViewModel> {
        const filter: { blogId: string } = {blogId}
        const pagSortValues: PagSortValues = await paginationAndSorting(sortBy, sortDirection, pageNumber, pageSize, 'postsCollection', filter)
        return {
            pagesCount: pagSortValues.pagesCount,
            page: pagSortValues.pageNumber,
            pageSize: pagSortValues.pageSize,
            totalCount: pagSortValues.totalCount,
            items: await db.postsCollection
                .find(filter, {projection: {_id: 0}})
                .skip(pagSortValues.skip)
                .limit(pagSortValues.limit)
                .sort({[pagSortValues.sortBy]: pagSortValues.sortDirection})
                .toArray()
        }
    }
}