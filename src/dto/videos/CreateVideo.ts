import {AvailableResolutions} from "../../types/videos";

export type CreateUpdateVideo = {
    title: string,
    author: string,
    canBeDownloaded? : boolean,
    minAgeRestriction? : number,
    publicationDate?: string,
    availableResolutions?: AvailableResolutions[],
}