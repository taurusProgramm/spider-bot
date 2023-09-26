import axios  from 'axios';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import {Post} from './models/post.js'
import {getKeywords} from './openai.js'




class PostService{
    async save(options){
        const post = new Post(options)
        post.save()
            .then(()=>console.log(`The post with ID ${options.messageId} from the channelID ${options.channelId} has been successfully added to the database.`))
            .catch((err)=>{console.log(`При сохранении поста в базу данных произошла ошибка: ${err}`)})
    }
    
}

export const postService = new PostService()