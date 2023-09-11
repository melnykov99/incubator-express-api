import {db} from "./db";
import {CommentInDB, CommentsViewModel, CommentOutput} from "../types/commentsTypes";
import {DB_RESULTS} from "../utils/common/constants";
import {DeleteResult, UpdateResult} from "mongodb";
import {PagSortValues} from "../types/commonTypes";
import {paginationAndSorting} from "../utils/common/paginationAndSorting";

export const commentsRepository = {
    /**
     * Удаление всех комментариев из БД
     */
    async deleteAllComments(): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.commentsCollection.deleteMany({})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Получение всех комментариев к определенному посту, по id этого поста
     * Делаем filter по postId
     * Обращаемся к функции пагинации и сортировки, передавая query параметры пагинации/сортировки и название коллекции
     * Функция возвращает PagSortValues к которым обращаемся для формирования объекта, который будем возвращать
     * Возвращаем информацию о страницах и в объекте items возвращаем массив с комментариями
     * Комментарии из БД отдаем без монговского _id
     * Ищем комментарии которые привязаны к конкретному посту. Если комментариев у поста нет, то в items будет пустой массив
     * @param postId id поста по которому запрашиваем комментарии
     * @param sortBy по какому полю выполнить сортировку и вернуть результат
     * @param sortDirection с каким направлением сделать сортировку asc или desc
     * @param pageNumber номер страницы для вывода
     * @param pageSize размер выводимой страницы
     */
    async getCommentsByPostId(postId: string,
                              sortBy: string | undefined,
                              sortDirection: string | undefined,
                              pageNumber: string | undefined,
                              pageSize: string | undefined): Promise<DB_RESULTS.NOT_FOUND | CommentsViewModel> {
        const filter: { postId: string } = {postId}
        const pagSortValues: PagSortValues = await paginationAndSorting(sortBy, sortDirection, pageNumber, pageSize, 'commentsCollection', filter)
        return {
            pagesCount: pagSortValues.pagesCount,
            page: pagSortValues.pageNumber,
            pageSize: pagSortValues.pageSize,
            totalCount: pagSortValues.totalCount,
            items: await db.commentsCollection
                .find(filter, {projection: {_id: 0, postId: 0}})
                .skip(pagSortValues.skip)
                .limit(pagSortValues.limit)
                .sort({[pagSortValues.sortBy]: pagSortValues.sortDirection})
                .toArray()
        }
    },
    /**
     * Добавление нового комментария в БД
     * Возвращаем константу об успешном выполнении
     * @param newComment объект нового комментария
     */
    async createCommentByPostId(newComment: CommentInDB): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.commentsCollection.insertOne(newComment)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Поиск комментария по id
     * Если комментария нет, то вернем DB_RESULTS.NOT_FOUND
     * В ином случае возвращаем объект комментария из БД. Возвращаем без postId
     * @param id id комментария, по нему ищем
     */
    async getCommentById(id: string): Promise<DB_RESULTS.NOT_FOUND | CommentOutput> {
        const foundComment: CommentOutput | null = await db.commentsCollection.findOne({id}, {
            projection: {
                _id: 0,
                postId: 0
            }
        })
        if (!foundComment) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundComment
    },
    /**
     * Изменение текста комментария по id
     * Если комментария с таким id нет, то в matchedCount будет 0, в таком случае возвращаем DB_RESULTS.NOT_FOUND
     * В ином случае комментарий обновили и возвращаем константу об успешном выполнении
     * @param id id комментария, который нужно изменить
     * @param content новый текст комментария
     */
    async updateCommentById(id: string, content: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const updateResult: UpdateResult = await db.commentsCollection.updateOne({id}, {$set: {content}})
        if (updateResult.matchedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Удаление комментария по id
     * Если комментария по такому id нет, то в deletedCount будет 0, в таком случае возвращаем DB_RESULTS.NOT_FOUND
     * В ином случае комментарий удалили и возвращаем константу об успешном выполнении
     * @param id id комментария, который нужно удалить
     */
    async deleteCommentById(id: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const deleteResult: DeleteResult = await db.commentsCollection.deleteOne({id})
        if (deleteResult.deletedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
}