import {OpenAI} from "openai";
import dotenv from 'dotenv'

dotenv.config({ path: ".env" });

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{role: 'user', content: 'Hello, How are you?'}]
})
.then((response) => {
    console.log(response.choices[0].message.content);
})