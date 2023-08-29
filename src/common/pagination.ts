import {db} from "../repositories/db";
import {Collection} from "mongodb";
import {VideoOutput} from "../types/videosTypes";
import {BlogOutput} from "../types/blogsTypes";
import {PostOutput} from "../types/postsTypes";
import {PaginationValues} from "../types/commonTypes";

/**
 * Функция пагинации. Принимает запрос и название коллекции, формирует переменные, которые нужны в репозитории для пагинации
 * @param pageN pageNumber, передается в query параметрах запроса
 * @param pageS pageSize, передается в query параметрах запроса
 * @param collection название коллекции из которой вызывается функция. Обращаемся к коллекции чтоб узнать количество элементов
 */
export async function pagination(pageN: string | undefined, pageS: string | undefined, collection: 'videosCollection' | 'blogsCollection' | 'postsCollection'): Promise<PaginationValues> {
    //переменная для обращения к коллекции в базе данных
    const dbCollection: Collection<VideoOutput> | Collection<BlogOutput> | Collection<PostOutput> = db[collection]
    //определяем количество элементов в коллекции
    const totalCount: number = await dbCollection.countDocuments({})
    //Текущая страница. pageNumber передается в query параметре. Если его нет, то выставляем по умолчанию pageNumber 1
    const pageNumber: number = (pageN === undefined) ? 1 : Number(pageN)
    //Размер страницы. pageSize передается в query параметре. Если его нет, то выставляем по умолчанию 10
    const pageSize: number = (pageS === undefined) ? 10 : Number(pageS)
    //определяем количество страниц. Общее число элементов делим на размер страницы и округляем в бОльшую стороную
    const pagesCount: number = Math.ceil(totalCount / pageSize)
    //сколько элементов нужно скипнуть Монге, чтобы вывести запрошенные значения
    const skip: number = (pageNumber - 1) * pageSize
    //лимит, по сути размер страницы. Для удобства выводим как отдельную переменную
    const limit: number = pageSize

    //все данные формируем в объект и возвращаем его
    return {pageNumber, pageSize, totalCount, pagesCount, skip, limit}
}