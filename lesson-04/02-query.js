import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function query(userQuery) {
  // step1: convert user query into vector embeddings?
  // initialize the embedding model
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
  });

  // step2: search the vectors in the qdrant
  // the vector store
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings, // use this embedding model
    {
      url: "http://localhost:6333",
      collectionName: "langchain-learning",
    },
  );

  // step3: get similar vectors and chunks?
  const vectorRetriver = vectorStore.asRetriever({ k: 5 }); // to only take atmost 5 chunks
  const results = await vectorRetriver.invoke(userQuery);

  // step4: feed those chunks to llm model and do a simple chat with {userQuery}
  const SYSTEM_PROMPT = `
    You are an expert in answering user query based on the provided context about document.
    Do not answer anything beyond what is not provided.

    Always also answer the user in short and tell on which page number that content is available

    User Documents:
    ${results.map((e) => JSON.stringify({ pageContent: e.pageContent, pageNumber: e.metadata.loc.pageNumber })).join("\n\n")}
  `;
  // console.log(SYSTEM_PROMPT);

  const llmResponse = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
    ],
  });
  console.log(`LLM Response: `, llmResponse.choices[0].message.content);
}

// query('What is waterfall model?');
query("What subjects does Jiveetesh Study?");
