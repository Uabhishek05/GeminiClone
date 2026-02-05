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

    const onSent = async (prompt) => {
        const trimmedPrompt = (prompt ?? "").trim();
        if (!trimmedPrompt) {
            return;
        }

        setLoading(true);
        setShowResults(true);
        setRecentPrompt(trimmedPrompt);
        setPrevPrompts((prev) => [...prev, trimmedPrompt]);

        try {
            const responseText = await generateResponse(trimmedPrompt);
            setResultData(responseText ?? "");
        } catch (error) {
            console.error("Failed to generate response:", error);
            setResultData("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
            setInput("");
        }
    }
    
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
        setInput
        
    }
    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider
