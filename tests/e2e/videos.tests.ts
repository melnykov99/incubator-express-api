import request from 'supertest'
import {app} from "../../src/setting"
import {HTTP_STATUSES} from "../../src/common/constants";

//videos
describe('/videos', () => {
    it('should return 200 and array videos ', async () => {
        await request(app)
            .get('/videos')
            .expect(HTTP_STATUSES.OK_200, [])
    })
})