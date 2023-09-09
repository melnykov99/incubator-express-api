import {db} from "./db";
import {RequestWithQuery} from "../types/requestGenerics";
import {GetUsersWithQuery} from "../dto/users/GetUsersWithQuery";
import {UserInDB, UserViewModel} from "../types/usersTypes";
import {DeleteResult} from "mongodb";
import {DB_RESULTS} from "../utils/common/constants";
import {PagSortValues} from "../types/commonTypes";
import {paginationAndSorting} from "../utils/common/paginationAndSorting";
import {searchLoginEmailDefinition} from "../utils/users/searchLoginEmailDefinition";

export const usersRepository = {
    /**
     * Обращаемся к коллеакции юзеров в БД и удаляем все данные
     */
    async deleteAllUsers(): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.usersCollection.deleteMany({})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Определяем фильтр с помощью функции searchLoginEmailDefinition, передавая ей значения из query параметров
     * Обращаемся к функции пагинации и сортировки, передавая query параметры из запроса и название коллекции
     * Функция возвращает PagSortValues к которым обращаемся для формирования объекта
     * Возвращаем информацию о страницах и в объекте items возвращаем массив с юзерами
     * Юзеров из БД отдаем без монговского _id и без passwordHash, чтобы соответстовали типу UserOutput
     * @param req запрос в котором параметры для пагинации и сортировки.
     */
    async getUsers(req: RequestWithQuery<GetUsersWithQuery>): Promise<UserViewModel> {
        const filter = searchLoginEmailDefinition(req.query.searchLoginTerm, req.query.searchEmailTerm)
        const pagSortValues: PagSortValues = await paginationAndSorting(
            req.query.sortBy, req.query.sortDirection, req.query.pageNumber, req.query.pageSize, 'usersCollection', filter)

        return {
            pagesCount: pagSortValues.pagesCount,
            page: pagSortValues.pageNumber,
            pageSize: pagSortValues.pageSize,
            totalCount: pagSortValues.totalCount,
            items: await db.usersCollection
                .find(filter, {projection: {_id: 0, passwordHash: 0}})
                .skip(pagSortValues.skip)
                .limit(pagSortValues.limit)
                .sort({[pagSortValues.sortBy]: pagSortValues.sortDirection})
                .toArray()
        }
    },
    /**
     * находим юзера в БД по id. Если не находим, то возвращаем константу DB_RESULTS.NOT_FOUND
     * @param id id юзера
     */
    async getUserById(id: string): Promise<UserInDB | DB_RESULTS.NOT_FOUND> {
        const foundUser: UserInDB | null = await db.usersCollection.findOne({id})
        if (!foundUser) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundUser
    },
    /**
     * Добавляем объект юзера в БД
     * @param newUser объект юзера, который сформировали из присланных данных в запросе
     */
    async createUser(newUser: UserInDB): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.usersCollection.insertOne(newUser)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Удаляем юзера по id. Если юзера нет, то в deletedCount будет 0. В таком случае вернем NOT_FOUND
     * @param id id поста
     */
    async deleteUser(id: string): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED | DB_RESULTS.NOT_FOUND> {
        const deleteResult: DeleteResult = await db.usersCollection.deleteOne({id})
        if (deleteResult.deletedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Метод для аутентификации юзера. Принимаем значение, которое содержит логин или email юзера.
     * Ищем юзера по полю login и email. Если ничего не находим, возвращаем DB_RESULTS.INVALID_DATA
     * Если нашли юзера, то весь объект с ним и возвращаем.
     * @param loginOrEmail строка с логином или емаилом юзера
     */
    async loginUser(loginOrEmail: string): Promise<UserInDB | DB_RESULTS.INVALID_DATA> {
        const foundUser: UserInDB | null = await db.usersCollection.findOne({$or: [{login: loginOrEmail}, {email: loginOrEmail}]})
        if (!foundUser) {
            return DB_RESULTS.INVALID_DATA
        }
        return foundUser
    }
}
