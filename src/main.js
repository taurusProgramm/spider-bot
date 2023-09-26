import { Telegraf } from 'telegraf';
import { Markup } from 'telegraf'
import{ message } from 'telegraf/filters'
import config from 'config'
import { postService} from './service.js'
import mongoose from 'mongoose'
import {Post} from './models/post.js'
import {getKeywords} from './openai.js'
import { log } from 'console';

const bot = new Telegraf(config.get('BOT_KEY'))

const commands = [
    { command: '/start', description: 'Начать использовать.' },
    { command: '/about', description: 'Поисковый бот.' },
]

const button = Markup.button.callback('Начать', 'start');

bot.action('start', (ctx) => {
    ctx.reply('Просто спросите, что Вас интересует');
    ctx.editMessageReplyMarkup();
  });

bot.command('start', (ctx) => {
    ctx.reply('Привет, я могу отправить Вам информацию по интересующему Вас вопросу.', Markup.inlineKeyboard([button]))
});
bot.command('about', (ctx) => {
    ctx.reply('Найду интересующую Вас информацию.')
});

bot.on(message('text'), async (ctx) => {

    
        const replica = await ctx.reply('Привет! Дайте нам пару мгновений и я приду к вам с ответом')
        // const searchQuery = ctx.message.text.toLowerCase().split(' ')
        // const posts = await Post.find({ keywords: {$in: searchQuery} })
        const posts = await Post.find({ channelId:  -1001954113477})
        if(posts.length === 0){
            ctx.reply('Ничего не найдено')
        } else {
            // console.log('Найденые посты: ', posts);
            for (const post of posts){
                try {
                    // await ctx.telegram.forwardMessage(ctx.message.chat.id, post.channelId, post.messageId)
                } catch (error) {
                    console.log(`Error when get deleted message: `,error.code, error.description);
                    Post.findByIdAndRemove(post._id)
                        .then(()=> {
                            console.log('Deteted message was removed from db')
                            Post.findOne().then((doc)=> (!doc) ? ctx.reply('Ничего не найдено'): null)
                        })
                }
            }
        }
         await ctx.deleteMessage(replica.message_id);
   
});

bot.on('message', async (ctx)=>{
    if(!ctx.message.text){
        ctx.reply('Отправьте текстовый запрос')
    }
    // console.log(ctx.message);
})


bot.on('channel_post', async(ctx) =>{
    if(ctx.update.channel_post.text || ctx.update.channel_post.caption){
    // console.log(ctx.update.channel_post.caption);
        try {
            const infoAboutChannel = {
                channelId: ctx.update.channel_post.chat.id,
                messageId: ctx.update.channel_post.message_id,
                textPost: ctx.update.channel_post.text ?? ctx.update.channel_post.caption,
                timestamp: ctx.update.channel_post.date * 1000
            }
            await postService.save(infoAboutChannel)
            console.log(infoAboutChannel);
        } catch (error) {
            console.log(`Error, when post from channel saved in db: ${error}`);
        }
    }
})


bot.on('edited_channel_post', async (ctx) => {
    if(ctx.update.edited_channel_post.text){
        const editedPostText = ctx.update.edited_channel_post.text;
        // console.log(ctx.update);
        Post.updateOne({
            channelId: ctx.update.edited_channel_post.chat.id, 
            messageId: ctx.update.edited_channel_post.message_id
        }, {
            textPost: ctx.update.edited_channel_post.text
        })
        .then(()=> console.log(`The post with ID ${ctx.update.edited_channel_post.message_id} in the channelID \"${ctx.update.edited_channel_post.chat.id}\" has been successfully updated.`))
        .catch((err)=>console.log(`Error while post's updating: ${err}`))
    }
});




bot.telegram.setMyCommands(commands);
bot.launch()
process.once('SIGINT', ()=> bot.stop('SIGINT'))
process.once('SIGTERM', ()=> bot.stop('SIGTERM'))


const startDB = () =>{
    const url = 'mongodb://localhost:27017/'; 

    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Успешное подключение к базе данных');
    })
    .catch((err) => {
        console.error('Ошибка подключения к базе данных:', err);
    });
}

startDB()