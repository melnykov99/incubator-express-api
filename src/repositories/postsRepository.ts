import {PostOutput, PostViewModel} from "../types/postsTypes";
import {DB_RESULTS} from "../utils/common/constants";
import {db} from "./db";
import {DeleteResult} from "mongodb";
import {RequestWithParamsAndQuery, RequestWithQuery} from "../types/requestGenerics";
import {GetPostsWithQuery} from "../dto/posts/GetPostsWithQuery";
import {PagSortValues} from "../types/commonTypes";
import {paginationAndSorting} from "../utils/common/paginationAndSorting";
import {GetDeleteBlogById} from "../dto/blogs/GetDeleteBlogById";

export const postsRepository = {
    /**
     * Обращаемся к коллеакции постов в БД и удаляем все данные
     */
    async deleteAllPosts(): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.postsCollection.deleteMany({})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Обращаемся к функции пагинации и сортировки, передавая query параметры из запроса и название коллекции
     * Функция возвращает PagSortValues к которым обращаемся для формирования объекта, который будем возвращать
     * Возвращаем информацию о страницах и в объекте items возвращаем массив с постами
     * Посты из БД отдаем без монговского _id
     * @param req запрос в котором параметры для пагинации и сортировки. sortBy, sortDirection, pageNumber, pageSize
     */
    async getPosts(req: RequestWithQuery<GetPostsWithQuery>): Promise<PostViewModel> {
        const pagSortValues: PagSortValues = await paginationAndSorting(
            req.query.sortBy, req.query.sortDirection, req.query.pageNumber, req.query.pageSize, 'postsCollection')
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
     * Находим пост по id и возвращаем его или null
     * @param id id поста
     */
    async getPostById(id: string): Promise<PostOutput | null> {
        return await db.postsCollection.findOne({id}, {projection: {_id: 0}})
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
     * Удаляем пост по id. Если поста нет, то в deletedCount будте 0. В таком случае вернем NOT_FOUND
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
     * Обращаемся к функции пагинации и сортировки, передавая query параметры из запроса и название коллекции
     * Функция возвращает PagSortValues к которым обращаемся для формирования объекта, который будем возвращать
     * Возвращаем информацию о страницах и в объекте items возвращаем массив с постами
     * Посты из БД отдаем без монговского _id
     * Ищем посты которые привязаны к конкретному блогу. Если такого блога нет или у блога нет постов, то в items будет пустой массив
     * @param req запрос в котором параметры для пагинации и сортировки. sortBy, sortDirection, pageNumber, pageSize
     */
    async getPostsByBlogId(req: RequestWithParamsAndQuery<GetDeleteBlogById, GetPostsWithQuery>): Promise<PostViewModel> {
        const filter: string = req.params.id
        console.log(filter)
        const pagSortValues: PagSortValues = await paginationAndSorting(
            req.query.sortBy, req.query.sortDirection, req.query.pageNumber, req.query.pageSize, 'postsCollection', filter)
        return {
            pagesCount: pagSortValues.pagesCount,
            page: pagSortValues.pageNumber,
            pageSize: pagSortValues.pageSize,
            totalCount: pagSortValues.totalCount,
            items: await db.postsCollection
                .find({filter}, {projection: {_id: 0}})
                .skip(pagSortValues.skip)
                .limit(pagSortValues.limit)
                .sort({[pagSortValues.sortBy]: pagSortValues.sortDirection})
                .toArray()
        }
    }
}