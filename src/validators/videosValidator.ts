import {Response, NextFunction} from 'express';
import {body, validationResult, ValidationChain} from 'express-validator';
import {videosErrors} from "./errors/videosErrors";
import {HTTP_STATUSES} from "../common/constants";
import {RequestWithBody} from "../types/generics";
import {CreateUpdateVideo} from "../dto/videos/CreateVideo";
export const videosValidator = (validations: ValidationChain[]) => {
    return async (req: RequestWithBody<CreateUpdateVideo>, res: Response, next: NextFunction) => {
        for (let validation of validations) {
            //TODO: result: any убрать
            const result: any = await validation.run(req);
            if (result.errors.length) break;
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(HTTP_STATUSES.BAD_REQUEST_400).send({ errors: errors.array() });
    };
}


//TODO: для availableResolutions сделать кастомную валидацию
export const videoCreateValidation: ValidationChain[] = [
    body('title').isString().isLength({min: 1, max: 40}).withMessage(videosErrors.title),
    body('author').isString().isLength({min: 1, max: 20}).withMessage(videosErrors.author),
]

export const videoUpdateValidation: ValidationChain[] = [
    body('title').isString().isLength({min: 1, max: 40}).withMessage(videosErrors.title),
    body('author').isString().isLength({min: 1, max: 20}).withMessage(videosErrors.author),
    body('canBeDownloaded').isBoolean().withMessage(videosErrors.canBeDownloaded),
    body('minAgeRestriction').isInt({min: 1, max: 18}).withMessage(videosErrors.minAgeRestriction),
    body('publicationDate').isDate().withMessage(videosErrors.publicationDate)
]