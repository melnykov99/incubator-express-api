import {RequestWithBody, RequestWithQuery} from "../types/requestGenerics";
import {GetUsersWithQuery} from "../dto/users/GetUsersWithQuery";
import {usersRepository} from "../repositories/usersRepository";
import {UserInDB, UserOutput} from "../types/usersTypes";
import {CreateUser} from "../dto/users/CreateUser";
import {DB_RESULTS} from "../utils/common/constants";
import bcrypt from 'bcrypt'

export const usersService = {
    async getUsers(req: RequestWithQuery<GetUsersWithQuery>): Promise<UserOutput[]> {
        return await usersRepository.getUsers(req)
    },
    async createUser(req: RequestWithBody<CreateUser>): Promise<UserOutput> {
        const {login, email, password} = req.body

        //мб соль и хэш тоже куда-то переместить лучше
        const passwordSalt: string = await bcrypt.genSalt(10)
        const passwordHash: string = await this._generateHash(password, passwordSalt)

        const newUserForDB: UserInDB = {
            id: Date.now().toString(),
            login,
            email,
            passwordHash: passwordHash,
            createdAt: (new Date().toISOString()),
        }
        await usersRepository.createUser(newUserForDB)
        const {id, createdAt} = newUserForDB
        return {id, login, email, createdAt};

    },
    async deleteUser(id: string): Promise<DB_RESULTS> {
        return await usersRepository.deleteUser(id)
    },
    // куда-то переместить эту функцию надо
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
}