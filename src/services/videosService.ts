import {videosRepository} from "../repositories/videosRepository";
import {AvailableResolutions, VideoOutput} from "../types/videosTypes";
import {DB_RESULTS} from "../common/constants";
import {RequestWithBody, RequestWithParamsAndBody} from "../types/requestGenerics";
import {CreateUpdateVideo} from "../dto/videos/CreateVideo";
import {GetVideoById} from "../dto/videos/GetVideoById";

export const videosService = {
    /**
     * Обращаемся к videosRepository, чтобы достать все видео из БД
     */
    getAllVideos(): VideoOutput[] {
        return videosRepository.getAllVideos()
    },
    /**
     * Преобразуем id из строки в число и обращаемся к videosRepository
     * @param id строчный id видео из параметров запроса
     * @return возвращаем константу NOT_FOUND, если видео по id не было найдено. Если найдено - возвращаем это видео
     */
    getVideoById(id: string): VideoOutput | DB_RESULTS.NOT_FOUND {
        const numberId: number = parseInt(id)
        const video: VideoOutput | DB_RESULTS.NOT_FOUND = videosRepository.getVideoById(numberId)
        return video === DB_RESULTS.NOT_FOUND ? DB_RESULTS.NOT_FOUND : video
    },
    /**
     * Создаем объект нового видео в который прокидываем значения видео из объекта или выставляем по дефолту для необязательных значений.
     * @param req запрос в теле которого значения для создания видео
     * @return возвращаем новое видео
     */
    createVideo(req: RequestWithBody<CreateUpdateVideo>): VideoOutput {
        const newVideo: VideoOutput = {
            id: Date.now(),
            title: req.body.title,
            author: req.body.author,
            canBeDownloaded: req.body.canBeDownloaded ?? false,
            minAgeRestriction: req.body.minAgeRestriction ?? null,
            createdAt: (new Date().toISOString()),
            publicationDate: req.body.publicationDate ?? (new Date(new Date().setDate(new Date().getDate() + 1))).toISOString(),
            availableResolutions: req.body.availableResolutions ?? [AvailableResolutions.P144, AvailableResolutions.P240, AvailableResolutions.P360, AvailableResolutions.P480, AvailableResolutions.P720, AvailableResolutions.P1080, AvailableResolutions.P1440, AvailableResolutions.P2160]
        }
        videosRepository.createVideo(newVideo)
        return newVideo
    },
    /**
     * Преобразуем строковый id в числовой, обращаемся к функции getVideoById в videosRepository, находим нужное нам видео
     * Если видео с таким id нет, то выходим из функции, возвращая соответствующую константу
     * Создаем объект updatedVideo, подставляем в него значения из req.body. Если значения необязательные и их нет, то оставляем те, что были.
     * Обращаемся к videosRepository.updateVideo и передаем новый объект видео обновленный и id
     * @param req в запросе id в параметрах и значения для обновления в body
     * @return возвращаем константу NOT_FOUND, если видео не найдено или константу SUCCESSFULLY_COMPLETED, если видео нашли и обновили
     */
    updateVideo(req: RequestWithParamsAndBody<GetVideoById, CreateUpdateVideo>): DB_RESULTS {
        const numberId: number = parseInt(req.params.id)
        const foundVideo: VideoOutput | DB_RESULTS.NOT_FOUND = videosRepository.getVideoById(numberId)
        if (foundVideo === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const updatedVideo: VideoOutput = {
            id: foundVideo.id,
            title: req.body.title,
            author: req.body.author,
            canBeDownloaded: req.body.canBeDownloaded ?? foundVideo.canBeDownloaded,
            minAgeRestriction: req.body.minAgeRestriction ?? foundVideo.minAgeRestriction,
            createdAt: foundVideo.createdAt,
            publicationDate: req.body.publicationDate ?? foundVideo.publicationDate,
            availableResolutions: req.body.availableResolutions ?? foundVideo.availableResolutions
        }
        videosRepository.updateVideo(updatedVideo, numberId)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Преобразуем id из строки в число и обращаемся к videosRepository
     * @param id строчный id видео из параметров запроса
     * @return возвращаем константу NOT_FOUND, если видео по id не было найдено. Иначе константу об успешном выполнении удаления
     */
    deleteVideoById(id: string): DB_RESULTS {
        const numberId: number = parseInt(id)
        const deletionResult: DB_RESULTS = videosRepository.deleteVideoById(numberId)
        return deletionResult === DB_RESULTS.NOT_FOUND ? DB_RESULTS.NOT_FOUND : DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}