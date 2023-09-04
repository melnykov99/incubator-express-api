/**
 * Константы HTTP статусов, возвращаем их в routes
 */
export enum HTTP_STATUSES {
    "OK_200" = 200,
    "CREATED_201" = 201,
    "NO_CONTENT_204" = 204,
    "BAD_REQUEST_400" = 400,
    "UNAUTHORIZED_401" = 401,
    "FORBIDDEN_403" = 403,
    "NOT_FOUND_404" = 404,
}

/**
 * Константы результатов действий в базе данных, используем для удобства.
 * В слое работы с данными в зависимости от БД и методов могут возвращаться разные результаты, если элемент не найден. null, undefined и т.д.
 * Мы же для удобства, если элемент не был найден, то с репозитория в сервис возвращаем константу NOT_FOUND
 * Если возвращать никаких данных не нужено из БД, то репозиторий вернет SUCCESSFULLY_COMPLETED
 * INVALID DATA используется в auth при аутентификации
 */
export enum DB_RESULTS {
    "NOT_FOUND" = "element not found",
    "SUCCESSFULLY_COMPLETED" = "element action completed",
    "INVALID_DATA" = "The data sent is wrong"
}