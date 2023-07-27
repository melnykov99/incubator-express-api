export type ErrorsObject = {[key: string]: ErrorsMessage}

export type ErrorsMessage = {
    "errorsMessages": [
        {
            message: string,
            field: string
        }
    ]
}