import {AUTH, DB_RESULTS} from "../utils/common/constants";
import {usersRepository} from "../repositories/usersRepository";
import {UserInDB} from "../types/usersTypes";
import {comparePassword, generatePasswordHash} from "../utils/common/passwordHash";
import {jwtService} from "../utils/common/jwtService";
import {AccessRefreshToken, JwtToken} from "../types/commonTypes";
import {emailAdapter} from "../adapters/email-adapter";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";
import {JwtPayload} from "jsonwebtoken";


/**
 * Метод для проверки refreshToken. Если токен не прислан в куки, то выходим из функции, возвращая AUTH.REFRESHTOKEN_IS_MISSING
 * Далее проверяем токен. Если он истек или невалидный, то выходим из функции и возвращаем AUTH.REFRESHTOKEN_FAILED_VERIFICATION
 * Далее ищем юзера по refreshToken
 * Если с токеном всё ок, то возвращаем verifyCheckResult (декодированный токен) и найденного юзера
 * @param refreshToken refreshToken из куки
 */
async function checkRefreshToken(refreshToken: JwtToken): Promise<AUTH.REFRESHTOKEN_IS_MISSING | AUTH.REFRESHTOKEN_FAILED_VERIFICATION | AUTH.USER_NOT_FOUND |
    { verifyCheckResult: JwtPayload, foundUser: UserInDB }> {
    if (refreshToken === undefined) {
        return AUTH.REFRESHTOKEN_IS_MISSING
    }
    const verifyCheckResult: AUTH.REFRESHTOKEN_FAILED_VERIFICATION | JwtPayload = await jwtService.verifyRefreshToken(refreshToken)
    if (verifyCheckResult === AUTH.REFRESHTOKEN_FAILED_VERIFICATION) {
        return AUTH.REFRESHTOKEN_FAILED_VERIFICATION
    }
    const foundUser: DB_RESULTS.NOT_FOUND | UserInDB = await usersRepository.getUserByRefreshToken(refreshToken)
    if (foundUser === DB_RESULTS.NOT_FOUND) {
        return AUTH.USER_NOT_FOUND
    }
    return {verifyCheckResult: verifyCheckResult, foundUser: foundUser}
}

export const authService = {
    /**
     * Метод для аутентификации юзера
     * loginOrEmail передаем в usersRepository для поиска в БД
     * Если по таким данным ничего не нашли, то сразу выходим из функции, возвращая AUTH.USER_NOT_FOUND
     * Если юзера нашли, но у него isConfirmed === false (не подтвержден), то выходим из функции, возвращая AUTH.UNCONFIRMED_USER. Неподтвержденный юзер не может логиниться
     * Если юзера нашли, то проверяем его пароль. В метод comparePassword передаем пароль из тела запроса и хэш найденного юзера
     * Если пароль неверный, то метод compare вернет false. В таком случае выйдем из функции, возвращая AUTH.INVALID_PASSWORD
     * Если пароль подходит, значит все данные верны. Передаем данные о юзере в метод для создания access и refresh токенов
     * созданный refreshToken сохраняем в БД для этого юзера и возвращаем пару токенов.
     * @param loginOrEmail логин или email, который прислали в теле запроса
     * @param password пароль юзера, который прислали в теле запроса
     */
    async loginUser(loginOrEmail: string, password: string): Promise<AccessRefreshToken | AUTH.USER_NOT_FOUND | AUTH.UNCONFIRMED_USER | AUTH.INVALID_PASSWORD> {
        const loginUser: UserInDB | DB_RESULTS.NOT_FOUND = await usersRepository.foundUserByLoginOrEmail(loginOrEmail)
        if (loginUser === DB_RESULTS.NOT_FOUND) {
            return AUTH.USER_NOT_FOUND
        }
        if (!loginUser.isConfirmed) {
            return AUTH.UNCONFIRMED_USER
        }
        if (!await comparePassword(password, loginUser.passwordHash)) {
            return AUTH.INVALID_PASSWORD
        }
        const tokens: { accessToken: JwtToken, refreshToken: JwtToken } = await jwtService.createAuthTokens(loginUser)
        await usersRepository.addRefreshToken(loginUser.id, tokens.refreshToken)
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
    async registrationUser(login: string, password: string, email: string): Promise<AUTH.USER_NOT_CREATED | AUTH.USER_CREATED> {
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
            return AUTH.USER_NOT_CREATED
        }
        return AUTH.USER_CREATED
    },
    /**
     * Функция подтверждения пользователя. Сначала ищем юзера по коду, если не находим, то выходим из функции
     * Если пользователя нашли, но в isConfirmed у него уже значение true, то выходим из функции
     * Если у пользователя expirationDate просрочился (меньше текущей даты), то выходим из функции
     * В ином случае подтверждаем пользователя и завершаем функцию передавая AUTH.SUCCESSFUL_CONFIRMATION
     * @param code код для подтверждения пользователя. Приходит в теле запроса.
     */
    async confirmationUser(code: string): Promise<AUTH.USER_NOT_FOUND | AUTH.USER_ALREADY_CONFIRMED | AUTH.CONFIRMATION_CORE_EXPIRED | AUTH.SUCCESSFUL_CONFIRMATION> {
        const foundUser: DB_RESULTS.NOT_FOUND | UserInDB = await usersRepository.foundUserByConfirmationCode(code)
        if (foundUser === DB_RESULTS.NOT_FOUND) {
            return AUTH.USER_NOT_FOUND
        }
        if (foundUser.isConfirmed) {
            return AUTH.USER_ALREADY_CONFIRMED
        }
        if (foundUser.expirationDate < new Date()) {
            return AUTH.CONFIRMATION_CORE_EXPIRED
        }
        await usersRepository.confirmationUser(foundUser.id)
        return AUTH.SUCCESSFUL_CONFIRMATION
    },
    /**
     * Ищем юзера по email. Если не находим, то выходим из функции и возвращем AUTH.USER_NOT_FOUND
     * Если юзера нашли, но он уже подтвержден, то выходим из функции и возвращаем AUTH.USER_ALREADY_CONFIRMED. Подтвержденному юзеру не нужно повторно отправлять письмо подтверждения.
     * Создаем новый код подтверждения. Новый код перезаписываем в БД у юзера
     * Отправляем письмо с новым кодом на указанный email
     * @param email адрес на который нужно отправить повторное сообщение
     */
    async registrationEmailResending(email: string): Promise<AUTH.USER_NOT_FOUND | AUTH.USER_ALREADY_CONFIRMED | AUTH.SUCCESSFUL_RESENDING> {
        const foundUser: DB_RESULTS.NOT_FOUND | UserInDB = await usersRepository.foundUserByLoginOrEmail(email)
        if (foundUser === DB_RESULTS.NOT_FOUND) {
            return AUTH.USER_NOT_FOUND
        }
        if (foundUser.isConfirmed) {
            return AUTH.USER_ALREADY_CONFIRMED
        }
        const newConfirmationCode: string = uuidv4()
        await usersRepository.updateConfirmationCode(foundUser.id, newConfirmationCode)
        await emailAdapter.sendRegistrationMail(email, newConfirmationCode)
        return AUTH.SUCCESSFUL_RESENDING
    },
    /**
     * Метод обновления пары токенов. Если с токеном что-то не так, то возвращаем соответствующую константу. Иначе возвращаем новую пару токенов
     * Если refreshToken не прислали в куки запроса (его значение undefined), то выходим из фнукции
     * Если токен не прошел верификацию (невалидный или истек), то выходим из функции
     * Если по этому токену не получается найти юзера (токен не присвоен какому-то юзеру), то выходимиз функции
     * Когда все проверки прошли формируем новую пару токенов. Удаляем старый токен из БД. Добавляем новый
     * @param refreshToken присланный в запросе refreshToken
     */
    async refreshTokens(refreshToken: JwtToken): Promise<AUTH.REFRESHTOKEN_IS_MISSING | AUTH.REFRESHTOKEN_FAILED_VERIFICATION | AUTH.USER_NOT_FOUND | AccessRefreshToken> {
        const checkRefreshTokenResult: AUTH.REFRESHTOKEN_IS_MISSING | AUTH.REFRESHTOKEN_FAILED_VERIFICATION | AUTH.USER_NOT_FOUND |
            { verifyCheckResult: JwtPayload, foundUser: UserInDB } = await checkRefreshToken(refreshToken)

        switch (checkRefreshTokenResult) {
            case AUTH.REFRESHTOKEN_IS_MISSING:
            case AUTH.REFRESHTOKEN_FAILED_VERIFICATION:
            case AUTH.USER_NOT_FOUND:
                return checkRefreshTokenResult;

            default:
                const tokens: AccessRefreshToken = await jwtService.createAuthTokens(checkRefreshTokenResult.foundUser)
                await usersRepository.deleteRefreshToken(checkRefreshTokenResult.verifyCheckResult.userId, refreshToken)
                await usersRepository.addRefreshToken(checkRefreshTokenResult.verifyCheckResult.userId, tokens.refreshToken)
                return tokens
        }
    },
    /**
     * При запросе logout удаляем refreshToken из массива refreshTokens у юзера. Чтобы по этому токену нельзя было выполнять запросы.
     * Если рефреш токен не прислали или его не удается верифицировать или юзер по этому рефреш токену не найден, то выходим из функции
     * Если с токеном всё ок, то удаляем его из БД.
     * @param refreshToken refreshToken, который нужно затереть
     */
    async logout(refreshToken: JwtToken): Promise<AUTH.REFRESHTOKEN_IS_MISSING | AUTH.REFRESHTOKEN_FAILED_VERIFICATION | AUTH.USER_NOT_FOUND | AUTH.SUCCESSFUL_LOGOUT> {
        const checkRefreshTokenResult: AUTH.REFRESHTOKEN_IS_MISSING | AUTH.REFRESHTOKEN_FAILED_VERIFICATION | AUTH.USER_NOT_FOUND |
            { verifyCheckResult: JwtPayload, foundUser: UserInDB } = await checkRefreshToken(refreshToken)

        switch (checkRefreshTokenResult) {
            case AUTH.REFRESHTOKEN_IS_MISSING:
            case AUTH.REFRESHTOKEN_FAILED_VERIFICATION:
            case AUTH.USER_NOT_FOUND:
                return checkRefreshTokenResult;

            default:
                await usersRepository.deleteRefreshToken(checkRefreshTokenResult.verifyCheckResult.userId, refreshToken);
                return AUTH.SUCCESSFUL_LOGOUT;
        }
    }
}