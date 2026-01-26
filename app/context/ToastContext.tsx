"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "neutral" | "error";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "neutral") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`min-w-[200px] p-4 rounded-xl border flex items-center gap-3 shadow-2xl animate-fade-in backdrop-blur-md pointer-events-auto
              ${toast.type === "success"
                                ? "bg-[rgba(0,255,157,0.1)] border-[var(--status-success)] text-[var(--status-success)]"
                                : toast.type === "error"
                                    ? "bg-[rgba(255,51,51,0.1)] border-[var(--status-error)] text-[var(--status-error)]"
                                    : "bg-[var(--bg-glass)] border-[var(--border-active)] text-[var(--text-primary)]"
                            }
            `}
                    >
                        <span className="text-xl">
                            {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
                        </span>
                        <span className="font-medium text-sm">{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
