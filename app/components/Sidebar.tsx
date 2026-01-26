import Link from "next/link";

export default function Sidebar() {
    const menuItems = [
        { name: "Meal Plan", icon: "🍱", href: "/dashboard" },
        { name: "Pantry", icon: "🥫", href: "/dashboard/pantry" },
        { name: "Grocery", icon: "🛒", href: "/dashboard/grocery" },
        { name: "Profile", icon: "👤", href: "/dashboard/profile" },
    ];

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 border-r border-[var(--border-subtle)] bg-[var(--bg-glass)] backdrop-blur-md flex flex-col pt-8 z-20">
            <div className="px-6 mb-10">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-[var(--text-primary)]">
                    Aura<span className="text-[var(--accent-primary)]">.</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-all duration-200 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 mt-auto">
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <p className="text-xs text-[var(--text-muted)] mb-2">Credits Remaining</p>
                    <div className="w-full h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                        <div className="w-[70%] h-full bg-[var(--accent-primary)]" />
                    </div>
                </div>
            </div>
        </aside>
    );
}
