import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="flex items-center gap-2">
                {/* Logo mark */}
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    A
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">Aura</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-muted-foreground">
                <a href="#features" className="hover:text-primary transition-colors text-sm font-medium">Features</a>
                <a href="#how-it-works" className="hover:text-primary transition-colors text-sm font-medium">How it Works</a>
                <a href="https://github.com/your-repo" className="hover:text-primary transition-colors text-sm font-medium">Github</a>
            </div>

            <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
                Launch App
            </Link>
        </nav>
    );
}
