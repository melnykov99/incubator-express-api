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
    "INVALID_DATA" = "the data sent is wrong",
    "UNSUCCESSFULL" = "Unfortunate. Something went wrong"
}

/**
 * Константы auth операций
 */
export enum AUTH {
    "USER_NOT_FOUND" = "such user was not found",
    "UNCONFIRMED_USER" = "this user did not confirm email",
    "USER_ALREADY_CONFIRMED" = "user has already been confirmed",
    "CONFIRMATION_CORE_EXPIRED" = "confirmation code has expired",
    "SUCCESSFUL_CONFIRMATION" = "user confirmation was successful",
    "INVALID_PASSWORD" = "entered password is incorrect",
    "USER_NOT_CREATED" = "user is not created",
    "USER_CREATED" = "user created",
    "SUCCESSFUL_RESENDING" = "repeated mail sent",
    "REFRESHTOKEN_IS_MISSING" = "the token is missing from the request cookie",
    "REFRESHTOKEN_FAILED_VERIFICATION" = "refresh token failed verification. Expired or invalid.",
    "SUCCESSFUL_LOGOUT" = "successful logout"
}

/**
 * Константы для commentsService и commentsRouter
 */
export enum COMMENTS {
    "NOt_FOUND" = "such comments was not found",
    "NOT_OWNER" = "only the owner can change the comment",
    "SUCCESSFUL_UPDATE" = "comment was successfully changed",
    "SUCCESSFUL_DELETE" = "comment was successfully deleted"
}