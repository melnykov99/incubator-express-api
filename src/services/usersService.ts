import {RequestWithBody, RequestWithQuery} from "../types/requestGenerics";
import {GetUsersWithQuery} from "../dto/users/GetUsersWithQuery";
import {usersRepository} from "../repositories/usersRepository";
import {UserInDB, UserOutput} from "../types/usersTypes";
import {CreateUser} from "../dto/users/CreateUser";
import {DB_RESULTS} from "../utils/common/constants";
import {generatePasswordHash} from "../utils/common/generatePasswordHash";

export const usersService = {
    async getUsers(req: RequestWithQuery<GetUsersWithQuery>): Promise<UserOutput[]> {
        return await usersRepository.getUsers(req)
    },
    /**
     *  Достаем login, email и password из тела запроса
     * Передаем password в функцию generatePasswordHash и получаем passwordHash
     * Записываем эти данные в объект newUser, который передаем в репозиторий для добавления в БД
     * Возвращаем те данные, которые соответствуют UserOutput
     * @param req принимаем весь запрос, из него достаем login, email и password
     */
    async createUser(req: RequestWithBody<CreateUser>): Promise<UserOutput> {
        const {login, email, password} = req.body
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
    async deleteUser(id: string): Promise<DB_RESULTS> {
        return await usersRepository.deleteUser(id)
    },
}