import request from "supertest";
import {app} from "../../src/setting";
import {HTTP_STATUSES} from "../../src/common/constants";
import {postsDB} from "../../src/repositories/postsRepository";
import {BlogOutput} from "../../src/types/blogsTypes";

describe('GET ALL POSTS', () => {
    it('should return 200 and array posts ', async () => {
        const response = await request(app)
            .get('/posts')
        expect(response.status).toBe(HTTP_STATUSES.OK_200)
        expect(response.body).toStrictEqual(postsDB)
    })
})
describe('POST /posts', () => {
    //need a blog created to check the posts route
    let createdBlog: BlogOutput;
    it('should create blog for test posts route', async () => {
        const response = await request(app).post('/blogs').set('Authorization', 'Basic YWRtaW46cXdlcnR5').send({
            name: 'test blog',
            description: 'test description',
            websiteUrl: 'https://test.com'
        })
        createdBlog = response.body
    })

    describe('basic auth check', () => {
        it('should return 401 when requested without headers', async () => {
            await request(app)
                .post('/posts')
                .send({
                    title: 'post title',
                    shortDescription: 'post short description',
                    content: 'post content',
                    blogId: createdBlog.id
                })
                .expect(HTTP_STATUSES.UNAUTHORIZED_401)
        })
    })
})