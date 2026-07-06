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
            {role: 'user', content: `
                what is 2 + 2
                Do not add anything in the ans, take the samples from the examples.
                Examples:
                - what is 5 + 4?
                    Expected Output: 9 (Nine)
                - what is 10 + 10?
                    Expected Output: 20 (Twenty)
                `},
        ],
    });
    console.log('Ans from OpenAI API: \n', result.choices[0].message.content);
}

main();