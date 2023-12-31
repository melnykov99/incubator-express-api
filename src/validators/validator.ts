import {Result, ValidationChain, ValidationError, validationResult} from "express-validator";
import {CreateUpdateVideo} from "../dto/videos/CreateUpdateVideo";
import {RequestWithBody, RequestWithParamsAndBody} from "../types/requestGenerics";
import {Response, NextFunction} from "express";
import {ErrorsMessage} from "../types/errorsTypes";
import {HTTP_STATUSES} from "../utils/common/constants";
import {CreateUpdateBlog} from "../dto/blogs/CreateUpdateBlog";
import {CreateUpdatePost} from "../dto/posts/CreateUpdatePost";
import {CreatePostByBlogId} from "../dto/posts/CreatePostByBlogId";
import {CreateUser} from "../dto/users/CreateUser";
import {LoginUser} from "../dto/auth/LoginUser";
import {UpdateDeleteCommentById} from "../dto/comments/UpdateDeleteCommentById";
import {UpdateComment} from "../dto/comments/UpdateComment";
import {GetCommentsByPostId} from "../dto/posts/GetCommentsByPostId";
import {CreateCommentByPostId} from "../dto/posts/CreateCommentByPostId";
import {RegistrationEmailResending} from "../dto/auth/RegistrationEmailResending";

/**
 * Циклом проходится по ValidationChain и запускает каждую проверку. Если были ошибки при валидации, то запишет их в массив errors.
 * Если errors пуст, то заканчивает валидацию и отдает запрос далее. Если ошибки были, то отдает 400 и выводит msg этих ошибок в объекте errorsMessage
 * @param validations массив значений для проверки из req.body и условия валидации
 * @return если ошибок нет, то отдает запрос дальше. Если ошибки есть, то 400 статус и выводит msg этих ошибок
 */
export const validator = (validations: ValidationChain[]) => {
    return async (req: RequestWithBody<CreateUpdateVideo | CreateUpdateBlog | CreateUpdatePost | CreatePostByBlogId | CreateUser | LoginUser>
                      | RequestWithParamsAndBody<UpdateDeleteCommentById, UpdateComment> | RequestWithParamsAndBody<GetCommentsByPostId, CreateCommentByPostId>
                      | RequestWithBody<RegistrationEmailResending>,
                  res: Response, next: NextFunction) => {
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