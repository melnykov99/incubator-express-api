import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../utils/common/constants";
import {videosRepository} from "../repositories/videosRepository";
import {blogsRepository} from "../repositories/blogsRepository";
import {postsRepository} from "../repositories/postsRepository";
import {usersRepository} from "../repositories/usersRepository";

export const deleteDataRouter = Router()

// Удаляем все данные. Обращаемся напрямую к репозиториям и делаем массивы пустыми
deleteDataRouter.delete('/', async (req: Request, res: Response) => {
    await videosRepository.deleteAllVideos()
    await blogsRepository.deleteAllBlogs()
    await postsRepository.deleteAllPosts()
    await usersRepository.deleteAllUsers()
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})