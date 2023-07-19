import {availableResolutions} from "../../types/videosTypes";

export type CreateVideo = {
    title: string,
    author: string,
    canBeDownloaded? : boolean,
    minAgeRestriction? : number,
    publicationDate?: string,
    availableResolutions: availableResolutions[],
}