// Пока нет базы данных объявляем массив с постами
import {PostOutput} from "../types/postsTypes";
import {DB_RESULTS} from "../common/constants";

export let postsDB: PostOutput[] = []
export const postsRepository = {
    deleteAllPosts(): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        postsDB = []
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    getAllPosts(): PostOutput[] {
        return postsDB
    },
    createPost(newPost: PostOutput): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        postsDB.push(newPost)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    getPostById(id: string): DB_RESULTS.NOT_FOUND | PostOutput {
        const foundPost: undefined | PostOutput = postsDB.find(p => p.id === id)
        if (foundPost === undefined) {
            return DB_RESULTS.NOT_FOUND
        }
        return foundPost
    },
    // обновляем пост по индексу. Пост точно найдем потому что до этого искали его в service. Если бы его не было с таким id, то сюда бы не дошли
    updatePostById(updatedPost: PostOutput): DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const postIndex: number = postsDB.findIndex(p => p.id === updatedPost.id)
        postsDB[postIndex] = updatedPost
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    },
    deletePostById(id: string): DB_RESULTS.NOT_FOUND | DB_RESULTS.SUCCESSFULLY_COMPLETED {
        const postIndex: number = postsDB.findIndex(p => p.id === id)
        if (postIndex === -1) {
            return DB_RESULTS.NOT_FOUND
        }
        postsDB.splice(postIndex, 1)
        return DB_RESULTS.SUCCESSFULLY_COMPLETED
    }
}