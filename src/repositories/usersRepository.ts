import {db} from "./db";
import {RequestWithQuery} from "../types/requestGenerics";
import {GetUsersWithQuery} from "../dto/users/GetUsersWithQuery";
import {UserInDB, UserViewModel} from "../types/usersTypes";
import {DeleteResult} from "mongodb";
import {DB_RESULTS} from "../utils/common/constants";
import {PagSortValues} from "../types/commonTypes";
import {paginationAndSorting} from "../utils/common/paginationAndSorting";
import {searchLoginEmailDefinition} from "../utils/users/searchLoginEmailDefinition";

export const usersRepository = {
    async deleteAllUsers(): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.usersCollection.deleteMany({})
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    async getUsers(req: RequestWithQuery<GetUsersWithQuery>): Promise<UserViewModel> {
        const filter = searchLoginEmailDefinition(req.query.searchLoginTerm, req.query.searchEmailTerm)
        const pagSortValues: PagSortValues = await paginationAndSorting(
            req.query.sortBy, req.query.sortDirection, req.query.pageNumber, req.query.pageSize, 'usersCollection', filter)

        return {
            pagesCount: pagSortValues.pagesCount,
            page: pagSortValues.pageNumber,
            pageSize: pagSortValues.pageSize,
            totalCount: pagSortValues.totalCount,
            items: await db.usersCollection
                .find(filter, {projection: {_id: 0, passwordHash: 0}})
                .skip(pagSortValues.skip)
                .limit(pagSortValues.limit)
                .sort(pagSortValues.sortBy)
                .toArray()
        }
    },
    async createUser(newUser: UserInDB): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.usersCollection.insertOne(newUser)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    async deleteUser(id: string): Promise<DB_RESULTS> {
        const deleteResult: DeleteResult = await db.usersCollection.deleteOne({id})
        if (deleteResult.deletedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    async authUser(loginOrEmail: string): Promise<UserInDB | DB_RESULTS.INVALID_DATA> {
        const foundUser: UserInDB | null = await db.usersCollection.findOne({$or: [{login: loginOrEmail}, {email: loginOrEmail}]})
        if (foundUser === null) {
            return DB_RESULTS.INVALID_DATA
        }
        return foundUser
    }
}
