const API_KEY_STORAGE = "dsa-gemini-api-key";
const DEFAULT_API_KEY = "AIzaSyDrUk8bL4nygI-np0HAG51DTbMHnlErqHw";

export function getGeminiApiKey() {
    return localStorage.getItem(API_KEY_STORAGE) || DEFAULT_API_KEY;
}

export function setGeminiApiKey(key) {
    if (key) {
        localStorage.setItem(API_KEY_STORAGE, key.trim());
    } else {
        localStorage.removeItem(API_KEY_STORAGE);
    }
}

const SYSTEM_PROMPT = `You are a friendly DSA (Data Structures & Algorithms) tutor embedded in a revision platform. Your role:

1. **Give progressive hints** — start with a subtle nudge, then get more specific if the user asks again. Never dump the full solution immediately.
2. **Explain concepts clearly** — use simple language, analogies, and small examples.
3. **Analyze complexity** — when relevant, discuss time and space complexity with Big-O notation.
4. **Encourage learning** — ask the user what they've tried, guide them to the answer.
5. **Be concise** — keep responses short and scannable. Use bullet points and code snippets when helpful.
6. **Format nicely** — use markdown: bold for key terms, backticks for code, numbered lists for steps.

If the user provides a specific problem, help them think through the approach rather than giving the answer outright.`;

export async function sendMessage(chatHistory, questionContext = null) {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("NO_API_KEY");
    }

    const contents = [];

    // Add system instruction as the first user turn context
    let systemText = SYSTEM_PROMPT;
    if (questionContext) {
        systemText += `\n\nThe user is currently looking at this problem:\n- **Problem**: ${questionContext.question}\n- **Topic**: ${questionContext.topic}\n- **Difficulty**: ${questionContext.difficulty || "Medium"}`;
        if (questionContext.link) {
            systemText += `\n- **Link**: ${questionContext.link}`;
        }
    }

    // Build the conversation for Gemini API
    chatHistory.forEach((msg, index) => {
        if (index === 0 && msg.role === "user") {
            // Prepend system prompt to first user message
            contents.push({
                role: "user",
                parts: [{ text: systemText + "\n\n" + msg.text }],
            });
        } else {
            contents.push({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.text }],
            });
        }
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents,
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `API Error: ${response.status}`;
        throw new Error(message);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("No response from Gemini. Try again.");
    }

    return text;
}
