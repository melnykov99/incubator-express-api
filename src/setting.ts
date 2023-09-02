import express, {Request, Response} from 'express';
import {HTTP_STATUSES} from "./utils/common/constants";
import {videosRouter} from "./routes/videosRouter";
import {deleteDataRouter} from "./routes/deleteDataRouter";
import {blogsRouter} from "./routes/blogsRouter";
import {postsRouter} from "./routes/postsRouter";
import {usersRouter} from "./routes/usersRouter";
import {authRouter} from "./routes/authRouter";
import {commentsRouter} from "./routes/commentsRouter";

export const app = express()

app.get('/', (req: Request, res: Response) => {
    res.status(HTTP_STATUSES.OK_200).send('Main Page')
})
app.use(express.json())
app.use('/testing/all-data', deleteDataRouter)
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)