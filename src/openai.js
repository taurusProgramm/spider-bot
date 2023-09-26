import { Configuration, OpenAIApi } from 'openai'
import config from 'config'

const configuration = new Configuration({
    apiKey: config.get('OPEN_AI')
});

const openai = new OpenAIApi(configuration)

export const getKeywords = async (text) =>{
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {role: 'system', content: 'Найди ключевые слова и ответь только ими: ' },
                {role: 'user', content: text }
            ]
        })
        return response.data.choices[0].message.content.split(',')
    } catch (error) {
        console.log(`Error while ChatGpt getting keywords ${error}`);
    }
}