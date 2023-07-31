export type ErrorsObject = { [key: string]: ErrorsMessage }

export type ErrorsMessage = {
    message: string,
    field: string
}