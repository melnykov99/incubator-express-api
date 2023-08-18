import {MongoClient} from "mongodb";
import {VideoOutput} from "../types/videosTypes";
import {BlogOutput} from "../types/blogsTypes";
import {PostOutput} from "../types/postsTypes";

//Значение mongoURL должно определяться в переменной process.env.MONGODB, если его нет, то передаем строку-заглушку с которой подключения не произойдет
const mongoURL: string = process.env.MONGOURL || 'mongodb+srv://<username>:<password>@<clusterName>.mongodb.net/?retryWrites=true&w=majority"'
const client: MongoClient = new MongoClient(mongoURL);

export async function runDb() {
    try {
        await client.connect();
        console.log("MongoDB successfully connected");
    } catch (error) {
        console.log(error);
    }
    finally {
        await client.close();
    }
}

export const db = {
    videosCollection: client.db("IncubatorCluster").collection<VideoOutput>("videos"),
    blogsCollection: client.db("IncubatorCluster").collection<BlogOutput>("blogs"),
    postsCollection: client.db("IncubatorCluster").collection<PostOutput>("posts")
}