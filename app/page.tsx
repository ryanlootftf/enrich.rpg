"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  useEffect(() => {
    // Scroll-triggered fade-up animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      {/* Rainbow top bar */}
      <div className="top-bar" />

      {/* Sticky nav */}
      <nav className="landing-nav">
        <span className="nav-logo">Enrich.rpg</span>
        <ul className="flex items-center gap-6 md:gap-10 list-none">
          {["Features", "AI", "Rewards"].map((label) => (
            <li key={label}>
              <a href={`#${label.toLowerCase()}`}>{label}</a>
            </li>
          ))}
          <li>
            <button onClick={handleGoogleLogin} className="btn-primary">
              Sign In
            </button>
          </li>
        </ul>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-glow-2" />
        <p className="hero-eyebrow fade-up">A gamified habit tracker</p>
        <h1 className="hero-title fade-up" style={{ transitionDelay: "0.08s" }}>
          <span className="word-enrich">Enrich</span>
          .rpg
        </h1>
        <p className="hero-sub fade-up" style={{ transitionDelay: "0.14s" }}>
          Turn self-improvement into an epic RPG quest. Create games, complete
          quests, and earn real rewards.
        </p>
        <div className="hero-cta fade-up" style={{ transitionDelay: "0.2s" }}>
          <button onClick={handleGoogleLogin} className="btn-primary">
            Start Your Quest
          </button>
          <a href="#features" className="btn-ghost">
            How It Works
          </a>
        </div>
        <div className="scroll-hint">
          <span>Scroll</span>
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <div className="landing-divider" />
      <section id="features" className="landing-section">
        <p className="section-label fade-up">How It Works</p>
        <h2 className="section-title fade-up" style={{ transitionDelay: "0.08s" }}>
          Three steps to your best self
        </h2>
        <p className="section-sub fade-up" style={{ transitionDelay: "0.14s" }}>
          Define your goals as games, break them into quests, and celebrate with
          rewards you actually want.
        </p>
        <div className="features-grid">
          {[
            {
              icon: "🎮",
              bg: "icon-purple",
              title: "Create Games",
              desc: "Name your journey — Health, Learning, Creativity — and add a description. The AI fills in the rest.",
            },
            {
              icon: "⚔️",
              bg: "icon-gold",
              title: "Complete Quests",
              desc: "AI-generated quests tailored to your game. Check them off, earn stars, and track your progress.",
            },
            {
              icon: "🏆",
              bg: "icon-orange",
              title: "Earn Rewards",
              desc: "Set meaningful rewards for yourself — a fancy coffee, a new book, a weekend getaway — and unlock them with stars.",
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="feature-card fade-up"
              style={{ transitionDelay: `${0.1 + i * 0.06}s` }}
            >
              <div className="feature-icon-wrapper">{feature.icon}</div>
              <div className="font-syne text-base font-semibold text-text-primary mb-2.5 tracking-[0.02em]">
                {feature.title}
              </div>
              <div className="text-sm md:text-[0.95rem] leading-relaxed font-light text-text-muted">
                {feature.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== YOUR GAMES / TRACKS ===== */}
      <div className="landing-divider" />
      <div className="preview-section">
        <div className="max-w-[1100px] mx-auto px-8">
          <p className="section-label fade-up">Your Games</p>
          <h2 className="section-title fade-up" style={{ transitionDelay: "0.08s" }}>
            Tracks for every part of your life
          </h2>
          <p className="section-sub fade-up" style={{ transitionDelay: "0.14s" }}>
            Organize your goals into themed games, each with its own set of
            quests and progress.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { icon: "🏃", label: "Health", sub: "Fitness & wellness" },
              { icon: "📚", label: "Learning", sub: "Skills & knowledge" },
              { icon: "🎨", label: "Creativity", sub: "Art & expression" },
              { icon: "✨", label: "Custom", sub: "Your own path" },
            ].map((track, i) => (
              <div
                key={track.label}
                className="track-pill fade-up"
                style={{ transitionDelay: `${0.15 + i * 0.05}s` }}
              >
                <div className="track-icon">{track.icon}</div>
                <div>
                  <div className="track-name">{track.label}</div>
                  <div className="track-sub">{track.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* App mockup: quest cards */}
          <div className="bg-[#141418] border border-[rgba(255,255,255,0.07)] rounded-[18px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.4)] fade-up">
            {/* Mockup nav */}
            <div className="flex items-center justify-between px-5 md:px-6 py-3.5 border-b border-[rgba(255,255,255,0.07)] bg-[rgba(10,10,13,0.8)]">
              <span className="font-syne text-sm font-bold bg-gold-gradient bg-clip-text text-transparent">
                Enrich.rpg
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[0.7rem] px-3 py-1 rounded-full font-syne font-semibold tracking-wider bg-purple/15 text-purple border border-purple/30">
                  Games
                </span>
                <div className="w-[30px] h-[30px] rounded-full bg-gold-gradient flex items-center justify-center font-syne font-bold text-[0.7rem] text-[#1a1000]">
                  R
                </div>
              </div>
            </div>

            {/* Mockup body */}
            <div className="p-6 md:p-10">
              <p className="font-syne text-[0.6rem] tracking-[0.3em] uppercase text-text-dim mb-4">
                Active Quests
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: "☀️",
                    pct: "64%",
                    title: "Morning Routine",
                    desc: "Wake up, hydrate, stretch...",
                    bar: "w-[64%]",
                    barColor: "bg-gold",
                    stars: "★ 12",
                  },
                  {
                    icon: "🧠",
                    pct: "19%",
                    title: "Deep Focus",
                    desc: "Complete 3 pomodoro sessions...",
                    bar: "w-[19%]",
                    barColor: "bg-coral",
                    stars: "★ 3",
                  },
                  {
                    icon: "📖",
                    pct: "0%",
                    title: "Read 20 Pages Daily",
                    desc: "Build a daily reading habit...",
                    bar: "w-0",
                    barColor: "bg-gold",
                    stars: "★ 0",
                    empty: true,
                  },
                ].map((quest) => (
                  <div
                    key={quest.title}
                    className="bg-[#1a1a20] border border-[rgba(255,255,255,0.07)] rounded-xl p-5 relative overflow-hidden"
                  >
                    {/* Top accent bar */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${quest.icon === "☀️" ? "from-[#c49454] to-transparent" : "from-[#e07040] to-transparent"}`}
                    />
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple/15 flex items-center justify-center text-sm">
                        {quest.icon}
                      </div>
                      <div className="font-syne text-sm text-text-muted flex items-center gap-0.5">
                        <span className="text-text-primary font-semibold">{quest.pct}</span>
                        <span className="text-[0.6rem]">%</span>
                      </div>
                    </div>
                    <div className="font-syne text-sm font-semibold text-text-primary mb-1">
                      {quest.title}
                    </div>
                    <div className="text-xs text-text-muted font-light mb-3">
                      {quest.desc}
                    </div>
                    <div className="h-1 bg-[rgba(255,255,255,0.07)] rounded-sm overflow-hidden mb-3">
                      <div className={`h-full rounded-sm ${quest.barColor} ${quest.bar}`} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span className="text-gold font-semibold">{quest.stars}</span>
                      <span
                        className={`text-[0.6rem] font-syne tracking-wider px-2 py-0.5 rounded-full ${
                          quest.empty
                            ? "bg-white/5 text-text-dim border border-[rgba(255,255,255,0.07)]"
                            : "bg-green/15 text-green border border-green/30"
                        }`}
                      >
                        {quest.empty ? "Empty" : "Active"}
                      </span>
                    </div>
                  </div>
                ))}

                {/* New quest card */}
                <div className="bg-white/[0.02] border border-dashed border-[rgba(255,255,255,0.07)] rounded-xl flex flex-col items-center justify-center gap-2 p-6 cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center text-purple text-base">
                    +
                  </div>
                  <span className="text-xs text-text-dim italic">New Quest</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== AI QUEST GENERATION ===== */}
      <div className="landing-divider" />
      <section id="ai" className="landing-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* AI Modal mockup */}
          <div className="fade-up relative">
            <div className="bg-[#1c1c24] border border-[rgba(255,255,255,0.1)] rounded-[18px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] max-w-[420px] mx-auto">
              {/* Modal header */}
              <div className="pt-5 px-5 pb-2">
                <p className="font-syne text-[0.6rem] tracking-[0.2em] uppercase text-purple mb-1.5">
                  AI Generate
                </p>
                <div className="flex items-center justify-between">
                  <h3 className="font-syne text-lg font-bold text-text-primary">
                    Deep Focus Mode
                  </h3>
                  <div className="w-[26px] h-[26px] rounded-full bg-white/[0.06] border border-border-subtle flex items-center justify-center text-xs text-text-muted">
                    ✕
                  </div>
                </div>
                <p className="text-sm text-text-muted mt-2.5 mb-4 leading-relaxed font-light">
                  AI generates quests based on your game's title and description.
                  Toggle to select the ones you want, then confirm to add them.
                  Total stars target: ~100 ★.
                </p>
              </div>

              {/* Quest list */}
              <div className="px-5 flex flex-col gap-2">
                {[
                  {
                    title: "Complete 3 Pomodoro Sessions Daily",
                    desc: "Log each 25-minute deep work session with no distra...",
                    diff: "🌱 Easy · 3 steps",
                    stars: "+1 ★",
                  },
                  {
                    title: "No Phone Before 10am — 5 Days",
                    desc: "Keep your phone face-down until after your first work...",
                    diff: "🌱 Easy · 2 steps",
                    stars: "+2 ★",
                  },
                  {
                    title: "Finish One Backlog Task This Week",
                    desc: "Pick a task you've been avoiding and complete it in...",
                    diff: "⚡ Medium · 4 steps",
                    stars: "+3 ★",
                    medium: true,
                  },
                  {
                    title: "Block Distracting Sites for 2 Hours",
                    desc: "Use a site blocker during your peak focus window on...",
                    diff: "⚡ Medium · 3 steps",
                    stars: "+3 ★",
                    medium: true,
                  },
                  {
                    title: "Write a Weekly Progress Journal",
                    desc: "Spend 10 minutes reflecting on what you accomplished...",
                    diff: "⚡ Medium · 2 steps",
                    stars: "+2 ★",
                    faded: true,
                  },
                ].map((quest) => (
                  <div
                    key={quest.title}
                    className={`flex items-start gap-3 p-3 bg-white/[0.03] border border-white/[0.08] rounded-[10px] ${
                      quest.faded ? "opacity-50" : ""
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-purple flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-[0.6rem]">✓</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-syne text-sm font-semibold text-text-primary mb-0.5">
                        {quest.title}
                      </div>
                      <div className="text-xs text-text-muted truncate">{quest.desc}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[0.65rem]">
                          {quest.diff.split("·")[0].trim()}
                        </span>
                        <span className="text-[0.65rem] text-text-dim">
                          · {quest.diff.split("·").slice(1).join("·").trim()}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gold font-semibold flex-shrink-0">
                      {quest.stars}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer bar */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.07] mt-4">
                <div className="text-xs text-text-muted">
                  <span className="text-text-primary font-semibold">24 selected</span>
                  &nbsp;·&nbsp;
                  <span className="text-green font-semibold">+98/100 ★</span>
                </div>
                <button className="bg-purple border-none text-white px-5 py-2 rounded-lg font-syne text-xs font-semibold tracking-wide cursor-pointer">
                  Add to quests
                </button>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-[radial-gradient(ellipse,rgba(155,127,212,0.07)_0%,transparent_70%)] pointer-events-none -z-10" />
          </div>

          {/* Text side */}
          <div className="fade-up" style={{ transitionDelay: "0.15s" }}>
            <p className="section-label text-left">Powered by AI</p>
            <h2 className="section-title text-left">
              Your game, your quests — generated by AI
            </h2>
            <p className="text-left text-text-muted text-base md:text-lg font-light italic mb-6 max-w-[540px]">
              Give your game a title and a description —{" "}
              <em>
                &ldquo;Health Track: a journey to build better daily habits&rdquo;
              </em>{" "}
              — and the AI reads it, understands your intent, and generates a full
              set of quests that actually match what you're trying to achieve.
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {[
                "Quests are generated from your game's title and description — the more specific you write, the better they get",
                "Each quest comes with a difficulty rating and balanced star values targeting ~100 ★",
                "Toggle the ones you want, skip the rest, then add them all in one click",
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold/15 border border-glow flex items-center justify-center text-[0.65rem] text-gold flex-shrink-0 mt-0.5">
                    ✦
                  </div>
                  <p className="text-sm md:text-[0.9rem] text-text-muted font-light leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
            <button onClick={handleGoogleLogin} className="btn-primary">
              Try the Quest Forge
            </button>
          </div>
        </div>
      </section>

      {/* ===== REWARDS ===== */}
      <div className="landing-divider" />
      <section id="rewards" className="landing-section">
        <div className="rewards-grid">
          <div className="rewards-text">
            <p className="section-label text-left fade-up">The spoils of victory</p>
            <h2 className="section-title text-left fade-up" style={{ transitionDelay: "0.08s" }}>
              Real rewards for real progress
            </h2>
            <p className="text-left text-text-muted text-base md:text-lg font-light italic mb-8 fade-up" style={{ transitionDelay: "0.14s" }}>
              Define what victory looks like for you. Then earn it, one star at a
              time.
            </p>
            <button
              onClick={handleGoogleLogin}
              className="btn-primary fade-up"
              style={{ transitionDelay: "0.2s" }}
            >
              Set your first reward
            </button>
          </div>

          <div className="bg-[#141418] border border-[rgba(255,255,255,0.07)] rounded-[18px] overflow-hidden fade-up" style={{ transitionDelay: "0.15s" }}>
            {[
              { emoji: "☕", name: "Fancy Coffee Run", stars: "✦ 1 star", claimed: true },
              { emoji: "🎧", name: "New Playlist Binge", stars: "✦ 10 stars", claimed: true },
              { emoji: "🍣", name: "Omakase Dinner Night", stars: "✦ 25 stars", locked: true },
              { emoji: "✈️", name: "Weekend Getaway", stars: "✦ 50 stars", locked: true },
              { emoji: "🎁", name: "Set 100 ★ reward...", stars: "✦ 100 stars — final reward", locked: true, dashed: true },
            ].map((reward) => (
              <div
                key={reward.name}
                className={`reward-row ${reward.dashed ? "border-dashed opacity-60" : ""}`}
              >
                <div className="reward-emoji">{reward.emoji}</div>
                <div className="reward-info">
                  <div className="reward-name">{reward.name}</div>
                  <div className="reward-stars">{reward.stars}</div>
                </div>
                <div className={`reward-status ${reward.claimed ? "rs-claimed" : "rs-locked"}`}>
                  {reward.claimed ? "Claimed" : reward.dashed ? "Set" : "Locked"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <div className="landing-divider" />
      <div className="cta-section" id="cta">
        <div className="cta-glow" />
        <p className="section-label fade-up">Your epic quest begins here</p>
        <h2 className="section-title fade-up" style={{ transitionDelay: "0.08s" }}>
          Ready to level up your life?
        </h2>
        <p className="section-sub fade-up" style={{ transitionDelay: "0.14s" }}>
          Join adventurers who are turning everyday habits into legendary
          progress.
        </p>
        <div className="fade-up" style={{ transitionDelay: "0.2s" }}>
          <button onClick={handleGoogleLogin} className="google-btn">
            <svg
              className="google-g"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
          <p className="cta-footnote">Free to start. No credit card required.</p>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="landing-divider" />
      <footer className="landing-footer">
        <div className="footer-logo">Enrich.rpg</div>
        <div className="footer-tagline">Gamify your growth.</div>
        <div className="text-xs text-text-dim">© 2026 Enrich.rpg</div>
      </footer>
    </div>
  );
}