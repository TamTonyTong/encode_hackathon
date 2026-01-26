"use client";

import { useState } from "react";

export default function ImageUploader() {
    const [isDragging, setIsDragging] = useState(false);

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
        // Logic to handle file drop would go here
        console.log("File dropped");
    };

    return (
        <div
            className={`h-64 glass-panel rounded-2xl border-2 border-dashed flex items-center justify-center transition-all duration-300 cursor-pointer group relative overflow-hidden ${isDragging
                    ? "border-[var(--accent-primary)] bg-[var(--accent-glow)] scale-[1.02]"
                    : "border-[var(--border-active)] hover:border-[var(--accent-primary)]"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="z-10 text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/20">
                    📸
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                    Upload Fridge Photo
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                    Drag & drop or click to browse
                </p>
                <span className="px-4 py-2 rounded-full bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] border border-[var(--border-subtle)]">
                    Supports JPG, PNG, WEBP
                </span>
            </div>

            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-primary)] to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
        </div>
    );
}
