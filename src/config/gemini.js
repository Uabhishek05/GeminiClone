import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load .env in local development (safe to ignore in production if you set env vars another way)
dotenv.config();

// Read API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error(
    "Missing GEMINI_API_KEY environment variable. Set it in your environment or in a local .env file."
  );
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

async function generateResponse(userQuestion) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: userQuestion,
  });
  console.log("Question:", userQuestion);
  console.log("Response:", response.text);
  return response.text;
}

export default generateResponse;