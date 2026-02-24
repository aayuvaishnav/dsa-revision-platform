import React, { useState, useRef, useEffect } from "react";
import { sendMessage, getGeminiApiKey } from "../utils/gemini";
import { useToast } from "./Toast";
import "./AIChatbot.css";

const AIChatbot = ({ questionContext }) => {
    const toast = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        if (!getGeminiApiKey()) {
            toast.error("Please set your Gemini API key in Settings first.");
            return;
        }

        const userMessage = { role: "user", text };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await sendMessage(updatedMessages, questionContext);
            setMessages((prev) => [...prev, { role: "assistant", text: response }]);
        } catch (error) {
            if (error.message === "NO_API_KEY") {
                toast.error("Please set your Gemini API key in Settings.");
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", text: `⚠️ Error: ${error.message}` },
                ]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([]);
        toast.info("Chat cleared.");
    };

    // Simple markdown-like rendering
    const renderText = (text) => {
        // Process code blocks first
        const parts = text.split(/(```[\s\S]*?```)/g);
        return parts.map((part, i) => {
            if (part.startsWith("```")) {
                const codeContent = part.replace(/```\w*\n?/, "").replace(/```$/, "");
                return (
                    <pre key={i} className="chat-code-block">
                        <code>{codeContent}</code>
                    </pre>
                );
            }
            // Process inline formatting
            return (
                <span key={i}>
                    {part.split("\n").map((line, j) => (
                        <React.Fragment key={j}>
                            {j > 0 && <br />}
                            {renderInline(line)}
                        </React.Fragment>
                    ))}
                </span>
            );
        });
    };

    const renderInline = (text) => {
        // Bold
        let result = text.replace(/\*\*(.*?)\*\*/g, "⟨b⟩$1⟨/b⟩");
        // Inline code
        result = result.replace(/`([^`]+)`/g, "⟨code⟩$1⟨/code⟩");

        const parts = result.split(/(⟨\/?(?:b|code)⟩)/g);
        const elements = [];
        let isBold = false;
        let isCode = false;

        parts.forEach((part, i) => {
            if (part === "⟨b⟩") { isBold = true; return; }
            if (part === "⟨/b⟩") { isBold = false; return; }
            if (part === "⟨code⟩") { isCode = true; return; }
            if (part === "⟨/code⟩") { isCode = false; return; }
            if (!part) return;

            if (isBold) {
                elements.push(<strong key={i}>{part}</strong>);
            } else if (isCode) {
                elements.push(<code key={i} className="chat-inline-code">{part}</code>);
            } else {
                elements.push(<span key={i}>{part}</span>);
            }
        });

        return elements;
    };

    const hasApiKey = !!getGeminiApiKey();

    const quickPrompts = [
        "Explain this topic simply",
        "Give me a hint",
        "What's the time complexity?",
        "Common patterns for this?",
    ];

    return (
        <>
            {/* Floating Action Button */}
            <button
                className={`chatbot-fab ${isOpen ? "chatbot-fab--open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "Close AI Tutor" : "Open AI Tutor"}
                aria-label="Toggle AI Tutor"
            >
                <span className="chatbot-fab-icon">
                    {isOpen ? "✕" : "✦"}
                </span>
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="chatbot-panel">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-left">
                            <span className="chatbot-header-icon">✦</span>
                            <div>
                                <h3 className="chatbot-title">AI Tutor</h3>
                                <span className="chatbot-subtitle">Powered by Gemini</span>
                            </div>
                        </div>
                        <button className="chatbot-clear-btn" onClick={clearChat} title="Clear chat">
                            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>delete_sweep</span>
                        </button>
                    </div>

                    {/* Context Badge */}
                    {questionContext && (
                        <div className="chatbot-context">
                            <span className="chatbot-context-icon">📌</span>
                            <span className="chatbot-context-text">
                                {questionContext.question}
                            </span>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {!hasApiKey && messages.length === 0 && (
                            <div className="chatbot-notice">
                                <span className="chatbot-notice-icon">🔑</span>
                                <p>Set your Gemini API key in <strong>Settings</strong> to start chatting.</p>
                            </div>
                        )}

                        {hasApiKey && messages.length === 0 && (
                            <div className="chatbot-welcome">
                                <div className="chatbot-welcome-icon">✦</div>
                                <h4>Hey! I'm your DSA Tutor</h4>
                                <p>Ask me about algorithms, data structures, or any problem you're working on.</p>
                                <div className="chatbot-quick-prompts">
                                    {quickPrompts.map((prompt) => (
                                        <button
                                            key={prompt}
                                            className="chatbot-quick-btn"
                                            onClick={() => {
                                                setInput(prompt);
                                                setTimeout(() => inputRef.current?.focus(), 50);
                                            }}
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`chatbot-msg chatbot-msg--${msg.role}`}
                            >
                                {msg.role === "assistant" && (
                                    <span className="chatbot-msg-avatar">✦</span>
                                )}
                                <div className="chatbot-msg-bubble">
                                    {msg.role === "assistant"
                                        ? renderText(msg.text)
                                        : msg.text}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chatbot-msg chatbot-msg--assistant">
                                <span className="chatbot-msg-avatar">✦</span>
                                <div className="chatbot-msg-bubble chatbot-typing">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chatbot-input-area">
                        <input
                            ref={inputRef}
                            type="text"
                            className="chatbot-input"
                            placeholder={hasApiKey ? "Ask about DSA..." : "Set API key in Settings first"}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={!hasApiKey || isLoading}
                        />
                        <button
                            className="chatbot-send-btn"
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading || !hasApiKey}
                            title="Send"
                        >
                            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>send</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
