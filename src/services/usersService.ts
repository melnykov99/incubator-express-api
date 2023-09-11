import {usersRepository} from "../repositories/usersRepository";
import {UserInDB, UserOutput, UserViewModel} from "../types/usersTypes";
import {DB_RESULTS} from "../utils/common/constants";
import {generatePasswordHash} from "../utils/common/passwordHash";


export const usersService = {
    /**
     * обращаемся к usersRepository, чтобы достать юзеров из БД. Передаем значения для пагинации, сортировки и фильтра
     * @param sortBy по какому полю выполнить сортировку и вернуть результат
     * @param sortDirection с каким направлением сделать сортировку asc или desc
     * @param pageNumber номер страницы для вывода
     * @param pageSize размер выводимой страницы
     * @param searchLoginTerm логин или часть логина юзера для поиска в БД
     * @param searchEmailTerm email юзера или его часть для поиска в БД
     */
    async getUsers(sortBy: string | undefined,
                   sortDirection: string | undefined,
                   pageNumber: string | undefined,
                   pageSize: string | undefined,
                   searchLoginTerm: string | undefined,
                   searchEmailTerm: string | undefined): Promise<UserViewModel> {
        return await usersRepository.getUsers(sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm)
    },
    /**
     * Обращаемся к usersRepository чтобы найти юзера в БД по id
     * @param id id юзера
     */
    async getUserById(id: string): Promise<UserInDB | DB_RESULTS.NOT_FOUND> {
        return usersRepository.getUserById(id)
    },
    /**
     * Передаем password в функцию generatePasswordHash и получаем passwordHash
     * Записываем эти данные в объект newUser, который передаем в репозиторий для добавления в БД
     * Возвращаем те данные, которые соответствуют UserOutput
     * @param login логин пользователя, которые юзер передал в теле запроса
     * @param password пароль пользователя, который юзер передал в теле запроса
     * @param email email пользователя, который юзер передал в теле запроса
     */
    async createUser(login: string, password: string, email: string): Promise<UserOutput> {
        const passwordHash: string = await generatePasswordHash(password)
        const newUser: UserInDB = {
            id: Date.now().toString(),
            login,
            email,
            passwordHash,
            createdAt: (new Date().toISOString()),
        }
        await usersRepository.createUser(newUser)
        const {id, createdAt} = newUser
        return {id, login, email, createdAt};

    },
    /**
     * обращаемся к usersRepository передавая id юзера, которого нужно удалить
     * @param id id юзера которого нужно удалить, приходить в параметрах запроса
     */
    async deleteUser(id: string): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED | DB_RESULTS.NOT_FOUND> {
        return await usersRepository.deleteUser(id)
    },
}