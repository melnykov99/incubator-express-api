import request from 'supertest'
import {app} from "../../src/setting"
import {HTTP_STATUSES} from "../../src/utils/common/constants";

beforeEach(async () => {
    await request(app)
        .delete('/testing/all-data')
        .expect(HTTP_STATUSES.NO_CONTENT_204)
})
describe('GET VIDEOS', () => {
    it('should return 200 and empty items array ', async () => {
        const response = await request(app)
            .get('/videos')
        expect(response.status).toBe(HTTP_STATUSES.OK_200)
        expect(response.body).toStrictEqual({pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })
    it('should create video and')
})