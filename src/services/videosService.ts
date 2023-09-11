import {videosRepository} from "../repositories/videosRepository";
import {AvailableResolutions, VideoOutput, VideoViewModel} from "../types/videosTypes";
import {DB_RESULTS} from "../utils/common/constants";

export const videosService = {
    /**
     * Обращаемся к videosRepository, чтобы достать все видео из БД, передаем параметры для пагинации и сортировки
     * @param sortBy по какому полю выполнить сортировку и вернуть результат
     * @param sortDirection с каким направлением сделать сортировку asc или desc
     * @param pageNumber номер страницы для вывода
     * @param pageSize размер выводимой страницы
     */
    async getVideos(sortBy: string | undefined, sortDirection: string | undefined, pageNumber: string | undefined, pageSize: string | undefined): Promise<VideoViewModel> {
        return await videosRepository.getVideos(sortBy, sortDirection, pageNumber, pageSize)
    },
    /**
     * Преобразуем id из строки в число и обращаемся к videosRepository
     * @param id строчный id видео из параметров запроса
     * @return возвращаем константу NOT_FOUND, если видео по id не было найдено. Если найдено - возвращаем это видео
     */
    async getVideoById(id: string): Promise<VideoOutput | DB_RESULTS.NOT_FOUND> {
        const numberId: number = parseInt(id)
        const video: VideoOutput | DB_RESULTS.NOT_FOUND = await videosRepository.getVideoById(numberId)
        return video === DB_RESULTS.NOT_FOUND ? DB_RESULTS.NOT_FOUND : video
    },
    /**
     * Создаем объект нового видео в который прокидываем значения, пришедшие из req.body или значения по умолчанию для некоторых
     * @param title название видео
     * @param author автор видео
     * @param canBeDownloaded может ли скачиваться видео
     * @param minAgeRestriction возрастное ограничение
     * @param publicationDate дата публикации
     * @param availableResolutions расширения видео
     */
    async createVideo(title: string,
                      author: string,
                      canBeDownloaded: boolean | undefined,
                      minAgeRestriction: number | undefined,
                      publicationDate: string | undefined,
                      availableResolutions: AvailableResolutions[] | undefined): Promise<VideoOutput> {
        const newVideo: VideoOutput = {
            id: Date.now(),
            title: title,
            author: author,
            canBeDownloaded: canBeDownloaded ?? false,
            minAgeRestriction: minAgeRestriction ?? null,
            createdAt: (new Date().toISOString()),
            publicationDate: publicationDate ?? (new Date(new Date().setDate(new Date().getDate() + 1))).toISOString(),
            availableResolutions: availableResolutions ?? [AvailableResolutions.P144, AvailableResolutions.P240, AvailableResolutions.P360, AvailableResolutions.P480, AvailableResolutions.P720, AvailableResolutions.P1080, AvailableResolutions.P1440, AvailableResolutions.P2160]
        }
        //здесь создаем новую константу newVideoForDB и прокидываем в нее значения из newVideo.
        //иначе MongoDB добавляет в newVideo ключ _id при выполнении функции createVideo и мы возвращаем неправильные данные
        const newVideoForDB = {...newVideo}
        //здесь mongoDB под капотом добавляет передаваемому объекту ключ _id
        await videosRepository.createVideo(newVideoForDB)
        return newVideo
    },
    /**
     * Преобразуем строковый id из query в числовой, обращаемся к функции getVideoById в videosRepository, находим нужное нам видео
     * Если видео с таким id нет, то выходим из функции, возвращая соответствующую константу
     * Создаем объект updatedVideo, подставляем в него значения из req.body. Если значения необязательные и их нет, то оставляем те, что были.
     * Обращаемся к videosRepository.updateVideo и id видео которое нужно поменять и объект с обновленным видео
     * @param id id видео которое нужно изменить
     * @param title новое название видео
     * @param author новый автор видео
     * @param canBeDownloaded может ли скачиваться видео. Необязательное значение для обновления, может прийти undefined
     * @param minAgeRestriction возрастное ограничение. Необязательное значение для обновления, может прийти undefined
     * @param publicationDate дата публикации. Необязательное значение для обновления, может прийти undefined
     * @param availableResolutions расширения видео. Необязательное значение для обновления, может прийти undefined
     */
    async updateVideo(id: string,
                      title: string,
                      author: string,
                      canBeDownloaded: boolean | undefined,
                      minAgeRestriction: number | undefined,
                      publicationDate: string | undefined,
                      availableResolutions: AvailableResolutions[] | undefined): Promise<DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED> {
        const numberId: number = parseInt(id)
        const foundVideo: VideoOutput | DB_RESULTS.NOT_FOUND = await videosRepository.getVideoById(numberId)
        if (foundVideo === DB_RESULTS.NOT_FOUND) {
            return DB_RESULTS.NOT_FOUND
        }
        const updatedVideo: VideoOutput = {
            id: foundVideo.id,
            title: title,
            author: author,
            canBeDownloaded: canBeDownloaded ?? foundVideo.canBeDownloaded,
            minAgeRestriction: minAgeRestriction ?? foundVideo.minAgeRestriction,
            createdAt: foundVideo.createdAt,
            publicationDate: publicationDate ?? foundVideo.publicationDate,
            availableResolutions: availableResolutions ?? foundVideo.availableResolutions
        }
        await videosRepository.updateVideo(numberId, updatedVideo)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    /**
     * Преобразуем id из строки в число и обращаемся к videosRepository
     * @param id строчный id видео из параметров запроса
     * @return возвращаем константу NOT_FOUND, если видео по id не было найдено. Иначе константу об успешном выполнении удаления
     */
    async deleteVideoById(id: string): Promise<DB_RESULTS> {
        const numberId: number = parseInt(id)
        const deleteResult: DB_RESULTS = await videosRepository.deleteVideoById(numberId)
        return deleteResult === DB_RESULTS.NOT_FOUND ? DB_RESULTS.NOT_FOUND : DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}