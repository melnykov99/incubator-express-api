import {db} from "./db";
import {RequestWithQuery} from "../types/requestGenerics";
import {GetUsersWithQuery} from "../dto/users/GetUsersWithQuery";
import {UserInDB, UserOutput} from "../types/usersTypes";
import {DeleteResult} from "mongodb";
import {DB_RESULTS} from "../utils/common/constants";

export const usersRepository = {
    async getUsers(req: RequestWithQuery<GetUsersWithQuery>): Promise<UserOutput[]> {
        return db.usersCollection.find({}).toArray()
    },
    async createUser(newUser: UserInDB): Promise<DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        await db.usersCollection.insertOne(newUser)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    async getUserById(id: string): Promise<UserOutput | DB_RESULTS.NOT_FOUND> {
      const foundUser: UserOutput | null = await db.usersCollection.findOne({id}, {projection: {_id: 0, passwordHash: 0}})
        if (foundUser === null) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundUser
    },
    async deleteUser(id: string): Promise<DB_RESULTS> {
        const deleteResult: DeleteResult = await db.usersCollection.deleteOne({id})
        if (deleteResult.deletedCount === 0) {
            return DB_RESULTS.NOT_FOUND
        }
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}