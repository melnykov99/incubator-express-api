import {ErrorsObject} from "../../types/errorsTypes";

export const videosErrors: ErrorsObject = {
    title: {
        'errorsMessages': [{
            message: 'title must be a string with a maximum length of 40 characters',
            field: 'title'
        }]
    },
    author: {
        'errorsMessages': [{
            message: 'author must be a string with a maximum length of 20 characters',
            field: 'author'
        }]
    },
    canBeDownloaded: {
      'errorsMessages': [{
          message: 'canBeDownloaded must be boolean',
          field: 'canBeDownloaded'
      }]
    },
    minAgeRestriction: {
        'errorsMessages': [{
            message: 'minAgeRestriction must be a number between 1 and 18',
            field: 'minAgeRestriction'
        }]
    },
    publicationDate: {
      'errorsMessages': [{
          message: 'publicationDate must be a date in the format 2024-01-01T12:00:00.001Z',
          field: 'publicationDate'
      }]
    },
    availableResolutions: {
        'errorsMessages': [{
            message: 'availableResolutions must be an array of strings with these values: P144, P240, P360, P480, P720, P1080, P1440, P2160',
            field: 'availableResolutions'
        }]
    }
}