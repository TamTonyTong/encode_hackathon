import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent-primary)] opacity-[0.08] blur-[120px] rounded-full mix-blend-screen animate-fade-in" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--status-success)] opacity-[0.05] blur-[120px] rounded-full mix-blend-screen animate-fade-in" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="z-10 flex flex-col items-center text-center px-4 max-w-5xl w-full">
        {/* Badge */}
        <div className="mb-6 px-4 py-1.5 rounded-full glass-panel border border-[var(--border-subtle)] animate-fade-in">
          <span className="text-xs uppercase tracking-widest text-[var(--accent-primary)] font-semibold">
            v2.0 Beta Now Live
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Eat Smart. <br />
          <span className="text-gradient">Live Better.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-12 animate-fade-in leading-relaxed" style={{ animationDelay: "0.2s" }}>
          Your personal AI nutritionist. Snap a photo of your fridge, input your goals,
          and let our neural engine build the perfect meal plan and grocery list for you.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-void)] font-bold rounded-lg hover:bg-[var(--accent-primary)] transition-colors duration-300 shadow-lg shadow-white/5"
          >
            Launch App
          </Link>
          <a
            href="#features"
            className="px-8 py-4 glass-panel text-[var(--text-primary)] font-medium rounded-lg hover:border-[var(--text-secondary)] transition-colors duration-300"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Feature Grid Mockup (Visual Only) */}
      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4 z-10 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        {[
          { title: "Visual Recognition", desc: "Upload food pics. We identify ingredients instantly via Vision AI." },
          { title: "Macro Precision", desc: "Tailored to your protein, calorie, and taste requirements." },
          { title: "Smart Sourcing", desc: "We find the best groceries near you via API integration." }
        ].map((feature, i) => (
          <div key={i} className="glass-panel p-8 rounded-2xl hover-glow">
            <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">{feature.title}</h3>
            <p className="text-[var(--text-muted)] text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
