import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../common/constants";
import {videosRepository} from "../repositories/videosRepository";
import {blogsRepository} from "../repositories/blogsRepository";
import {postsRepository} from "../repositories/postsRepository";

export const deleteDataRouter = Router()

// Обращаемся напрямую к репозиториям и делаем массивы пустыми
deleteDataRouter.delete('/', (req: Request, res: Response) => {
    videosRepository.deleteAllVideos()
    blogsRepository.deleteAllBlogs()
    postsRepository.deleteAllPosts()
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})