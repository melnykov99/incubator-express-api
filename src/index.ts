import {app} from './setting'
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`app listening on port: ${PORT}`)
})