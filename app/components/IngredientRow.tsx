"use client";

import { useToast } from "../context/ToastContext";

interface IngredientProps {
    name: string;
    source?: string;
    price?: string;
    status: "searching" | "found" | "out_of_stock";
}

export default function IngredientRow({ name, source, price, status }: IngredientProps) {
    const { showToast } = useToast();

    const statusColors = {
        searching: "text-[var(--text-muted)]",
        found: "text-[var(--status-success)]",
        out_of_stock: "text-[var(--status-error)]",
    };

    const statusText = {
        searching: "Searching...",
        found: "In Stock",
        out_of_stock: "Out of Stock",
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            showToast(`Added ${name} to cart`, "success");
        } else {
            showToast(`Removed ${name} from cart`, "neutral");
        }
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-colors duration-200 group">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    onChange={handleToggle}
                    className="w-4 h-4 rounded-md border border-[var(--border-subtle)] bg-transparent checked:bg-[var(--accent-primary)] accent-[var(--accent-primary)] cursor-pointer transition-colors duration-200"
                />
                <div>
                    <p className="font-medium text-[var(--text-primary)] text-sm">{name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                        {source || "Locating source..."}
                    </p>
                </div>
            </div>

            <div className="text-right">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{price || "--"}</p>
                <p className={`text-[10px] lowercase tracking-wider font-medium ${statusColors[status]}`}>
                    {statusText[status]}
                </p>
            </div>
        </div>
    );
}
