/**
 * Функция для определения фильтра в usersRepository.getUsers
 * Принимает searchLoginTerm и searchEmailTerm, переданные в query параметрах запроса
 * Объявляем объект filter.
 * Если searchLoginTerm не равен undefined, то добавляем в ключ filter.login регулярку с значением searchLoginTerm и флагом поиска без учета регистра
 * Та же логика для searchEmailTerm
 * Если оба значения оказались undefined, то вернем {}. В ином случае возвращаем получившейся фильтр
 * @param searchLoginTerm логин юзера или его часть
 * @param searchEmailTerm email юзера или его часть
 */
export function searchLoginEmailDefinition(searchLoginTerm: string | undefined, searchEmailTerm: string | undefined) {
    const filter: Record<string, any> = {};
    if (searchLoginTerm) {
        filter.login = new RegExp(searchLoginTerm, 'i');
    }
    if (searchEmailTerm) {
        filter.email = new RegExp(searchEmailTerm, 'i');
    }
    if (Object.keys(filter).length === 0) {
        return {};
    }
    return { $or: [filter] };
}