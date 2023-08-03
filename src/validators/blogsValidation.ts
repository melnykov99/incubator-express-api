import {body, ValidationChain} from "express-validator";
import {blogsErrors} from "./errors/blogsErrors";

export const blogsValidation: ValidationChain[] = [
    body('name')
        .isString().withMessage(blogsErrors.name).bail()
        .trim().notEmpty().withMessage(blogsErrors.name).bail()
        .isLength({min: 1, max: 15}).withMessage(blogsErrors.name),
    body('description')
        .isString().withMessage(blogsErrors.description).bail()
        .trim().notEmpty().withMessage(blogsErrors.description).bail()
        .isLength({min: 1, max: 500}).withMessage(blogsErrors.description),
    body('websiteUrl')
        .isString().withMessage(blogsErrors.websiteUrl).bail()
        .isLength({min: 1, max: 100}).withMessage(blogsErrors.websiteUrl).bail()
        .isURL({protocols: ['https']}).withMessage(blogsErrors.websiteUrl)
]