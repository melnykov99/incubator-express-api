import request from 'supertest'
import {app} from "../../src/setting"
import {HTTP_STATUSES} from "../../src/common/constants";
import {AvailableResolutions} from "../../src/types/videosTypes";
import {videosErrors} from "../../src/validators/errors/videosErrors";

describe('GET ALL VIDEOS', () => {
    it('should return 200 and array videos ', async () => {
        await request(app)
            .get('/videos')
            .expect(HTTP_STATUSES.OK_200, [
                {
                    id: 1,
                    title: 'title',
                    author: 'author',
                    canBeDownloaded: true,
                    minAgeRestriction: 18,
                    createdAt: '2023-07-27T05:07:50.901Z',
                    publicationDate: '2023-07-28T05:07:50.901Z',
                    availableResolutions: [AvailableResolutions.P480, AvailableResolutions.P720, AvailableResolutions.P1080]
                }
            ])
    })
})
describe('CREATE VIDEO VALIDATION', () => {
    //title
    it('if title is not a string type should return 400 and title error', async () => {
        await request(app)
            .post('/videos')
            .send({title: ['title1'], author: 'test_author', availableResolutions: ['P144']})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, videosErrors.title)
    })
    it('if title is empty should return 400 and title error', async () => {
        await request(app)
            .post('/videos')
            .send({title: ' ', author: 'test_author', availableResolutions: ['P144']})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, videosErrors.title)
    })
    it('if title longer than 40 characters should return 400 and title error', async () => {
        await request(app)
            .post('/videos')
            .send({title: 'very_long_title_longer_than_40_characters', author: 'test_author', availableResolutions: ['P144']})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, videosErrors.title)
    })
    //author
    it('if author is not a string type should return 400 and author error', async () => {
        await request(app)
            .post('/videos')
            .send({title: 'test_title', author: 123, availableResolutions: ['P144']})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, videosErrors.author)
    })
    it('if author is empty should return 400 and author error', async () => {
        await request(app)
            .post('/videos')
            .send({title: 'test_title', author: ' ', availableResolutions: ['P144']})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, videosErrors.author)
    })
    it('if author longer than 20 characters should return 400 and author error', async () => {
        await request(app)
            .post('/videos')
            .send({title: 'test_title', author: 'author_longer_than_20', availableResolutions: ['P144']})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, videosErrors.author)
    })
    //availableResolutions
    it('if availableResolutions is not an array should return 400 and availableResolutions error', async () => {
        await request(app)
            .post('/videos')
            .send({title: 'test_title', author: 'test_author', availableResolutions: 'P144'})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, videosErrors.availableResolutions)
    })
    it('if availableResolutions do not match enum-values should return 400 and availableResolutions error', async () => {
        await request(app)
            .post('/videos')
            .send({title: 'test_title', author: 'test_author', availableResolutions: ['P144', 'P240', 'P361']})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, videosErrors.availableResolutions)
    })
})

//TODO: сделать тесты с проверкой значений созданного объекта по дефолту и когда задаем.
describe('CREATE VIDEO', () => {
    it('create video with valid values, return 201 and new video', async () => {
        await request(app)
            .post('/videos')
            .send({title: 'test_title', author: 'test_author', availableResolutions: ['P720', 'P1080']})
            .expect(HTTP_STATUSES.CREATED_201)
    })
})