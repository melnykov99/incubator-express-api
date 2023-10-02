import {DB_RESULTS} from "../utils/common/constants";
import {usersRepository} from "../repositories/usersRepository";
import {UserInDB} from "../types/usersTypes";
import {comparePassword, generatePasswordHash} from "../utils/common/passwordHash";
import {jwtService} from "../utils/common/jwtService";
import {JwtToken} from "../types/commonTypes";
import {emailAdapter} from "../adapters/email-adapter";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";

export const authService = {
    /**
     * Метод для аутентификации юзера
     * loginOrEmail передаем в usersRepository для поиска в БД
     * Если по таким данным ничего не нашли, то сразу выходим из функции, возвращая DB_RESULTS.INVALID_DATA
     * Если юзера нашли, но у него isConfirmed === false (не подтвержден), то выходимиз функции, возвращая DB_RESULTS.INVALID_DATA. Неподтвержденный юзер не может логиниться
     * Если юзера нашли, то проверяем его пароль. В метод comparePassword передаем пароль из тела запроса и хэш найденного юзера
     * Если пароль неверный, то метод compare вернет false. В таком случае выйдем из функции, возвращая DB_RESULTS.INVALID_DATA
     * Если пароль подходит, значит все данные верны. Передаем данные о юзере в метод для создания access и refresh токенов
     * созданный refreshToken сохраняем в БД для этого юзера
     * @param loginOrEmail логин или email, который прислали в теле запроса
     * @param password пароль юзера, который прислали в теле запроса
     */
    async loginUser(loginOrEmail: string, password: string): Promise<{
        accessToken: JwtToken,
        refreshToken: JwtToken
    } | DB_RESULTS.INVALID_DATA> {
        const loginUser: UserInDB | DB_RESULTS.NOT_FOUND = await usersRepository.foundUserByLoginOrEmail(loginOrEmail)
        if (loginUser === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.INVALID_DATA
        }
        if (!loginUser.isConfirmed) {
            return DB_RESULTS.INVALID_DATA
        }
        if (!await comparePassword(password, loginUser.passwordHash)) {
            return DB_RESULTS.INVALID_DATA
        }
        const tokens: { accessToken: JwtToken, refreshToken: JwtToken } = await jwtService.createAuthTokens(loginUser)
        await usersRepository.updateRefreshToken(loginUser.id, tokens.refreshToken)
        return tokens
    },
    /**
     * Метод регистрации пользователя
     * Передаем password в функцию generatePasswordHash и получаем passwordHash
     * Создаем объект нового юзера в который прокидываем login, email, passwordHash, createdAt, confirmationCode (для подтверждения email),
     * expirationDate (срок действия кода для подтверждения) и isConfirmed - статус подтверждения пользователя.
     * Добавляем объект в БД и отправляем письмо с кодом подтверждения на указанный email
     * Если по какой-то причине при отправке письма ошибка, то пользователя удаляем из БД и возвращаем константу о неуспешном выполнении
     * @param login логин пользователя из тела запроса
     * @param password пароль пользователя из тела запроса
     * @param email email пользователя из тела запроса
     */
    async registrationUser(login: string, password: string, email: string): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED | DB_RESULTS.UNSUCCESSFULL> {
        const passwordHash: string = await generatePasswordHash(password)
        const newUser: UserInDB = {
            id: Date.now().toString(),
            login,
            email,
            passwordHash,
            createdAt: (new Date().toISOString()),
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {hours: 24}),
            isConfirmed: false
        }
        await usersRepository.createUser(newUser)
        try {
            await emailAdapter.sendRegistrationMail(email, newUser.confirmationCode)
        } catch (error) {
            console.log(error)
            await usersRepository.deleteUser(newUser.id)
            return DB_RESULTS.UNSUCCESSFULL
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Функция подтверждения пользователя. Сначала ищем юзера по коду, если не находим, то выходим из функции
     * Если пользователя нашли, но в isConfirmed у него уже значение true, то выходим из функции
     * Если у пользователя expirationDate просрочился (меньше текущей даты), то выходим из функции
     * В ином случае подтверждаем пользователя и завершаем функцию передавая DB_RESULTS.SUCCESSFULLY_COMPLETED
     * @param code код для подтверждения пользователя. Приходит в теле запроса.
     */
    async confirmationUser(code: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.UNSUCCESSFULL | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const foundUser: DB_RESULTS.NOT_FOUND | UserInDB = await usersRepository.foundUserByConfirmationCode(code)
        if (foundUser === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        if (foundUser.isConfirmed) {
            return DB_RESULTS.UNSUCCESSFULL
        }
        if (foundUser.expirationDate < new Date()) {
            return DB_RESULTS.UNSUCCESSFULL
        }
        await usersRepository.confirmationUser(foundUser.id)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Ищем юзера по email. Если не находим, то выходим из функции и возвращем DB_RESULTS.NOT_FOUND
     * Если юзера нашли, но он уже подтвержден, то выходим из функции и возвращаем DB_RESULTS.INVALID_DATA. Подтвержденному юзеру не нужно повторно отправлять письмо подтверждения.
     * Создаем новый код подтверждения. Новый код перезаписываем в БД у юзера
     * Отправляем письмо с новым кодом на указанный email
     * @param email адрес на который нужно отправить повторное сообщение
     */
    async registrationEmailResending(email: string): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED | DB_RESULTS.INVALID_DATA> {
        const foundUser: DB_RESULTS.NOT_FOUND | UserInDB = await usersRepository.foundUserByLoginOrEmail(email)
        if (foundUser === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        if (foundUser.isConfirmed) {
            return DB_RESULTS.INVALID_DATA
        }
        const newConfirmationCode: string = uuidv4()
        await usersRepository.updateConfirmationCode(foundUser.id, newConfirmationCode)
        await emailAdapter.sendRegistrationMail(email, newConfirmationCode)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    async refreshTokens(refreshToken: string) {
        if (refreshToken === undefined) {
            return DB_RESULTS.INVALID_DATA
        }

        return
    }
}