"use client";

import { useEffect, useRef, useState } from "react";

export interface Message {
    role: "ai" | "user";
    content: string;
    image?: string | null;
}

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (text: string, image?: string | null) => void;
    isLoading?: boolean;
    onImageUpload?: (file: File) => void;
}

export default function ChatInterface({ messages, onSendMessage, isLoading, onImageUpload }: ChatInterfaceProps) {
    const [input, setInput] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() && !preview) return;

        onSendMessage(input, preview);
        setInput("");
        setPreview(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            if (onImageUpload) onImageUpload(file);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    };

    return (
        <div
            className={`flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden h-[600px] transition-all duration-300 ${isDragging ? "ring-2 ring-[var(--accent-primary)] bg-[var(--accent-glow)]/10" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-glass)] backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-[var(--status-success)] animate-pulse" />
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-[var(--status-success)] animate-ping opacity-75" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--text-primary)] leading-none">Aura AI</h3>
                        <span className="text-[10px] text-[var(--accent-primary)] font-medium tracking-wider uppercase">Online</span>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono">
                    v2.1-turbo
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                        <div
                            className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user"
                                    ? "bg-[var(--accent-primary)] text-white rounded-tr-sm font-medium"
                                    : "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-sm"
                                }`}
                        >
                            {msg.image && (
                                <img
                                    src={msg.image}
                                    alt="Uploaded content"
                                    className="mb-3 rounded-lg max-h-60 w-full object-cover border border-white/20"
                                />
                            )}
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-2 items-center">
                            <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[var(--bg-glass)] border-t border-[var(--border-subtle)] relative z-20">
                {/* Image Preview */}
                {preview && (
                    <div className="mb-3 relative inline-block group">
                        <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-[var(--border-subtle)] shadow-md" />
                        <button
                            onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="absolute -top-2 -right-2 bg-[var(--status-error)] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex gap-3 items-end">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-surface)] rounded-xl transition-colors border border-transparent hover:border-[var(--border-subtle)]"
                        title="Upload Image"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </button>

                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask for recipes, meal plans, or upload ingredients..."
                            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl pl-4 pr-12 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors placeholder-[var(--text-muted)] resize-none h-[48px] max-h-[120px] custom-scrollbar"
                            rows={1}
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() && !preview}
                        className="p-3 bg-[var(--text-primary)] text-[var(--background)] rounded-xl hover:bg-[var(--accent-primary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Drag Overlay */}
            {isDragging && (
                <div className="absolute inset-0 bg-[var(--bg-surface)]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center border-2 border-[var(--accent-primary)] rounded-2xl animate-in fade-in zoom-in duration-200">
                    <div className="text-6xl mb-4 animate-bounce">📂</div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Drop Image Here</h3>
                    <p className="text-[var(--text-muted)]">to analyze ingredients</p>
                </div>
            )}
        </div>
    );
}
