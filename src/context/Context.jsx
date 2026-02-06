import { createContext, useState } from "react";
import generateResponse from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const escapeHtml = (value) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatResponse = (text) => {
    const lines = (text ?? "").split(/\r?\n/);
    let html = "";
    let inUl = false;
    let inOl = false;

    const closeLists = () => {
      if (inUl) {
        html += "</ul>";
        inUl = false;
      }
      if (inOl) {
        html += "</ol>";
        inOl = false;
      }
    };

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();

      if (!trimmed) {
        closeLists();
        html += "<br>";
        continue;
      }

      const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        closeLists();
        const level = headingMatch[1].length;
        const content = escapeHtml(headingMatch[2]).replace(
          /\*\*(.+?)\*\*/g,
          "<strong>$1</strong>"
        );
        html += `<h${level}>${content}</h${level}>`;
        continue;
      }

      const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        if (!inUl) {
          closeLists();
          html += "<ul>";
          inUl = true;
        }
        const content = escapeHtml(bulletMatch[1]).replace(
          /\*\*(.+?)\*\*/g,
          "<strong>$1</strong>"
        );
        html += `<li>${content}</li>`;
        continue;
      }

      const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
      if (orderedMatch) {
        if (!inOl) {
          closeLists();
          html += "<ol>";
          inOl = true;
        }
        const content = escapeHtml(orderedMatch[1]).replace(
          /\*\*(.+?)\*\*/g,
          "<strong>$1</strong>"
        );
        html += `<li>${content}</li>`;
        continue;
      }

      closeLists();
      const paragraph = escapeHtml(trimmed).replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
      );
      html += `<p>${paragraph}</p>`;
    }

    closeLists();
    return html;
  };

  const onSent = async (prompt, attachments = []) => {
    const trimmedPrompt = (prompt ?? "").trim();
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    if (!trimmedPrompt && !hasAttachments) {
      return;
    }

    let activeChatId = currentChatId;
    if (!activeChatId) {
      activeChatId = `${Date.now()}`;
      setCurrentChatId(activeChatId);
    }

    setResultData("");
    setLoading(true);
    setShowResults(true);
    setRecentPrompt(trimmedPrompt);
    setPrevPrompts((prev) => (trimmedPrompt ? [...prev, trimmedPrompt] : prev));

    setChats((prev) => {
      const existing = prev.find((chat) => chat.id === activeChatId);
      const updatedChat = existing
        ? {
            ...existing,
            title: existing.title || trimmedPrompt || "New chat",
            messages: [
              ...existing.messages,
              {
                id: `${Date.now()}-u`,
                role: "user",
                content: trimmedPrompt,
                attachments: hasAttachments ? attachments : []
              }
            ]
          }
        : {
            id: activeChatId,
            title: trimmedPrompt || "New chat",
            messages: [
              {
                id: `${Date.now()}-u`,
                role: "user",
                content: trimmedPrompt,
                attachments: hasAttachments ? attachments : []
              }
            ]
          };

      const rest = prev.filter((chat) => chat.id !== activeChatId);
      return [updatedChat, ...rest];
    });

    try {
      const responseText = await generateResponse({
        text: trimmedPrompt,
        attachments
      });
      const formatted = formatResponse(responseText);
      setResultData(formatted);
      setChats((prev) => {
        const existing = prev.find((chat) => chat.id === activeChatId);
        if (!existing) return prev;
        const updatedChat = {
          ...existing,
          messages: [
            ...existing.messages,
            { id: `${Date.now()}-a`, role: "assistant", content: formatted }
          ]
        };
        const rest = prev.filter((chat) => chat.id !== activeChatId);
        return [updatedChat, ...rest];
      });
    } catch (error) {
      console.error("Failed to generate response:", error);
      setResultData("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const newChat = () => {
    setCurrentChatId(null);
    setRecentPrompt("");
    setShowResults(false);
    setResultData("");
    setInput("");
  };

  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
    setShowResults(true);
    const chat = chats.find((item) => item.id === chatId);
    if (chat?.messages?.length) {
      const lastUser = [...chat.messages].reverse().find((m) => m.role === "user");
      setRecentPrompt(lastUser?.content || chat.title || "");
    }
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResults,
    loading,
    resultData,
    input,
    setInput,
    chats,
    currentChatId,
    newChat,
    selectChat
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
