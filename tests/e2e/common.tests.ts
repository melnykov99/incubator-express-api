import request from 'supertest'
import {app} from "../../src/setting"
import {HTTP_STATUSES} from "../../src/utils/common/constants";

describe('OPEN MAIN PAGE', () => {
    it('should return status 200 and main page', async () => {
        await request(app)
            .get('/')
            .expect(HTTP_STATUSES.OK_200, 'Main Page')
    })
})
describe('DELETE ALL DATA', () => {
    it('should delete all data and return status 204', async () => {
        await request(app)
            .delete('/testing/all-data')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })
    it('should return empty array after delete all data', async () => {
        await request(app)
            .get('/videos')
            .expect(HTTP_STATUSES.OK_200, [])
    })
})