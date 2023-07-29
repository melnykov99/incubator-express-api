import {Response, NextFunction} from 'express';
import {body, validationResult, ValidationChain, ValidationError, Result, CustomValidator} from 'express-validator';
import {videosErrors} from "./errors/videosErrors";
import {HTTP_STATUSES} from "../common/constants";
import {RequestWithBody} from "../types/requestGenerics";
import {CreateUpdateVideo} from "../dto/videos/CreateVideo";
import {AvailableResolutions} from "../types/videosTypes";

const IsAvailableResolutions: CustomValidator = (value: string[]) => {
    return value.every(el => el in AvailableResolutions)
};
export const videosValidator = (validations: ValidationChain[]) => {
    return async (req: RequestWithBody<CreateUpdateVideo>, res: Response, next: NextFunction) => {
        for (let validation of validations) {
            const result: Result<ValidationError> = await validation.run(req);
            if (!result.isEmpty()) break;
        }

        const errors: Result<ValidationError> = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors.array()[0].msg);
    };
};
export const videosValidation: ValidationChain[] = [
    body('title')
        .isString().withMessage(videosErrors.title)
        .trim().notEmpty().withMessage(videosErrors.title)
        .isLength({min: 1, max: 40}).withMessage(videosErrors.title),
    body('author')
        .isString().withMessage(videosErrors.author)
        .trim().notEmpty().withMessage(videosErrors.author)
        .isLength({min: 1, max: 20}).withMessage(videosErrors.author),
    body('canBeDownloaded').optional().isBoolean().withMessage(videosErrors.canBeDownloaded),
    body('minAgeRestriction').optional().isInt({min: 1, max: 18}).withMessage(videosErrors.minAgeRestriction),
    body('publicationDate').optional().isISO8601().toDate().withMessage(videosErrors.publicationDate),
    body('availableResolutions')
        .isArray().withMessage(videosErrors.availableResolutions)
        .custom(IsAvailableResolutions).withMessage(videosErrors.availableResolutions)
];

