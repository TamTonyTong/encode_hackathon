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
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors group">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    onChange={handleToggle}
                    className="w-4 h-4 rounded border-[var(--border-subtle)] bg-transparent checked:bg-[var(--accent-primary)] accent-[var(--accent-primary)] cursor-pointer"
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
                <p className={`text-[10px] lowercase tracking-wider ${statusColors[status]}`}>
                    {statusText[status]}
                </p>
            </div>
        </div>
    );
}
