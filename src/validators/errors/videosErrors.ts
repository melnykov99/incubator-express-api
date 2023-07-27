import {ErrorsObject} from "../../types/errors";

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
          message: 'canBeDownloaded must be boolean, by default false',
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
            message: 'availableResolutions must be a string with a maximum length of 20 characters',
            field: 'availableResolutions'
        }]
    }
}