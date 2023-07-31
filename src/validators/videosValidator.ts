import {Response, NextFunction} from 'express';
import {body, validationResult, ValidationChain, ValidationError, Result, CustomValidator} from 'express-validator';
import {videosErrors} from "./errors/videosErrors";
import {HTTP_STATUSES} from "../common/constants";
import {RequestWithBody} from "../types/requestGenerics";
import {CreateUpdateVideo} from "../dto/videos/CreateVideo";
import {AvailableResolutions} from "../types/videosTypes";
import {regexDateCheckISO8601} from "../common/regex";
import {ErrorsMessage} from "../types/errorsTypes";

const matchAvailableResolutions: CustomValidator = (value: string[]) => {
    return value.every(el => el in AvailableResolutions)
};
const checkISOPublicationDate: CustomValidator = (value: string) => {
    return value.match(regexDateCheckISO8601)
};
export const videosValidator = (validations: ValidationChain[]) => {
    return async (req: RequestWithBody<CreateUpdateVideo>, res: Response, next: NextFunction) => {
        for (let validation of validations) {
            await validation.run(req);
        }

        const errors: Result<ValidationError> = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        const outputErrorsMsg: ErrorsMessage[] = errors.array().map((error) => error.msg)
        res.status(HTTP_STATUSES.BAD_REQUEST_400).send({errorsMessages: outputErrorsMsg});
    };
};
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

