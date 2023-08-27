import {body, ValidationChain} from "express-validator";
import {postsErrors} from "./errors/postsErrors";
import {blogsRepository} from "../repositories/blogsRepository";
import {BlogOutput} from "../types/blogsTypes";

/**
 * Проверяем существует ли блог в БД с переданным id. Если не существует, то blogsRepository вернет null
 * @param value blogId
 */
const checkAvailableBlog = async (value: string): Promise<boolean> => {
    const foundBLog: null | BlogOutput = await blogsRepository.getBlogById(value)
    return foundBLog !== null
}

/**
 * Содержит цепочки валидаций для проверки значений из req.body
 * В каждом условии bail() для прерывания цепочки валидации, чтобы не было дублей ошибок при несоблюдении нескольких условий у значения
 */
export const postsValidation: ValidationChain[] = [
    body('title')
        .isString().withMessage(postsErrors.title).bail()
        .trim().notEmpty().withMessage(postsErrors.title).bail()
        .isLength({min: 1, max: 30}).withMessage(postsErrors.title),
    body('shortDescription')
        .isString().withMessage(postsErrors.shortDescription).bail()
        .trim().notEmpty().withMessage(postsErrors.shortDescription).bail()
        .isLength({min: 1, max: 100}).withMessage(postsErrors.shortDescription),
    body('content')
        .isString().withMessage(postsErrors.content).bail()
        .trim().notEmpty().withMessage(postsErrors.content).bail()
        .isLength({min: 1, max: 1000}).withMessage(postsErrors.content),
    body('blogId')
        .isString().withMessage(postsErrors.blogId).bail()
        .custom(checkAvailableBlog).withMessage(postsErrors.blogIdNotFound)
]