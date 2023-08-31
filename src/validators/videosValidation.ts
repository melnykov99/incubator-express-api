import {body, ValidationChain, CustomValidator} from 'express-validator';
import {videosErrors} from "./errors/videosErrors";
import {AvailableResolutions} from "../types/videosTypes";
import {regexDateCheckISO8601} from "../utils/common/regex";

/**
 *
 * Сравнивает элементы пришедшего массива с enum AvailableResolutions.
 * @param value availableResolutions из req.body
 * @return {boolean} true, если все значения массива подходят под значения enum
 */
const matchAvailableResolutions: CustomValidator = (value: string[]) => {
    return value.every(el => el in AvailableResolutions)
};
/**
 * Проверяет строку на соответствие формату ISO8601 с помощью регулярного выражения
 * @param value время в формате ISO
 */
const checkISOPublicationDate: CustomValidator = (value: string) => {
    return value.match(regexDateCheckISO8601)
};
/**
 * Содержит цепочки валидаций для проверки значений из req.body
 * В каждом условии bail() для прерывания цепочки валидации, чтобы не было дублей ошибок при несоблюдении нескольких условий у значения
 */
export const videosValidation: ValidationChain[] = [
    body('title')
        .isString().withMessage(videosErrors.title).bail()
        .trim().notEmpty().withMessage(videosErrors.title).bail()
        .isLength({min: 1, max: 40}).withMessage(videosErrors.title),
    body('author')
        .isString().withMessage(videosErrors.author).bail()
        .trim().notEmpty().withMessage(videosErrors.author).bail()
        .isLength({min: 1, max: 20}).withMessage(videosErrors.author),
    body('canBeDownloaded').optional().isBoolean().withMessage(videosErrors.canBeDownloaded),
    body('minAgeRestriction').optional().isInt({min: 1, max: 18}).withMessage(videosErrors.minAgeRestriction),
    body('publicationDate')
        .optional().isString().withMessage(videosErrors.publicationDate).bail()
        .custom(checkISOPublicationDate).withMessage(videosErrors.publicationDate),
    body('availableResolutions')
        .isArray().withMessage(videosErrors.availableResolutions).bail()
        .custom(matchAvailableResolutions).withMessage(videosErrors.availableResolutions)
];

