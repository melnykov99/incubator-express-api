import {AvailableResolutions} from "../../types/videosTypes";

export type CreateUpdateVideo = {
    title: string,
    author: string,
    canBeDownloaded? : boolean,
    minAgeRestriction? : number,
    publicationDate?: string,
    availableResolutions?: AvailableResolutions[],
}