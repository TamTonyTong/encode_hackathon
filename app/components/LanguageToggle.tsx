
"use client";

import { useLanguage } from "../context/LanguageContext";

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex bg-[var(--bg-surface)] rounded-lg p-1 border border-[var(--border-subtle)]">
            <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    language === 'en' 
                    ? 'bg-[var(--text-primary)] text-black' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage('vi')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    language === 'vi' 
                    ? 'bg-[var(--text-primary)] text-black' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
                VI
            </button>
        </div>
    );
}
