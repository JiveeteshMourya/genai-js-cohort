import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI();

async function init() {
  const stream = await client.responses.create({
    model: "gpt-4o-mini",
    stream: true,
    input: [
      {
        role: "user",
        content:
          "Tell me a story about iron man debugging malfunction in his suit.",
      },
    ],
  });

  for await (const event of stream) {
    // console.log(event);

    // if(event && event.delta) console.log(event.delta);
    if (event && event.delta) process.stdout.write(event.delta);
  }
}
init();
