import {RequestWithBody} from "../types/requestGenerics";
import {Login} from "../dto/auth/Login";
import {DB_RESULTS} from "../utils/common/constants";
import {usersRepository} from "../repositories/usersRepository";
import {UserInDB} from "../types/usersTypes";
import bcrypt from "bcrypt";

export const authService = {
    async authUser(req: RequestWithBody<Login>): Promise<DB_RESULTS.DATA_CORRECT | DB_RESULTS.INVALID_DATA> {
        const {loginOrEmail, password} = req.body
        const authUser: UserInDB | DB_RESULTS.INVALID_DATA = await usersRepository.authUser(loginOrEmail)
        if (authUser === DB_RESULTS.INVALID_DATA) {
            return DB_RESULTS.INVALID_DATA
        }
        if (!await bcrypt.compare(password, authUser.passwordHash)) {
            return DB_RESULTS.INVALID_DATA
        }
        return DB_RESULTS.DATA_CORRECT
    }
}