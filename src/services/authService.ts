import {RequestWithBody} from "../types/requestGenerics";
import {LoginUser} from "../dto/auth/LoginUser";
import {DB_RESULTS} from "../utils/common/constants";
import {usersRepository} from "../repositories/usersRepository";
import {UserInDB} from "../types/usersTypes";
import {comparePassword} from "../utils/common/passwordHash";
import {jwtService} from "../utils/common/jwtService";
import {JwtToken} from "../types/commonTypes";

export const authService = {
    /**
     * Метод для аутентификации юзера. Достаем loginOrEmail и password из тела запроса
     * loginOrEmail передаем в usersRepository для поиска в БД
     * Если по таким данным ничего не нашли, то сразу выходим из функции, возвращая DB_RESULTS.INVALID_DATA
     * Если юзера нашли, то проверяем его пароль. В метод comparePassword передаем пароль из тела запроса и хэш найденного юзера
     * Если пароль неверный, то метод compare вернет false. В таком случае выйдем из функции, возвращая DB_RESULTS.INVALID_DATA
     * Если пароль подходит, значит все данные верны. Обращаемся к методу createJWT, передавая объект юзера и формируем jwt token
     * @param req запрос в теле которого содержится пароль и логин или email юзера
     */
    async loginUser(req: RequestWithBody<LoginUser>): Promise<{ accessToken: JwtToken } | DB_RESULTS.INVALID_DATA> {
        const {loginOrEmail, password} = req.body
        const loginUser: UserInDB | DB_RESULTS.INVALID_DATA = await usersRepository.loginUser(loginOrEmail)
        if (loginUser === DB_RESULTS.INVALID_DATA) {
            return DB_RESULTS.INVALID_DATA
        }
        if (!await comparePassword(password, loginUser.passwordHash)) {
            return DB_RESULTS.INVALID_DATA
        }
        return {accessToken: await jwtService.createJWT(loginUser)}
    }
}