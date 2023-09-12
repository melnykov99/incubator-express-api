import {UserInDB} from "./usersTypes";

/**
 * создаем глобальную область видимости, которая охватывает все файлы в проекте
 * определяем пространство имен Express в этой глобальной области видимости
 * расширяем интерфейс Request в пространстве Express, добавляя к нему новое свойство user с типом UserInDB
 */
declare global {
    namespace Express {
        export interface Request {
            user: UserInDB
        }
    }
}