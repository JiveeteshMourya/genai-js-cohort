import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import "dotenv/config";

async function generateVectorEmbeddingsForFile(filepath) {
  // load the pdf content as document
  const loader = new PDFLoader(filepath);
  const document = await loader.load(); // already chunks data page by page

  // initialize the embedding model
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
  });

  // the vector store
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings, // use this embedding model
    {
      url: "http://localhost:6333",
      collectionName: "langchain-learning",
    },
  );

  await vectorStore.addDocuments(document);
  console.log("All the documents are indexed......");
}

generateVectorEmbeddingsForFile("Jivee_Sem_6_Result.pdf");
