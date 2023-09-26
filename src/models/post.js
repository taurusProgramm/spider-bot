import {Schema, model} from 'mongoose'

const postSchema = new Schema({
    channelId: Number,
    messageId: Number,
    textPost: String, 
    timestamp: Number,
    keywords: Array
})

export const Post = model('Post', postSchema)