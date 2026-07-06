import {OpenAI} from "openai";
import dotenv from 'dotenv'

dotenv.config({ path: ".env" });

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// old method
async function main (prompt = '') {
    const result = await client.chat.completions.create({
        model: 'gpt-4o', // this require slightly heavier model
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: prompt,
            },
            // pasted the output of first run as assistent content on the next run so it give output of next step. basically adding a context and state to this call
            // {
            //     role: 'assistant',
            //     content: JSON.stringify( { "step" : "INITIAL", "text": "The user has asked me to solve a mathematical equation involving addition, subtraction, and multiplication."}),
            // }
        ],
    });
    console.log('Ans from OpenAI API: \n\n', result.choices[0].message.content, '\n\n');
};
// main('What is 4 + 6 + 9 - 3 * 5');

// we need to inject previous outputs into next call as models are stateless

const SYSTEM_PROMPT = `
    You are an expert AI engineer. You have to analyze the user's input carefully and then you need to breakdown the problem into multiple sub problems before coming on to the final result. Always breakdown the users intention and how to solve that problem and then step by step solve it.

    We are going to follow a pipeline of "INITIAL", "THINK", "ANALYZE" and "OUTPUT" pipeline.

    The Pipeline:
    - "INITIAL" when user gives an input, we will have an initial thought process on what this user is trying to ask.
    - "THINK" this is where we are going to think about how to solve this and then start to breakdown the problem
    - "ANALYZE" this is where we will analyze the solution and also verify if the output is correct
    - "THINK" we can go back to think mode where we can now see if any sub problem remains and think
    - "ANALYZE" again analyze the problem and get onto a solution
    - "OUTPUT" this is where we can end and give the final solution to the user.

    Rules:
    - Always output one step at a time and wait for other step before proceeding.
    - Always maintain the sequence of pipeline as given in example.
    - Always follow JSON output format strictly.

    Example:
    - "USER": What is 2 + 2 - 5 * 10 / 3 ?
    OUTPUT:
    - "INITIAL": "The user wants me to solve a maths equation"
    - "THINK": "I will use the BODMAS formula and based on that i should first multply 5*10 which is 50"
    - "ANALYZE": "Yes, the bodmas is actually right and now equation is 2+2-50/3"
    - "THINK": "Now as per rule I should perform divide which is dividing 50/3 which is 16.666667"
    - "THINK": "Now its simple we can just do 2+2=4 and new equation remains 4-16.666667"
    - "ANALYZE": "Great, now lets just do the final step as simple subtraction"
    - "THINK": "After the final subtraction the ans remains -12.666667"
    - "OUTPUT" "The final out put is '-12.666667'"

    Output Format: 
    { "step" : "INITIAL" | "THINK" | "ANALYZE" | "OUTPUT", "text": "<The Actual Text>"}
`;

const MESSAGES_DB = [{role: "system", content: SYSTEM_PROMPT},];

// COT way
async function main2 (prompt = '') {
    MESSAGES_DB.push({role: 'user', content: prompt});

    while(true) {
        const result = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: MESSAGES_DB,
        });

        const rawResult = result.choices[0].message.content;
        const parsedResult = JSON.parse(rawResult);

        MESSAGES_DB.push({role: 'assistant', content: rawResult});

        console.log(`🤖 (${parsedResult.step}) : ${parsedResult.text}`);

        if (parsedResult.step.toLowerCase() === "think") {
            // todo: make a claude or grok call to validate whether thinking is right or wrong
            // this also can push any corrected context as well
        }

        if (parsedResult.step.toLowerCase() === "output") break;
    }
};

// main2('What is 4 + 6 + 9 - 3 * 5');
main2('What is Advait Vedant?');