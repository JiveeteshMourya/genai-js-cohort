import dotenv from "dotenv"

dotenv.config({ path: ".env" });

export const API_KEY = process.env.OPENAI_API_KEY;