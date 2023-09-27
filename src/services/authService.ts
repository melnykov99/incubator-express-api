import {DB_RESULTS} from "../utils/common/constants";
import {usersRepository} from "../repositories/usersRepository";
import {UserInDB} from "../types/usersTypes";
import {comparePassword} from "../utils/common/passwordHash";
import {jwtService} from "../utils/common/jwtService";
import {JwtToken} from "../types/commonTypes";
import {emailAdapter} from "../adapters/email-adapter";

export const authService = {
    /**
     * Метод для аутентификации юзера
     * loginOrEmail передаем в usersRepository для поиска в БД
     * Если по таким данным ничего не нашли, то сразу выходим из функции, возвращая DB_RESULTS.INVALID_DATA
     * Если юзера нашли, то проверяем его пароль. В метод comparePassword передаем пароль из тела запроса и хэш найденного юзера
     * Если пароль неверный, то метод compare вернет false. В таком случае выйдем из функции, возвращая DB_RESULTS.INVALID_DATA
     * Если пароль подходит, значит все данные верны. Обращаемся к методу createJWT, передавая объект юзера и формируем jwt token
     * @param loginOrEmail логин или email, который прислали в теле запроса
     * @param password пароль юзера, который прислали в теле запроса
     */
    async loginUser(loginOrEmail: string, password: string): Promise<{ accessToken: JwtToken } | DB_RESULTS.INVALID_DATA> {
        const loginUser: UserInDB | DB_RESULTS.NOT_FOUND = await usersRepository.foundUserByLoginOrEmail(loginOrEmail)
        if (loginUser === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.INVALID_DATA
        }
        if (!await comparePassword(password, loginUser.passwordHash)) {
            return DB_RESULTS.INVALID_DATA
        }
        return {accessToken: await jwtService.createJWT(loginUser)}
    },
    async sendRegistrationMail(email: string) {
        await emailAdapter.sendRegistrationMail(email)
    }
}