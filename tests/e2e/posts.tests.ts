import request from "supertest";
import {app} from "../../src/setting";
import {HTTP_STATUSES} from "../../src/common/constants";
import {postsDB} from "../../src/repositories/postsRepository";
import {BlogOutput} from "../../src/types/blogsTypes";
import {PostOutput} from "../../src/types/postsTypes";

// Перед каждым тестом создаем новый блог и пост. После каждого теста удаляем все данные.
let createdBlog: BlogOutput;
let createdPost: PostOutput;

beforeEach(async () => {
    const responseBlog = await request(app)
        .post('/blogs')
        .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
        .send({name: 'test blog', description: 'test blog description', websiteUrl: 'https://test.com'})
        .expect(HTTP_STATUSES.CREATED_201)
    createdBlog = responseBlog.body

    const responsePost = await request(app)
        .post('/posts')
        .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
        .send({
            title: 'test post',
            shortDescription: 'test shortDescription',
            content: 'test content',
            blogId: createdBlog.id
        })
        .expect(HTTP_STATUSES.CREATED_201)
    createdPost = responsePost.body
})
afterEach(async () => {
    await request(app).delete('/testing/all-data').expect(HTTP_STATUSES.NO_CONTENT_204)
})
//start testing
describe('basic auth check', () => {
    it('should return 401 when requested without headers', async () => {
        await request(app)
            .post('/posts')
            .send({
                title: 'test post',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)

        await request(app)
            .put('/posts/1')
            .send({
                title: 'test post',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)

        await request(app)
            .delete('/posts/1')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
    it('should return 401 when requested with wrong headers', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'login/password')
            .send({
                title: 'test post',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)

        await request(app)
            .put('/posts/1')
            .set('Authorization', 'login/password')
            .send({
                title: 'test post',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)

        await request(app)
            .put('/posts/1')
            .set('Authorization', 'login/password')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
    it('should return successfully status when requested with correct headers and body', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test post',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.CREATED_201)

        await request(app)
            .put(`/posts/${createdPost.id}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test post',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .delete(`/posts/${createdPost.id}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })
})
describe('posts validation check', () => {
    it('should return 400 and title error when title empty', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: ' ',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [{
                    message: 'title must be string with a maximum length of 30 characters',
                    field: 'title'
                }]
            })
    })
    it('should return 400 and title error when title not string', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: ['test title'],
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [{
                    message: 'title must be string with a maximum length of 30 characters',
                    field: 'title'
                }]
            })
    })
    it('should return 400 and title error when title longer 30 characters', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'it is very very very long title',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [{
                    message: 'title must be string with a maximum length of 30 characters',
                    field: 'title'
                }]
            })
    })
    it('should return 400 and shortDescription error when shortDescription empty', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test title',
                shortDescription: ' ',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [{
                    message: 'shortDescription must be string with a maximum length of 100 characters',
                    field: 'shortDescription'
                }]
            })
    })
    it('should return 400 and shortDescription error when shortDescription not string', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test title',
                shortDescription: 2,
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [{
                    message: 'shortDescription must be string with a maximum length of 100 characters',
                    field: 'shortDescription'
                }]
            })
    })
    it('should return 400 and shortDescription error when shortDescription longer 100 characters', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test title',
                shortDescription: 'shortDescriptionshortDescriptionshortDescriptionshortDescriptionshortDescriptionshortDescriptionShort',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [{
                    message: 'shortDescription must be string with a maximum length of 100 characters',
                    field: 'shortDescription'
                }]
            })
    })
    it('should return 400 and content error when content empty', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test title',
                shortDescription: 'test shortDescription',
                content: ' ',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [{
                    message: 'content must be string with a maximum length of 1000 characters',
                    field: 'content'
                }]
            })
    })
    it('should return 400 and content error when content empty', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test title',
                shortDescription: 'test shortDescription',
                content: 3,
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [{
                    message: 'content must be string with a maximum length of 1000 characters',
                    field: 'content'
                }]
            })
    })
    it('should return 400 and content error when content empty', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test title',
                shortDescription: 'test shortDescription',
                content: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Na',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [{
                    message: 'content must be string with a maximum length of 1000 characters',
                    field: 'content'
                }]
            })
    })
    it('should return 400 and blogId error when blogId not string', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test title',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: 111
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [{
                    message: 'blogId must be string',
                    field: 'blogId'
                }]
            })
    })
    it('should return 400 and blogId error when blogId non-exist', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test title',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: '111'
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [{
                    message: 'blogId not found',
                    field: 'blogId'
                }]
            })
    })
    it('should return 400 and all errors when in body all data wrong', async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'it is very very very long title',
                shortDescription: 2,
                content: ' ',
                blogId: '111'
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: 'title must be string with a maximum length of 30 characters',
                        field: 'title'
                    },
                    {
                        message: 'shortDescription must be string with a maximum length of 100 characters',
                        field: 'shortDescription'
                    },
                    {
                        message: 'content must be string with a maximum length of 1000 characters',
                        field: 'content'
                    },
                    {
                        message: 'blogId not found',
                        field: 'blogId'
                    }
                ]
            })
        await request(app)
            .put('/blogs/1')
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
describe('GET ALL POSTS', () => {
    it('should return 200 and array posts ', async () => {
        const response = await request(app)
            .get('/posts')
        expect(response.status).toBe(HTTP_STATUSES.OK_200)
        expect(response.body).toStrictEqual(postsDB)
    })
})
describe('POST /posts', () => {
    let newPost: PostOutput;
    it('post should be created and then it can be found by id', async () => {
        const response = await request(app)
            .post('/posts')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test title',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.CREATED_201)
        newPost = response.body

        await request(app)
            .get(`/posts/${newPost.id}`)
            .expect(HTTP_STATUSES.OK_200, newPost)
    })
})
describe('GET post by id', () => {
    it('should return 404 when requesting a non-existent post', async () => {
        await request(app)
            .get('/posts/111')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
    it('should return 200 and found post when id correct', async () => {
        await request(app)
            .get(`/blogs/${createdBlog.id}`)
            .expect(HTTP_STATUSES.OK_200, createdBlog)
    })
})
describe('UPDATE post by id', () => {
    it('should return 404 when requesting a non-existent post', async () => {
        await request(app)
            .put('/posts/111')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test title',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
    it('should return 204 when update existing post', async () => {
        await request(app)
            .put(`/posts/${createdPost.id}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'test title',
                shortDescription: 'test shortDescription',
                content: 'test content',
                blogId: createdBlog.id
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const getResponse = await request(app)
            .get(`/posts/${createdPost.id}`)
        expect(getResponse.status).toBe(HTTP_STATUSES.OK_200)
        expect(getResponse.body).toMatchObject({
            title: 'test title',
            shortDescription: 'test shortDescription',
            content: 'test content',
            blogId: createdBlog.id
        })
    })
})
describe('DELETE post by id', () => {
    it('should return 404 when requesting a non-existent post', async () => {
        await request(app)
            .delete('/posts/111')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
    it('should return 204 when delete existing post', async () => {
        await request(app)
            .delete(`/posts/${createdPost.id}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })
})