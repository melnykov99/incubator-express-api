import express, {Request, Response} from 'express';
import {HTTP_STATUSES} from "./common/constants";
import {videosRouter} from "./routes/videosRouter";
import {deleteDataRouter} from "./routes/deleteDataRouter";
import {blogsRouter} from "./routes/blogsRouter";
import {postsRouter} from "./routes/postsRouter";

export const app = express()

app.get('/', (req: Request, res: Response) => {
    res.status(HTTP_STATUSES.OK_200).send('Main Page')
})
app.use(express.json())
app.use('/testing/all-data', deleteDataRouter)
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)