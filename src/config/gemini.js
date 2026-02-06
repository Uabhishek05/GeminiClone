const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCWi_j4eoRMGvWuhSSguEygmtVOa1YVoMk";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
});

async function generateResponse(payload) {
  let contents = payload;

  if (payload && typeof payload === "object") {
    const parts = [];
    if (payload.text) {
      parts.push({ text: payload.text });
    }

    if (Array.isArray(payload.attachments)) {
      payload.attachments.forEach((attachment) => {
        if (attachment?.data && attachment?.type) {
          parts.push({
            inlineData: {
              data: attachment.data,
              mimeType: attachment.type
            }
          });
        }
      });
    }

    contents = parts.length ? parts : payload.text || "";
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
  });
  return response.text;
}

export default generateResponse;
