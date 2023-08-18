import request from 'supertest'
import {app} from "../../src/setting"
import {HTTP_STATUSES} from "../../src/common/constants";
import {VideoOutput} from "../../src/types/videosTypes";
import {videosErrors} from "../../src/validators/errors/videosErrors";
import {regexDateCheckISO8601} from "../../src/common/regex";

//TODO: переписать тесты под монгу

let createdVideo: VideoOutput;
beforeEach(async () => {
    await request(app)
        .delete('/testing/all-data')
        .expect(HTTP_STATUSES.NO_CONTENT_204)
    const postResponse = await request(app)
        .post('/videos')
        .send({title: 'test title', author: 'test author', availableResolutions: ['P144']})
        .expect(HTTP_STATUSES.CREATED_201)
    createdVideo = postResponse.body
})
afterEach(async () => {
    await request(app).delete('/testing/all-data').expect(HTTP_STATUSES.NO_CONTENT_204)
})
describe('GET ALL VIDEOS', () => {
    it('should return 200 and array videos ', async () => {
        const response = await request(app)
            .get('/videos')
        expect(response.status).toBe(HTTP_STATUSES.OK_200)
        expect(response.body).toStrictEqual(videosDB)
    })
})
describe('POST /videos', () => {

    describe('CREATE VIDEO VALIDATION', () => {
        it('if title missing should return 400 and title error', async () => {
            await request(app)
                .post('/videos')
                .send({author: 'test_author', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.title]})
        })
        it('if title is not a string type should return 400 and title error', async () => {
            await request(app)
                .post('/videos')
                .send({title: ['title1'], author: 'test_author', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.title]})
        })
        it('if title is empty should return 400 and title error', async () => {
            await request(app)
                .post('/videos')
                .send({title: ' ', author: 'test_author', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.title]})
        })
        it('if title longer than 40 characters should return 400 and title error', async () => {
            await request(app)
                .post('/videos')
                .send({
                    title: 'very_long_title_longer_than_40_characters',
                    author: 'test_author',
                    availableResolutions: ['P144']
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.title]})
        })
        it('if author missing should return 400 and author error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.author]})
        })
        it('if author is not a string type should return 400 and author error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 123, availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.author]})
        })
        it('if author is empty should return 400 and author error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: ' ', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.author]})
        })
        it('if author longer than 20 characters should return 400 and author error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 'author_longer_than_20', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.author]})
        })
        it('if availableResolutions missing should return 400 and availableResolutions error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 'test_author'})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.availableResolutions]})
        })
        it('if availableResolutions is not an array should return 400 and availableResolutions error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 'test_author', availableResolutions: 'P144'})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.availableResolutions]})
        })
        it('if availableResolutions do not match enum-values should return 400 and availableResolutions error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 'test_author', availableResolutions: ['P144', 'P240', 'P361']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.availableResolutions]})
        })
    })

    describe('CREATE VIDEO', () => {
        let newVideo: VideoOutput;
        it('video should be created and then it can be found by id', async () => {
            const response = await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 'test_author', availableResolutions: ['P720', 'P1080']})
                .expect(HTTP_STATUSES.CREATED_201)
            newVideo = response.body

            const getResponse = await request(app)
                .get(`/videos/${newVideo.id}`)
            expect(getResponse.status).toBe(HTTP_STATUSES.OK_200)
            expect(getResponse.body).toMatchObject({
                title: newVideo.title,
                author: newVideo.author,
                canBeDownloaded: false,
                minAgeRestriction: null,
                createdAt: regexDateCheckISO8601,
                publicationDate: regexDateCheckISO8601,
                availableResolutions: newVideo.availableResolutions
            })
        })
    })
})
describe('GET VIDEO BY ID', () => {
    it('should return 404 with a nonexistent id', async () => {
        await request(app)
            .get('/videos/999')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
    it('should return 200 and founded video after creation', async () => {
        await request(app)
            .get(`/videos/${createdVideo.id}`)
            .expect(HTTP_STATUSES.OK_200, createdVideo)
    })
})
describe('UPDATE VIDEO', () => {
    describe('UPDATE VIDEO VALIDATION', () => {
        it('if canBeDownloaded is not a boolean type should return 400 and canBeDownloaded error', async () => {
            await request(app)
                .put(`/videos/${createdVideo.id}`)
                .send({
                    title: 'test title',
                    author: 'test author',
                    availableResolutions: ['P144'],
                    canBeDownloaded: 'hello'
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.canBeDownloaded]})
        })
        it('if minAgeRestriction is not a number type should return 400 and minAgeRestriction error', async () => {
            await request(app)
                .put(`/videos/${createdVideo.id}`)
                .send({
                    title: 'test title',
                    author: 'test author',
                    availableResolutions: ['P144'],
                    minAgeRestriction: 'hello'
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.minAgeRestriction]})
        })
        it('if minAgeRestriction less 1 or more 18 should return 400 and minAgeRestriction error', async () => {
            await request(app)
                .put(`/videos/${createdVideo.id}`)
                .send({
                    title: 'test title',
                    author: 'test author',
                    availableResolutions: ['P144'],
                    minAgeRestriction: -1
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.minAgeRestriction]})

            await request(app)
                .put(`/videos/${createdVideo.id}`)
                .send({
                    title: 'test title',
                    author: 'test author',
                    availableResolutions: ['P144'],
                    minAgeRestriction: 19
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.minAgeRestriction]})
        })
        it('if publicationDate is not a string type should return 400 and publicationDate error', async () => {
            await request(app)
                .put(`/videos/${createdVideo.id}`)
                .send({
                    title: 'test title',
                    author: 'test author',
                    availableResolutions: ['P144'],
                    publicationDate: 2023
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.publicationDate]})
        })
        it('if publicationDate non-ISO8601 format should return 400 and publicationDate error', async () => {
            await request(app)
                .put(`/videos/${createdVideo.id}`)
                .send({
                    title: 'test title',
                    author: 'test author',
                    availableResolutions: ['P144'],
                    publicationDate: '2023-01-01'
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessages: [videosErrors.publicationDate]})
        })
    })
    describe('UPDATE VIDEO BY ID', () => {
        it('should return 404 with a nonexistent id', async () => {
            await request(app)
                .put('/videos/999')
                .send({title: 'test title 2', author: 'test author 2', availableResolutions: ['P360']})
            expect(HTTP_STATUSES.BAD_REQUEST_400)
        })
        it('should return 204 on successful update', async () => {
            await request(app)
                .put(`/videos/${createdVideo.id}`)
                .send({title: 'test title 2', author: 'test author 2', availableResolutions: ['P360']})
            expect(HTTP_STATUSES.NO_CONTENT_204)
        })
    })
})
describe('DELETE VIDEO', () => {
    it('should return 404 with a nonexistent id', async () => {
        await request(app)
            .delete('/videos/999')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
    it('should return 204 when delete, after when get by id return 404', async () => {
        await request(app)
            .delete(`/videos/${createdVideo.id}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
        await request(app)
            .get(`/videos/${createdVideo.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
})

