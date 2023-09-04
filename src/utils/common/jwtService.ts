import {UserInDB} from "../../types/usersTypes";
import jwt from 'jsonwebtoken'


/**
 * сервис для работы с jwt токенами
 */
export const jwtService = {
    /**
     * В метод jwt.sign передаем userId, именно эта информация будет зашифрована в jwt token
     * Также передаем секрет для шифровки и время жизни токена
     * @param user объект пользователя, который логинится
     */
    async createJWT(user: UserInDB): Promise<string> {
        return jwt.sign({userId: user.id}, process.env.JWT_SECRET!, {expiresIn: '1h'})
    },
    /**
     * Функция для поиска юзера по токену
     * Делаем верификацию по токену и секрету
     * Из результата верификации формируем объект и сразу к этому объекту обращаемся, возвращая значение ключа userId
     * Если в процессе верификации возникла ошибка, токен неверный или просрочился, то вернем null
     * @param token токен jwt авторизации типа eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     */
    async getUserIdByToken(token: string): Promise<string | null> {
        try {
            const result: any = jwt.verify(token, process.env.JWT_SECRET!)
            return result.userId
        } catch (error) {
            return null
        }
    }
}