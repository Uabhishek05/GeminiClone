import axios from "axios";

const POLLINATIONS_API_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY;
const POLLINATIONS_BASE_URL = "https://gen.pollinations.ai/v1/chat/completions";
const POLLINATIONS_MODEL = import.meta.env.VITE_POLLINATIONS_MODEL || "openai";

const buildMessageContent = (payload) => {
  if (!payload || typeof payload !== "object") {
    return String(payload || "");
  }

  const parts = [];

  if (payload.text?.trim()) {
    parts.push({
      type: "text",
      text: payload.text.trim()
    });
  }

  if (Array.isArray(payload.attachments)) {
    payload.attachments.forEach((attachment) => {
      if (!attachment?.data || !attachment?.type) return;
      if (!attachment.type.startsWith("image/")) return;

      parts.push({
        type: "image_url",
        image_url: {
          url: `data:${attachment.type};base64,${attachment.data}`
        }
      });
    });
  }

  if (parts.length === 0) {
    return "";
  }

  return parts.length === 1 && parts[0].type === "text" ? parts[0].text : parts;
};

const extractText = (apiResponse) => {
  const content = apiResponse?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item?.text === "string" ? item.text : ""))
      .join("")
      .trim();
  }

  return "";
};

const extractApiErrorMessage = (error) => {
  const message =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;

  return typeof message === "string" && message.trim()
    ? message
    : "Pollinations request failed";
};

const requestChatCompletion = async (model, messageContent) => {
  const { data } = await axios.post(
    POLLINATIONS_BASE_URL,
    {
      model,
      messages: [
        {
          role: "user",
          content: messageContent
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${POLLINATIONS_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return data;
};

async function generateResponse(payload) {
  if (!POLLINATIONS_API_KEY) {
    throw new Error("Missing VITE_POLLINATIONS_API_KEY in .env");
  }

  const messageContent = buildMessageContent(payload);
  const fallbackModels = [POLLINATIONS_MODEL, "openai"].filter(
    (model, index, arr) => !!model && arr.indexOf(model) === index
  );

  let lastError = null;
  let data = null;

  for (const model of fallbackModels) {
    try {
      data = await requestChatCompletion(model, messageContent);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status !== 400) {
        break;
      }
    }
  }

  if (!data) {
    throw new Error(extractApiErrorMessage(lastError));
  }

  const text = extractText(data);
  if (!text) {
    throw new Error("Pollinations returned an empty response");
  }

  return text;
}

export default generateResponse;
