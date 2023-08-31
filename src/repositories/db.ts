import {MongoClient} from "mongodb";
import {VideoOutput} from "../types/videosTypes";
import {BlogOutput} from "../types/blogsTypes";
import {PostOutput} from "../types/postsTypes";
import dotenv from "dotenv";
import {UserOutput} from "../types/usersTypes";

dotenv.config()

//Значение mongoURL должно определяться в переменной process.env.MONGODB, если его нет, то передаем строку-заглушку с которой подключения не произойдет.
const mongoURL: string = process.env.MONGOURL || 'mongodb+srv://<username>:<password>@<clusterName>.mongodb.net/?retryWrites=true&w=majority"'
const client: MongoClient = new MongoClient(mongoURL);

//Запуск БД
export async function runDb() {
    try {
        await client.connect();
        console.log("MongoDB successfully connected");

    } catch (error) {
        console.log(error);
    }
}

//Объявляем объект db внутри которого обращаемся к нужным нам коллекциям
export const db = {
    videosCollection: client.db("IncubatorCluster").collection<VideoOutput>("videos"),
    blogsCollection: client.db("IncubatorCluster").collection<BlogOutput>("blogs"),
    postsCollection: client.db("IncubatorCluster").collection<PostOutput>("posts"),
    usersCollection: client.db('IncubatorCluster').collection<UserOutput>("users")
}