export function searchLoginEmailDefinition(searchLoginTerm: string | undefined, searchEmailTerm: string | undefined) {
    let filter = {}
    if (searchLoginTerm === undefined && searchEmailTerm === undefined) {
        return filter
    }
    if (searchLoginTerm !== undefined && searchEmailTerm === undefined) {
        filter = {login: new RegExp(searchLoginTerm, 'i')}
        return filter
    }
    if (searchLoginTerm === undefined && searchEmailTerm !== undefined) {
        filter = {email: new RegExp(searchEmailTerm, 'i')}
        return filter
    }
    if (searchLoginTerm !== undefined && searchEmailTerm !== undefined) {
        filter = {$or: [{login: new RegExp(searchLoginTerm, 'i')}, {email: new RegExp(searchEmailTerm, 'i')}]}
        return filter
    }
    return filter
}