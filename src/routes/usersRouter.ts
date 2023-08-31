import {Response, Router} from "express";
import {basicAuth} from "../middlewares/basicAuth";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../types/requestGenerics";
import {GetUsersWithQuery} from "../dto/users/GetUsersWithQuery";
import {DB_RESULTS, HTTP_STATUSES} from "../utils/common/constants";
import {usersService} from "../services/usersService";
import {UserOutput} from "../types/usersTypes";
import {CreateUser} from "../dto/users/CreateUser";
import {DeleteUser} from "../dto/users/DeleteUser";
import {validator} from "../validators/validator";
import {usersValidation} from "../validators/usersValidation";

export const usersRouter = Router()

usersRouter.get('/', basicAuth, async (req: RequestWithQuery<GetUsersWithQuery>, res: Response) => {
    const users: UserOutput[] = await usersService.getUsers(req)
    res.status(HTTP_STATUSES.OK_200).send(users)
})
usersRouter.post('/', basicAuth, validator(usersValidation), async (req: RequestWithBody<CreateUser>, res: Response) => {
    const newUser: UserOutput = await usersService.createUser(req)
    res.status(HTTP_STATUSES.CREATED_201).send(newUser)
})
usersRouter.delete('/:id', basicAuth, async (req: RequestWithParams<DeleteUser>, res: Response) => {
    const deleteResult: DB_RESULTS = await usersService.deleteUser(req.params.id)
    if (deleteResult === DB_RESULTS.NOT_FOUND) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})