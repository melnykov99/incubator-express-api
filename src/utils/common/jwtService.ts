import {UserInDB} from "../../types/usersTypes";
import jwt, {JwtPayload} from 'jsonwebtoken'
import {JwtToken} from "../../types/commonTypes";

/**
 * Функция для проверки типа токена. Проверяем соответствует ли он типу JwtToken
 * Указываем, что этот тип должен соответствовать строке, которая при сплите на 3 части с сепаратором '.' имеет длинну 3
 * @param value токен, который проверяем
 */
function assertsJwtToken(value: string): asserts value is JwtToken {
    if (value.split('.').length !== 3) {
        throw new Error('wrong format of jwt token')
    }
}

/**
 * сервис для работы с jwt токенами
 */
export const jwtService = {
    /**
     * В метод jwt.sign передаем userId, именно эта информация будет зашифрована в jwt token
     * Также передаем секрет для шифровки и время жизни токена
     * Формируем accessToken и refreshToken
     * Проверяем токен на нужный формат. jwt всегда разделен на 3 части точками. Если будет неверный формат, то появится ошибка.
     * @param user объект пользователя, который логинится
     */
    async createAuthTokens(user: UserInDB): Promise<{ accessToken: JwtToken, refreshToken: JwtToken }> {
        const accessToken = jwt.sign({userId: user.id}, process.env.JWT_ACCESS_SECRET!, {expiresIn: '10s'})
        const refreshToken = jwt.sign({userId: user.id}, process.env.JWT_REFRESH_SECRET!, {expiresIn: '20s'})
        assertsJwtToken(accessToken)
        assertsJwtToken(refreshToken)
        return {accessToken, refreshToken}
    },
    /**
     * Функция для поиска юзера по токену
     * Делаем верификацию по токену и секрету
     * Из результата верификации формируем объект и сразу к этому объекту обращаемся, возвращая значение ключа userI
     * Если в процессе верификации возникла ошибка, токен неверный или просрочился, то вернем null
     * @param token токен jwt авторизации типа eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     */
    async getUserIdByToken(token: string): Promise<string | null> {
        try {
            const result: jwt.JwtPayload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload
            return result.userId
        } catch (error) {
            return null
        }
    },
    async verifyRefreshToken(refreshToken: string) {
        // провека не закончился ли токен
    }
}