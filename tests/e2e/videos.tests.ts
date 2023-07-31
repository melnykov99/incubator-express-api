import request from 'supertest'
import {app} from "../../src/setting"
import {HTTP_STATUSES} from "../../src/common/constants";
import {VideoOutput} from "../../src/types/videosTypes";
import {videosErrors} from "../../src/validators/errors/videosErrors";
import {regexDateCheckISO8601} from "../../src/common/regex";
import {videosDB} from "../../src/repositories/videosRepository";

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
        //title
        it('if title missing should return 400 and title error', async () => {
            await request(app)
                .post('/videos')
                .send({author: 'test_author', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.title]})
        })
        it('if title is not a string type should return 400 and title error', async () => {
            await request(app)
                .post('/videos')
                .send({title: ['title1'], author: 'test_author', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.title]})
        })
        it('if title is empty should return 400 and title error', async () => {
            await request(app)
                .post('/videos')
                .send({title: ' ', author: 'test_author', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.title]})
        })
        it('if title longer than 40 characters should return 400 and title error', async () => {
            await request(app)
                .post('/videos')
                .send({
                    title: 'very_long_title_longer_than_40_characters',
                    author: 'test_author',
                    availableResolutions: ['P144']
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.title]})
        })
        //author
        it('if author missing should return 400 and author error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.author]})
        })
        it('if author is not a string type should return 400 and author error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 123, availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.author]})
        })
        it('if author is empty should return 400 and author error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: ' ', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.author]})
        })
        it('if author longer than 20 characters should return 400 and author error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 'author_longer_than_20', availableResolutions: ['P144']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.author]})
        })
        //availableResolutions
        it('if availableResolutions missing should return 400 and availableResolutions error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 'test_author'})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.availableResolutions]})
        })
        it('if availableResolutions is not an array should return 400 and availableResolutions error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 'test_author', availableResolutions: 'P144'})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.availableResolutions]})
        })
        it('if availableResolutions do not match enum-values should return 400 and availableResolutions error', async () => {
            await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 'test_author', availableResolutions: ['P144', 'P240', 'P361']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.availableResolutions]})
        })
    })

    describe('CREATE VIDEO', () => {
        let createdVideo: VideoOutput;
        it('create video with valid values, return 201 and new video', async () => {
            const response = await request(app)
                .post('/videos')
                .send({title: 'test_title', author: 'test_author', availableResolutions: ['P720', 'P1080']})
                .expect(HTTP_STATUSES.CREATED_201)
            createdVideo = response.body
        })
        it('should return 200 and created video after creates', async () => {
            const response = await request(app)
                .get(`/videos/${createdVideo.id}`)
            expect(response.status).toBe(HTTP_STATUSES.OK_200)
            expect(response.body).toMatchObject({
                title: createdVideo.title,
                author: createdVideo.author,
                canBeDownloaded: false,
                minAgeRestriction: null,
                createdAt: regexDateCheckISO8601,
                publicationDate: regexDateCheckISO8601,
                availableResolutions: createdVideo.availableResolutions
            })
        })
    })
})

let createdVideo: VideoOutput;
beforeAll(async () => {
    await request(app)
        .delete('/testing/all-data')
        .expect(HTTP_STATUSES.NO_CONTENT_204)
    const postResponse = await request(app)
        .post('/videos')
        .send({title: 'test title', author: 'test author', availableResolutions: ['P144']})
        .expect(HTTP_STATUSES.CREATED_201)
    createdVideo = postResponse.body
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
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.canBeDownloaded]})
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
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.minAgeRestriction]})
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
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorsMessage: [videosErrors.minAgeRestriction]})

            await request(app)
                .put(`/videos/${createdVideo.id}`)
                .send({
                    title: 'test title',
                    author: 'test author',
                    availableResolutions: ['P144'],
                    minAgeRestriction: 19
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorMessages: [videosErrors.minAgeRestriction]})
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
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {errorMessages: [videosErrors.publicationDate]})
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
        console.log(createdVideo)
        await request(app)
            .delete(`/videos/${createdVideo.id}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
        console.log(createdVideo)
        await request(app)
            .get(`/videos/${createdVideo.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
})
