"use client";

import { useState } from "react";

interface ImageUploaderProps {
    imageSrc: string | null;
    onSampleClick: () => void;
}

export default function ImageUploader({ imageSrc, onSampleClick }: ImageUploaderProps) {
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
        // Logic currently handled by parent sample click for demo
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
            {imageSrc ? (
                <div className="absolute inset-0 w-full h-full bg-black">
                    {/* Using standard img tag for simplicity in prototype, passing raw path */}
                    <img src={imageSrc} alt="Uploaded Fridge" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--accent-primary)]">
                        Analyze Complete
                    </div>
                </div>
            ) : (
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

                    <div className="flex flex-col gap-2 mt-4">
                        <span className="px-4 py-2 rounded-full bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] border border-[var(--border-subtle)]">
                            Supports JPG, PNG, WEBP
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSampleClick(); }}
                            className="mt-2 text-xs text-[var(--accent-primary)] hover:underline z-20"
                        >
                            No image? Try a sample
                        </button>
                    </div>
                </div>
            )}

            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-primary)] to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
        </div>
    );
}
