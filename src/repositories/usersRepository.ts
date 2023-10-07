import {db} from "./db";
import {UserInDB, UserOutput, UserViewModel} from "../types/usersTypes";
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
     * Обращаемся к функции пагинации и сортировки, передавая query параметры пагниации/сортировки и название коллекции
     * Функция возвращает PagSortValues к которым обращаемся для формирования объекта
     * Возвращаем информацию о страницах и в объекте items возвращаем массив с юзерами
     * Юзеров из БД отдаем только с нужными данными, чтобы соответствовали userOutput
     * @param sortBy по какому полю выполнить сортировку и вернуть результат
     * @param sortDirection с каким направлением сделать сортировку asc или desc
     * @param pageNumber номер страницы для вывода
     * @param pageSize размер выводимой страницы
     * @param searchLoginTerm логин или часть логина юзера для поиска в БД
     * @param searchEmailTerm email юзера или его часть для поиска в БД
     */
    async getUsers(
        sortBy: string | undefined,
        sortDirection: string | undefined,
        pageNumber: string | undefined,
        pageSize: string | undefined,
        searchLoginTerm: string | undefined,
        searchEmailTerm: string | undefined
    ): Promise<UserViewModel> {
        const filter = searchLoginEmailDefinition(searchLoginTerm, searchEmailTerm)
        const pagSortValues: PagSortValues = await paginationAndSorting(sortBy, sortDirection, pageNumber, pageSize, 'usersCollection', filter)
        return {
            pagesCount: pagSortValues.pagesCount,
            page: pagSortValues.pageNumber,
            pageSize: pagSortValues.pageSize,
            totalCount: pagSortValues.totalCount,
            items: await db.usersCollection
                .find(filter, {projection: {id: 1, login: 1, email: 1, createdAt: 1}})
                .skip(pagSortValues.skip)
                .limit(pagSortValues.limit)
                .sort({[pagSortValues.sortBy]: pagSortValues.sortDirection})
                .toArray()
        }
    },
    /**
     * находим юзера в БД по id и возвращаем его в формате UserOutput.
     * Если не находим, то возвращаем константу DB_RESULTS.NOT_FOUND
     * @param id id юзера
     */
    async getUserById(id: string): Promise<UserOutput | DB_RESULTS.NOT_FOUND> {
        const foundUser: UserOutput | null = await db.usersCollection.findOne({id}, {
            projection: {
                id: 1,
                login: 1,
                email: 1,
                createdAt: 1
            }
        })
        if (foundUser === null) {
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
     * Метод поиска юзера по логину или email. Используется для аутентификации и для валидации при регистрации.
     * Принимаем значение, которое содержит логин или email юзера.
     * Ищем юзера по полю login и email. Если ничего не находим, возвращаем DB_RESULTS.NOT_FOUND
     * Если нашли юзера, то весь объект с ним и возвращаем.
     * @param loginOrEmail строка с логином или емаилом юзера
     */
    async foundUserByLoginOrEmail(loginOrEmail: string): Promise<UserInDB | DB_RESULTS.NOT_FOUND> {
        const foundUser: UserInDB | null = await db.usersCollection.findOne({$or: [{login: loginOrEmail}, {email: loginOrEmail}]})
        if (!foundUser) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundUser
    },
    /**
     * Ищем пользователя по confirmationCode. Если не находим, то возвращаем DB_RESULTS.NOT_FOUND, если нашли, то возвращаем пользователя
     * @param code код для подтверждения пользователя. Приходит в теле запроса.
     */
    async foundUserByConfirmationCode(code: string): Promise<DB_RESULTS.NOT_FOUND | UserInDB> {
        const foundUser: UserInDB | null = await db.usersCollection.findOne({confirmationCode: code})
        if (foundUser === null) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundUser
    },
    /**
     * Метод подтверждения юзера. Находим юзера по id и меняем у него isConfirmed на true
     * @param id id юзера, которого нужно подтвердить
     */
    async confirmationUser(id: string): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.usersCollection.updateOne({id: id}, {$set: {isConfirmed: true}})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Обновление confirmation code у юзера по id
     * @param id id юзера
     * @param code новый код подтверждения, который нужно записать
     */
    async updateConfirmationCode(id: string, code: string): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.usersCollection.updateOne({id: id}, {$set: {confirmationCode: code}})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Метод для добавляения/обновления refreshToken у юзера
     * @param id id юзера которому нужно добавить/обновить refreshToken
     * @param refreshToken refreshToken, котоорый нужно добавить/обновить
     */
    async updateRefreshToken(id: string, refreshToken: string | undefined): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.usersCollection.updateOne({id: id}, {$set: {refreshToken}})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
}
