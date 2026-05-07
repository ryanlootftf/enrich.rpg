"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Game } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const COLOR_ICONS: Record<string, string> = {
  purple: "🎮",
  teal: "🌊",
  coral: "🔥",
  gold: "🌟",
};

const COLOR_KEYS = ["purple", "teal", "coral", "gold"] as const;

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState<string>("purple");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.id) {
      loadGames();
    }
  }, [status, session]);

  async function loadGames() {
    const { data } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setGames(data as Game[]);
    setLoading(false);
  }

  async function createGame() {
    if (!newTitle.trim() || !session?.user?.id) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("games")
      .insert({
        title: newTitle.trim(),
        description: newDesc.trim(),
        theme_color: newColor,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setGames((prev) => [data as Game, ...prev]);
      setShowNewModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewColor("purple");
    }
    setCreating(false);
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="wrap">
        <div className="dash-header">
          <div>
            <div className="dash-title">
              Your Games
              {games.length > 0 && (
                <span style={{ color: "#5f627a", fontSize: 18 }}> · {games.length}</span>
              )}
            </div>
            <div className="dash-sub">Track your goals, earn stars, unlock rewards</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : games.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <div className="empty-state-title">No games yet</div>
            <div className="empty-state-desc">
              Create your first game to start tracking achievements
            </div>
            <button className="btn" onClick={() => setShowNewModal(true)}>
              + New Game
            </button>
          </div>
        ) : (
          <>
            <div className="home-grid">
              {games.map((game) => {
                const pct =
                  game.total_possible_stars > 0
                    ? Math.round(
                        (game.lifetime_stars / game.total_possible_stars) * 100
                      )
                    : 0;
                return (
                  <div
                    key={game.id}
                    className={`game-card ${game.theme_color}`}
                    onClick={() => router.push(`/game/${game.id}`)}
                  >
                    <div className="game-card-top">
                      <div className={`game-icon ${game.theme_color}`}>
                        {COLOR_ICONS[game.theme_color] || "🎮"}
                      </div>
                      <div className="game-pct">
                        {pct}
                        <span>%</span>
                      </div>
                    </div>
                    <div className="game-title">{game.title}</div>
                    {game.description && (
                      <div className="game-desc">{game.description}</div>
                    )}
                    <div className="mini-bar">
                      <div
                        className={`mini-bar-fill ${game.theme_color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="game-meta">
                      <span className="star-count">
                        <span className="star-dot">★</span> {game.lifetime_stars}
                      </span>
                      {pct >= 100 && <span className="badge-pill active">Complete</span>}
                    </div>
                  </div>
                );
              })}

              <div
                className="new-game-card"
                onClick={() => setShowNewModal(true)}
              >
                <div className="new-game-plus">+</div>
                <div className="new-game-label">New Game</div>
              </div>
            </div>
          </>
        )}

        {showNewModal && (
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowNewModal(false);
            }}
          >
            <div className="modal-content">
              <div className="modal-title">Create New Game</div>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#5f627a",
                    marginBottom: 6,
                    display: "block",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 500,
                  }}
                >
                  Game Title
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. Fitness Quest"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#5f627a",
                    marginBottom: 6,
                    display: "block",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 500,
                  }}
                >
                  Description (optional)
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="What's this game about?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#5f627a",
                    marginBottom: 8,
                    display: "block",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 500,
                  }}
                >
                  Theme Color
                </label>
                <div className="color-dots">
                  {COLOR_KEYS.map((c) => (
                    <div
                      key={c}
                      className={`color-dot ${c} ${newColor === c ? "selected" : ""}`}
                      onClick={() => setNewColor(c)}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-ghost"
                  onClick={() => setShowNewModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={createGame}
                  disabled={!newTitle.trim() || creating}
                  style={{ flex: 1 }}
                >
                  {creating ? <div className="spinner" /> : "Create Game"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}