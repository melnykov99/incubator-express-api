import request from 'supertest'
import {app} from "../../src/setting"
import {HTTP_STATUSES} from "../../src/utils/common/constants";

// Роут удаления всех данных. Очищает все коллекции в БД.
describe('DELETE ALL DATA', () => {
    it('should delete all data and return status 204', async () => {
        await request(app)
            .delete('/testing/all-data')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })
    //если данных в коллекции нет, то в items будет пустой массив
    it('should return empty items array after delete all data', async () => {
        await request(app)
            .get('/videos')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })
    it('should return empty items array after delete all data', async () => {
        await request(app)
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })
    it('should return empty items array after delete all data', async () => {
        await request(app)
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })
    //get users защищен basicAuth, поэтому передаем нужный Authorization
    it('should return empty items array after delete all data', async () => {
        await request(app)
            .get('/users')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })
})