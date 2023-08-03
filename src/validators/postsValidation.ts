import {body, ValidationChain} from "express-validator";
import {postsErrors} from "./errors/postsErrors";
import {blogsRepository} from "../repositories/blogsRepository";
import {BlogOutput} from "../types/blogsTypes";

const checkAvailableBlog = (value: string): boolean => {
    const foundBLog: undefined | BlogOutput = blogsRepository.getBlogById(value)
    return foundBLog !== undefined
}

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