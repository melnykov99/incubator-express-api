import {db} from "./db";
import {RequestWithQuery} from "../types/requestGenerics";
import {GetUsersWithQuery} from "../dto/users/GetUsersWithQuery";
import {UserInDB, UserOutput} from "../types/usersTypes";
import {DeleteResult} from "mongodb";
import {DB_RESULTS} from "../utils/common/constants";
import {PagSortValues} from "../types/commonTypes";
import {paginationAndSorting} from "../utils/common/paginationAndSorting";

export const usersRepository = {
    async getUsers(req: RequestWithQuery<GetUsersWithQuery>): Promise<UserOutput[]> {
        const pagSortValues: PagSortValues = await paginationAndSorting(
            req.query.sortBy, req.query.sortDirection, req.query.pageNumber, req.query.pageSize, 'usersCollection')

        return db.usersCollection
            .find({}, {projection: {_id: 0, passwordHash: 0}})
            .skip(pagSortValues.skip)
            .limit(pagSortValues.limit)
            .sort(pagSortValues.sortBy)
            .toArray()
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
    }
}