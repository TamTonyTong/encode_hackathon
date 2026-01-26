"use client";

import { useEffect, useRef, useState } from "react";

export interface Message {
    role: "ai" | "user";
    content: string;
}

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
}

export default function ChatInterface({ messages, onSendMessage }: ChatInterfaceProps) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput("");
    };

    return (
        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-glass)]">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
                    <span className="font-semibold text-[var(--text-primary)]">Aura AI</span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">v2.0 Model</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed animate-fade-in ${msg.role === "user"
                                    ? "bg-[var(--accent-primary)] text-black rounded-tr-sm font-medium"
                                    : "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-sm"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[var(--bg-glass)] border-t border-[var(--border-subtle)]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your requirements..."
                        className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors placeholder-[var(--text-muted)]"
                    />
                    <button
                        onClick={handleSend}
                        className="p-3 bg-[var(--text-primary)] rounded-xl hover:bg-[var(--accent-primary)] transition-colors duration-200"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
