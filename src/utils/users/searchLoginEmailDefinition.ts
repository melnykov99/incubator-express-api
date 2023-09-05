/**
 * Функция для определения фильтра в usersRepository.getUsers
 * Принимает searchLoginTerm и searchEmailTerm, переданные в query параметрах запроса
 * Объявляем массив filter.
 * Если searchLoginTerm не равен undefined, то добавляем login значение которого регулярка с значением searchLoginTerm и флагом поиска без учета регистра
 * Пушим login в массив filter
 * Та же логика для searchEmailTerm
 * Если оба значения оказались undefined, то вернем {}. В ином случае возвращаем получившейся фильтр
 * @param searchLoginTerm логин юзера или его часть
 * @param searchEmailTerm email юзера или его часть
 */
export function searchLoginEmailDefinition(searchLoginTerm: string | undefined, searchEmailTerm: string | undefined) {
    const filter = []
    if (searchLoginTerm) {
        const login: RegExp = new RegExp(searchLoginTerm, 'i')
        filter.push({login})
    }
    if (searchEmailTerm) {
        const email: RegExp = new RegExp(searchEmailTerm, 'i')
        filter.push({email})
    }
    if (filter.length === 0) {
        return {}
    }
    return { $or: filter };
}