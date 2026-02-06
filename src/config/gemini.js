const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "REDACTED";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
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

async function main() {
  // Example usage with different questions
  const questions = [
    // "Explain how AI works in a few words",
    // "What is machine learning?",
    // "How does deep learning work?"
  ];

  for (const question of questions) {
    await generateResponse(question);
    console.log("---");
  }
}

await main();

export default generateResponse;
