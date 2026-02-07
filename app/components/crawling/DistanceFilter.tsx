
"use client";

import { useLanguage } from "../../context/LanguageContext";

interface DistanceFilterProps {
    value: number;
    onChange: (value: number) => void;
}

export default function DistanceFilter({ value, onChange }: DistanceFilterProps) {
    const { t } = useLanguage();

    return (
        <div className="flex items-center gap-4 bg-[var(--bg-surface)] px-4 py-2 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-sm font-medium text-[var(--text-secondary)]">{t("grocery.distance")}:</span>
            <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-32 h-1 bg-[var(--border-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)] focus:outline-none"
            />
            <span className="text-sm font-bold text-[var(--accent-primary)] min-w-[3rem]">
                {value} km
            </span>
        </div>
    );
}
