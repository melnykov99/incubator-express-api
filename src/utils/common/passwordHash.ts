import bcrypt from "bcrypt";

/**
 * Метод генерации хэша пароля
 * Принимает пароль, генерирует соль, с помощью bcrypt делает хэш и возвращает его
 * @param password пароль, который нужно захешировать
 */
export async function generatePasswordHash(password: string): Promise<string> {
    const passwordSalt: string = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, passwordSalt)
}

/**
 * Метод сравнения пароля с хэшем. Принимает пароль и хэш, делает дехеширование и сравнивает значения.
 * @param password пароль, который пришел из запроса
 * @param passwordHash хэш, который лежит в БД у юзера
 */
export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash)
}