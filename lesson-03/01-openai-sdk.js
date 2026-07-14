import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI(); // it auto fetches api key from .env with name OPENAI_API_KEY
// conditioned that this file and .env should be in same directory

async function init() {
  const result = await client.responses.create({
    model: "gpt-4o-mini",
    input: "Hey there, My name is Jiveetesh Mourya",
  });
  console.log(result.output_text);
}

init();
