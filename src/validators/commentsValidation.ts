import {body, ValidationChain} from "express-validator";
import {commentsErrors} from "./errors/commentsErrors";

/**
 * Содержит цепочки валидаций для проверки значений из req.body
 * В каждом условии bail() для прерывания цепочки валидации, чтобы не было дублей ошибок при несоблюдении нескольких условий у значения
 */
export const commentsValidation: ValidationChain[] = [
    body('content')
        .isString().withMessage(commentsErrors.content).bail()
        .trim().notEmpty().withMessage(commentsErrors.content).bail()
        .isLength({min: 20, max: 300}).withMessage(commentsErrors.content)
]