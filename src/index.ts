import {app} from './setting';
import dotenv from 'dotenv';
import {runDb} from "./repositories/db";

dotenv.config()
const PORT: string | 3000 = process.env.PORT || 3000

const startApp = async () => {
    await runDb()

    app.listen(PORT, () => {
        console.log(`app listening on port: ${PORT}`)
    })
}
startApp()
