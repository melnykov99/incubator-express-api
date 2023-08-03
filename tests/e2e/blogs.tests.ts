import request from "supertest";
import {app} from "../../src/setting";
import {HTTP_STATUSES} from "../../src/common/constants";
import {blogsDB} from "../../src/repositories/blogsRepository";
import {BlogOutput} from "../../src/types/blogsTypes";

describe('GET ALL BLOGS', () => {
    it('should return 200 and array blogs ', async () => {
        const response = await request(app)
            .get('/blogs')
        expect(response.status).toBe(HTTP_STATUSES.OK_200)
        expect(response.body).toStrictEqual(blogsDB)
    })
})
describe('POST /blogs', () => {
    describe('basic auth check', () => {
        it('should return 401 when requested without headers', async () => {
            await request(app)
                .post('/blogs')
                .send({name: 'blog name', description: 'blog description', websiteUrl: 'https://google.com'})
                .expect(HTTP_STATUSES.UNAUTHORIZED_401)
        })
        it('should return 401 when requested with wrong headers', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'login/password')
                .send({name: 'blog name', description: 'blog description', websiteUrl: 'https://google.com'})
                .expect(HTTP_STATUSES.UNAUTHORIZED_401)
        })
        it('should return 201 when requested with correct headers and body', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({name: 'blog name', description: 'blog description', websiteUrl: 'https://google.com'})
                .expect(HTTP_STATUSES.CREATED_201)
        })
    })
    describe('blogs validation check', () => {
        it('should return 200 with correct body', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({name: 'blog name', description: 'blog description', websiteUrl: 'https://google.com'})
                .expect(HTTP_STATUSES.CREATED_201)
        })
        it('should return 400 and name error when name empty', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({name: ' ', description: 'blog description', websiteUrl: 'https://google.com'})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                    errorsMessages: [{
                        message: 'name must be string with a maximum length of 15 characters',
                        field: 'name'
                    }]
                })
        })
        it('should return 400 and name error when name not string', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({name: 123, description: 'blog description', websiteUrl: 'https://google.com'})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                    errorsMessages: [{
                        message: 'name must be string with a maximum length of 15 characters',
                        field: 'name'
                    }]
                })
        })
        it('should return 400 and name error when name longer 15 characters', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({name: 'It is a long name', description: 'blog description', websiteUrl: 'https://google.com'})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                    errorsMessages: [{
                        message: 'name must be string with a maximum length of 15 characters',
                        field: 'name'
                    }]
                })
        })
        it('should return 400 and description error when description empty', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({name: 'blog name', description: ' ', websiteUrl: 'https://google.com'})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                    errorsMessages: [{
                        message: 'description must be string with a maximum length of 500 characters',
                        field: 'description'
                    }]
                })
        })
        it('should return 400 and description error when description not string', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({name: 'blog name', description: ['description'], websiteUrl: 'https://google.com'})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                    errorsMessages: [{
                        message: 'description must be string with a maximum length of 500 characters',
                        field: 'description'
                    }]
                })
        })
        it('should return 400 and description error when description longer 500 characters', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    name: 'blog name',
                    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus',
                    websiteUrl: 'https://google.com'
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                    errorsMessages: [{
                        message: 'description must be string with a maximum length of 500 characters',
                        field: 'description'
                    }]
                })
        })
        it('should return 400 and websiteUrl error when websiteUrl is not string', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({name: 'blog name', description: 'description', websiteUrl: ['https://google.com']})
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                    errorsMessages: [{
                        message: 'websiteUrl must be string with a maximum length of 100 characters and be in url format. For example https://www.google.com/',
                        field: 'websiteUrl'
                    }]
                })
        })
        it('should return 400 and websiteUrl error when websiteUrl longer 100 characters', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    name: 'blog name',
                    description: 'description',
                    websiteUrl: 'https://googlegooglegooglegooglegooglegooglegooglegooglegooglegooglegooglegooglegooglegooglegoogle.com'
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                    errorsMessages: [{
                        message: 'websiteUrl must be string with a maximum length of 100 characters and be in url format. For example https://www.google.com/',
                        field: 'websiteUrl'
                    }]
                })
        })
        it('should return 400 and websiteUrl error when websiteUrl not have url format', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    name: 'blog name',
                    description: 'description',
                    websiteUrl: 'google/com'
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                    errorsMessages: [{
                        message: 'websiteUrl must be string with a maximum length of 100 characters and be in url format. For example https://www.google.com/',
                        field: 'websiteUrl'
                    }]
                })
        })
        it('should return 400 and all errors when in body all data wrong', async () => {
            await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    name: ' ',
                    description: 2,
                    websiteUrl: 'google/com'
                })
                .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                    errorsMessages: [
                        {
                            message: 'name must be string with a maximum length of 15 characters',
                            field: 'name'
                        },
                        {
                            message: 'description must be string with a maximum length of 500 characters',
                            field: 'description'
                        },
                        {
                            message: 'websiteUrl must be string with a maximum length of 100 characters and be in url format. For example https://www.google.com/',
                            field: 'websiteUrl'
                        }
                    ]
                })
        })
    })
    describe('create blog', () => {
        let createdBlog: BlogOutput;
        it('blog should be created and then it can be found by id', async () => {
            const response = await request(app)
                .post('/blogs')
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({name: 'blog name', description: 'blog description', websiteUrl: 'https://google.com'})
                .expect(HTTP_STATUSES.CREATED_201)
            createdBlog = response.body

            await request(app)
                .get(`/blogs/${createdBlog.id}`)
                .expect(HTTP_STATUSES.OK_200, createdBlog)
        })
    })
})
describe('GET blog by id', () => {
    it('should return 404 when requesting a non-existent blog', async () => {
        await request(app)
            .get('/blogs/111')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
    let createdBlog: BlogOutput;
    it('should create a blog and successfully find it', async () => {
        const response = await request(app)
            .post('/blogs')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({name: 'blog name', description: 'blog description', websiteUrl: 'https://google.com'})
            .expect(HTTP_STATUSES.CREATED_201)
        createdBlog = response.body

        await request(app)
            .get(`/blogs/${createdBlog.id}`)
            .expect(HTTP_STATUSES.OK_200, createdBlog)
    })
})