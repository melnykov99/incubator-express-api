import request from 'supertest'
import {app} from "../../src/setting"
import {HTTP_STATUSES} from "../../src/common/constants";

//main page
describe('/', () => {
    it('should return status 200 and main page', async () => {
        await request(app)
            .get('/')
            .expect(HTTP_STATUSES.OK_200,'Main Page')
    })
})

//delete all data