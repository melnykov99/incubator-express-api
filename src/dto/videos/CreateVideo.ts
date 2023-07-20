import {availableResolutions} from "../../types/videosTypes";

export type CreateUpdateVideo = {
    title: string,
    author: string,
    canBeDownloaded? : boolean,
    minAgeRestriction? : number,
    publicationDate?: string,
    availableResolutions?: availableResolutions[],
}