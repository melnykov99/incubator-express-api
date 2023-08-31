import {db} from "../repositories/db";
import {VideoOutput} from "../types/videosTypes";
import {BlogOutput} from "../types/blogsTypes";
import {PostOutput} from "../types/postsTypes";
import {PagSortValues} from "../types/commonTypes";

/**
 * Функция для определения sortBy. Объявляем переменную sortBy и записываем в нее значение по умолчанию createAt
 * Если в query ничего не передано, то выходим из функции, возвращая значение по умолчанию
 * В зависимости от коллекции создаем массив с ключами соответствующего типа
 * Проверяем входит ли наше значение sortB в этот массив.
 * Если sortB совпадает с каким-то из значений массива, то перезаписываем переменную sortBy
 * Если ничего не совпадет, то вернем sortBy с значением по умолчанию
 * @param sortB sortBy переданный в query
 * @param collection коллекция из которой вызывается функция пагинации/сортировки
 */
function definitionSortBy(sortB: string | undefined, collection: 'videosCollection' | 'blogsCollection' | 'postsCollection') {
    let sortBy: string = 'createdAt'
    if (sortB === undefined) {
        return sortBy
    }
    if (collection === 'videosCollection') {
        const validSortFields: (keyof VideoOutput)[] = ['id', 'title', 'author', 'canBeDownloaded', 'minAgeRestriction', 'createdAt', 'publicationDate', 'availableResolutions']
        if (validSortFields.includes(sortB as keyof VideoOutput)) {
            sortBy = sortB
        }
    }
    if (collection === 'blogsCollection') {
        const validSortFields: (keyof BlogOutput)[] = ['id', 'name', 'description', 'websiteUrl', 'createdAt', 'isMembership']
        if (validSortFields.includes(sortB as keyof BlogOutput)) {
            sortBy = sortB
        }
    }
    if (collection === 'postsCollection') {
        const validSortFields: (keyof PostOutput)[] = ['id', 'title', 'shortDescription', 'content', 'blogId', 'blogName', 'createdAt']
        if (validSortFields.includes(sortB as keyof PostOutput)) {
            sortBy = sortB
        }
    }
    return sortBy
}

/**
 * Функция пагинации. Принимает запрос и название коллекции, формирует переменные, которые нужны в репозитории для пагинации
 * Объявляем переменную sortBy и с помощью функции definitionSortBy определяем поле для сортировки.
 * В переменной sortDirection определяем направление сортировки. Из query приходит desc или asc.
 *  если ничего не придет, то по умолчанию ставим -1 (desc у монги). В ином случае проверяем, равняется ли sortB значению 'asc'
 *  если равняется, то ставим 1 (asc у монги). В ином случае значит нам прислали неправильные данные, ставим по умолчанию 1
 * Объвялем totalCount в которой определяем по фильтру количество документов в коллекции
 * pageNumber это текущая страница. pageNumber передается в query параметре. Если его нет, то выставляем по умолчанию pageNumber 1
 * pageSize это размер страницы. pageSize передается в query параметре. Если его нет, то выставляем по умолчанию 10
 * В pageCount определяем количество страниц. Общее число элементов делим на размер страницы и округляем в бОльшую стороную
 * В skip определяем сколько элементов нужно скипнуть Монге, чтобы вывести запрошенные значения
 * limit это лимит страницы, тот же размер страницы. Для удобства в нейминге выводим как отдельную переменную
 * Все данные формируем в объект и возвращаем его
 * @param sortB Поле по которому выполняется сортировка. sortBy, передается в query параметрах запроса
 * @param sortD Направление сортировки. sortDirection, передается в query параметрах запроса. asc или desc
 * @param pageN Номер страницы. pageNumber, передается в query параметрах запроса
 * @param pageS Размер страницы. pageSize, передается в query параметрах запроса
 * @param collection название коллекции из которой вызывается функция. Обращаемся к коллекции чтоб узнать количество элементов
 * @param searchNameTerm Фильтр для .countDocuments. Необязательный параметр, передается только в blogsRepository.
 */
export async function paginationAndSorting(sortB: string | undefined,
                                           sortD: string | undefined,
                                           pageN: string | undefined,
                                           pageS: string | undefined,
                                           collection: 'videosCollection' | 'blogsCollection' | 'postsCollection',
                                           searchNameTerm: {} | { name: string } = {}): Promise<PagSortValues> {
    const sortBy: string = definitionSortBy(sortB, collection)
    const sortDirection: -1 | 1 = (sortB === undefined) ? -1 : (sortD === 'asc') ? 1 : -1
    const totalCount: number = await db[collection].countDocuments(searchNameTerm)
    const pageNumber: number = (pageN === undefined) ? 1 : Number(pageN)
    const pageSize: number = (pageS === undefined) ? 10 : Number(pageS)
    const pagesCount: number = Math.ceil(totalCount / pageSize)
    const skip: number = (pageNumber - 1) * pageSize
    const limit: number = pageSize

    return {sortBy, sortDirection, pageNumber, pageSize, totalCount, pagesCount, skip, limit}
}