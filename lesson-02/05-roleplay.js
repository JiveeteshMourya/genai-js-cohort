import { OpenAI } from "openai";
import dotenv from "dotenv";
import axios from "axios";
import { exec } from "child_process";

dotenv.config({ path: ".env" });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getWeatherData(cityName) {
  const url = `https://wttr.in/${cityName.toLowerCase()}?format=%C+%t`;
  const response = await axios.get(url, { responseType: "text" });
  return JSON.stringify({ cityName, weatherInfo: response.data });
}

async function executeCommandOnCli(cmd) {
  return new Promise((res, rej) => {
    exec(cmd, (err, out) => {
      if (err) return res(`There was an Error: ${err}`);
      else return res(out);
    });
  });
}

const SYSTEM_PROMPT = `
    You are an expert AI engineer. Only and only answer questions related to the coding and engineering.

    Persona: You are a senior software developer.
    Persona Traits:
    - You always sound technical and use jargons.
    - You never answer back on personal things and you don't have personal life
    - All you know is how and what code is

    You have to analyze the user's input carefully and then you need to breakdown the problem into multiple sub problems before coming on to the final result. Always breakdown the users intention and how to solve that problem and then step by step solve it.

    We are going to follow a pipeline of "INITIAL", "THINK", "ANALYZE", "TOOL_REQUEST" and "OUTPUT" pipeline.

    The Pipeline:
    - "INITIAL" when user gives an input, we will have an initial thought process on what this user is trying to ask.
    - "THINK" this is where we are going to think about how to solve this and then start to breakdown the problem
    - "ANALYZE" this is where we will analyze the solution and also verify if the output is correct
    - "THINK" we can go back to think mode where we can now see if any sub problem remains and think
    - "ANALYZE" again analyze the problem and get onto a solution
    - "TOOL_REQUEST" use this for calling or requesting a tool. The format of output would be {'step': 'TOOL_REQUEST', functionName: 'getWeatherData', 'input': 'Bhopal'}
    - "OUTPUT" this is where we can end and give the final solution to the user.

    Available Tools:
    - "getWeatherData": getWeatherData(cityName: string): Returns the realtime weather information of city
    - "executeCommandOnCli": executeCommandOnCli(command: string): Executes the command on user's device and returns output from stdout

    Rules:
    - Always output one step at a time and wait for other step before proceeding.
    - Always maintain the sequence of pipeline as given in example.
    - Always follow JSON output format strictly.
    - Always write JSON parsable output

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

    Example:
    - "USER": "What is weather of Goa?"
    OUTPUT:
    - "INITIAL": "The user wants me to fetch weather information of Goa"
    - "THINK": "From the tools i can see getWeatherData which can be called"
    - "ANALYZE": "we are going right, we can call getWeatherData with "Goa" as input"
    - "TOOL_REQUEST": {"functionName": "getWeatherData", "input": "goa"}
    - "TOOL_OUTPUT": "The weather of Goa is sunny with some 30 degree c."
    - "THINK": "We got the weather info"
    - "OUTPUT": "The weather of Goa is sunny with some 30 degree c. Its gonna be Hot_AF"


    Output Format: 
    { "step" : "INITIAL" | "THINK" | "ANALYZE" | "OUTPUT", "text": "<The Actual Text>", "functionName": "<Name of Function>", "input": "Input params of Function" }

    Rules:
    - Always output one step at a time and wait for other step before proceeding.
    - Always maintain the sequence of pipeline as given in example.
    - Always follow JSON output format strictly.
    - Always write JSON parsable output
`;

const MESSAGES_DB = [{ role: "system", content: SYSTEM_PROMPT }];

async function main(prompt = "") {
  MESSAGES_DB.push({ role: "user", content: prompt });

  while (true) {
    // this .completions api is depricated, now we use .responses api
    const result = await client.chat.completions.create({
      model: "gpt-5.4",
      messages: MESSAGES_DB,
    });

    const rawResult = result.choices[0].message.content;
    const parsedResult = JSON.parse(rawResult);

    MESSAGES_DB.push({ role: "assistant", content: rawResult });

    console.log(`🤖 (${parsedResult.step}) : ${parsedResult.text}`);

    if (parsedResult.step.toLowerCase() === "output") break;

    if (parsedResult.step.toUpperCase() === "TOOL_REQUEST") {
      const { functionName, input } = parsedResult;
      switch (functionName) {
        case "getWeatherData":
          {
            const toolResult = await getWeatherData(input);
            console.log(`🛠️ ${functionName}(${input}) : `, toolResult);

            MESSAGES_DB.push({
              role: "developer",
              content: JSON.stringify({
                step: "TOOL_OUTPUT",
                output: toolResult,
              }),
            });
            continue;
          }
          break;
        case "executeCommandOnCli":
          {
            try {
              const toolResult = await executeCommandOnCli(input);
              console.log(`🛠️ ${functionName}(${input}) : `, toolResult);

              MESSAGES_DB.push({
                role: "developer",
                content: JSON.stringify({
                  step: "TOOL_OUTPUT",
                  output: toolResult,
                }),
              });
            } catch (error) {
              MESSAGES_DB.push({
                role: "developer",
                content: JSON.stringify({
                  status: "error",
                  error,
                }),
              });
            }
            continue;
          }
          break;
      }
    }
  }
}

// main("What is Advait Vedant?")
// main("What is Advait Vedant? I'am asking this because I need to write this in an HTML file for my web dev project");

main(
  "build a todo application using HTML, CSS and JS. create a folder named todo-app and write all those code files in that folder. also return the folder path",
);
