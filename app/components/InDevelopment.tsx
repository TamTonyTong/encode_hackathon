export default function InDevelopment() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
            <div className="w-20 h-20 mb-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-4xl shadow-lg shadow-[var(--accent-glow)]">
                🚧
            </div>
            <h1 className="text-3xl font-bold mb-3 text-[var(--text-primary)]">In Development</h1>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                This module is currently being built by our engineering team.
                Check back soon for updates.
            </p>
        </div>
    );
}
