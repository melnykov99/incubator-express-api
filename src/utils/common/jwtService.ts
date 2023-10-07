import {UserOutput} from "../../types/usersTypes";
import jwt, {JwtPayload} from 'jsonwebtoken'
import {JwtToken} from "../../types/commonTypes";
import {AUTH} from "./constants";

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
    async createAuthTokens(user: UserOutput): Promise<{ accessToken: JwtToken, refreshToken: JwtToken }> {
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
    /**
     * Проверка токена на подлинность. Если он невалидный или просрочен, то попадем в catch и возвращаем AUTH.REFRESHTOKEN_FAILED_VERIFICATION
     * Если токен валидный, то вернем декодированный объект токена с userId, временем выпуска токена и временем, когда он истечет
     * Декодированный токен имеет такой вид { userId: '1696191387712', iat: 1696361688, exp: 1696361708 }
     * @param token
     */
    async verifyRefreshToken(token: string): Promise<JwtPayload | AUTH.REFRESHTOKEN_FAILED_VERIFICATION> {
       try {
           return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload
       } catch (error) {
           return AUTH.REFRESHTOKEN_FAILED_VERIFICATION
       }
    }
}