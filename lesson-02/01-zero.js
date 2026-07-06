import {OpenAI} from "openai";
import dotenv from 'dotenv'

dotenv.config({ path: ".env" });

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function main () {
    const result = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            // {role: 'user', content: 'what is 2 + 2'},
            {role: 'user', content: 'Tell me about CR7'},
        ],
    });
    console.log('Ans from OpenAI API: ', result.choices[0].message.content);
}

main();