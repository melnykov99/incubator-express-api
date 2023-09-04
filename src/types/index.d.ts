import {UserInDB} from "./usersTypes";

/**
 *
 */
declare global {
    declare namespace Express {
        export interface Request {
            user: UserInDB
        }
    }
}