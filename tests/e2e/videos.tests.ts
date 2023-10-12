import request from 'supertest'
import {app} from "../../src/setting"
import {HTTP_STATUSES} from "../../src/utils/common/constants";

beforeEach(async () => {
    await request(app)
        .delete('/testing/all-data')
        .expect(HTTP_STATUSES.NO_CONTENT_204)
})



// GET /videos
describe('GET VIDEOS', () => {
    it('should return 200 and empty items array ', async () => {
        const response = await request(app)
            .get('/videos')
        expect(response.status).toBe(HTTP_STATUSES.OK_200)
        expect(response.body).toEqual({pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })
    it('should create and retrieve a video', async () => {
        // Создаем видео
        const createResponse = await request(app)
            .post('/videos')
            .send({title: 'test title', author: 'test author', availableResolutions: ['P144', 'P360', 'P720']})
        expect(createResponse.status).toBe(HTTP_STATUSES.CREATED_201)
        // После того как создали одно видео должно возвращаться pagesCount: 1 , totalCount: 1 и видео в items
        const getResponse = await request(app)
            .get('/videos')
        expect(getResponse.status).toBe(HTTP_STATUSES.OK_200)
        expect(getResponse.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [createResponse.body]
        })
    })
})

// GET /videos/:id

// POST /videos

// PUT /videos/:id

// DELETE /videos/:id
