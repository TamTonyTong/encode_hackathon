import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-void)] relative overflow-x-hidden selection:bg-[var(--accent-primary)] selection:text-white">
      <Navbar />

      {/* Background Effects - More subtle now */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-[var(--accent-primary)] opacity-[0.04] blur-[180px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      <div className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">

        {/* Hero Text */}
        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
            <span className="text-xs font-mono text-[var(--accent-primary)] tracking-wide uppercase">AI-POWERED NUTRITION v2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6 text-[var(--text-primary)] text-balance">
            Your Fridge. <br />
            <span className="text-gradient">Fully Optimized.</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
            Stop wondering what to cook. Aura's advanced vision AI scans your ingredients and builds personalized meal plans instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-[var(--accent-primary)] text-white font-bold rounded-xl hover:bg-[var(--accent-primary-hover)] transition-all duration-200 active:scale-95 shadow-lg shadow-[var(--accent-primary)]/20"
            >
              Start Free Trial
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 glass-panel text-[var(--text-primary)] font-medium rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all duration-200"
            >
              See Demo
            </a>
          </div>
        </div>

        {/* Hero Image - Visual Anchor */}
        <div className="flex-1 w-full max-w-lg md:max-w-none relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Image Container with Glow */}
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl shadow-black/50 group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

            {/* Floating UI Card Overlay */}
            <div className="absolute bottom-6 left-6 right-6 z-20 glass-panel p-4 rounded-xl flex items-center gap-4 animate-fade-in border border-[var(--border-subtle)]" style={{ animationDelay: '0.8s' }}>
              <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-lg font-bold">✓</div>
              <div>
                <p className="text-[var(--text-primary)] text-sm font-bold">Analysis Complete</p>
                <p className="text-[var(--text-secondary)] text-xs">Found 12 premium ingredients</p>
              </div>
            </div>

            <img
              src="/sample_fridge.png"
              alt="AI Analysis Demo"
              className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Decorative Elements */}
          <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-[var(--accent-primary)] rounded-full blur-[60px] opacity-20" />
        </div>

      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="relative py-32 px-6 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[var(--text-primary)] text-balance">How It Works</h2>
            <p className="text-[var(--text-secondary)]">Your complete nutrition and shopping assistant.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: "📊", title: "Nutrition Analysis", desc: "Get detailed nutritional insights for every ingredient and meal." },
              { step: "02", icon: "🤖", title: "AI Assistant", desc: "Your personal chef for weekly meal planning and diet goals." },
              { step: "03", icon: "🏷️", title: "Smart Deals", desc: "Find the best prices and store discounts automatically." },
              { step: "04", icon: "🍳", title: "Recipe Discovery", desc: "Unlock creative recipes using what you already have." }
            ].map((item, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all duration-200 group relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 p-4 opacity-25 font-black text-6xl text-[var(--text-muted)]">{item.step}</div>
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </main>
  );
}
