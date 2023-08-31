/**
 * Если присланный query параметр undefined, то возвращаем пустой объект {}
 * Иначе прописываем объект, где ключ name, а значение наш параметр в регулярке, флаг i для поиска без учета регистра
 * @param searchNameTerm значение searchNameTerm из query параметра запроса
 */
export function searchNameTermDefinition(searchNameTerm: string | undefined): {} | { name: string } {
    let result
    const query: string | undefined = searchNameTerm
    if (query === undefined) {
        result = {}
    } else {
        result = {name: new RegExp(query, 'i')}
    }
    return result
}