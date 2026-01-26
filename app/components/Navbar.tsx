import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-lg border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
                {/* Logo mark */}
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-black font-bold text-lg">
                    A
                </div>
                <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Aura</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-[var(--text-secondary)]">
                <a href="#features" className="hover:text-[var(--text-primary)] transition-colors text-sm font-medium">Features</a>
                <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors text-sm font-medium">How it Works</a>
                <a href="https://github.com/your-repo" className="hover:text-[var(--text-primary)] transition-colors text-sm font-medium">Github</a>
            </div>

            <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-[var(--text-primary)] text-black text-sm font-bold rounded-lg hover:bg-[var(--accent-primary)] transition-colors"
            >
                Launch App
            </Link>
        </nav>
    );
}
