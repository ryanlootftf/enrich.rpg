"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/client";
import { Game, Achievement, Reward, CompletionLog, AiGeneratedAchievement } from "@/lib/types";

const COLOR_ICONS: Record<string, string> = {
  purple: "🎮",
  teal: "🌊",
  coral: "🔥",
  gold: "🌟",
};

export default function GameDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const [game, setGame] = useState<Game | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [completionLogs, setCompletionLogs] = useState<CompletionLog[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGoal, setAiGoal] = useState("");
  const [aiStyle, setAiStyle] = useState("balanced");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResults, setAiResults] = useState<AiGeneratedAchievement[]>([]);
  const [aiSelected, setAiSelected] = useState<Set<number>>(new Set());

  // New Achievement / Reward modals
  const [showNewAchieve, setShowNewAchieve] = useState(false);
  const [newAchieveTitle, setNewAchieveTitle] = useState("");
  const [newAchieveDiff, setNewAchieveDiff] = useState<"easy" | "medium" | "hard">("medium");
  const [newAchieveStars, setNewAchieveStars] = useState(12);
  const [newAchieveRepeatable, setNewAchieveRepeatable] = useState(false);

  const [showNewReward, setShowNewReward] = useState(false);
  const [newRewardTitle, setNewRewardTitle] = useState("");
  const [newRewardIcon, setNewRewardIcon] = useState("🎁");
  const [newRewardStars, setNewRewardStars] = useState(50);
  const [newRewardIsBonus, setNewRewardIsBonus] = useState(false);
  const [newRewardIsFinal, setNewRewardIsFinal] = useState(false);

  const [loadedAt, setLoadedAt] = useState(0);

  const gameId = params.id as string;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      loadData();
    }
  }, [status, loadedAt]);

  async function loadData() {
    setLoading(true);
    const [gameRes, achieveRes, rewardRes, logsRes] = await Promise.all([
      supabase.from("games").select("*").eq("id", gameId).single(),
      supabase.from("achievements").select("*").eq("game_id", gameId).order("created_at", { ascending: true }),
      supabase.from("rewards").select("*").eq("game_id", gameId).order("required_stars", { ascending: true }),
      supabase.from("completion_logs").select("*").eq("game_id", gameId).order("completed_at", { ascending: false }),
    ]);

    if (gameRes.data) setGame(gameRes.data as Game);
    if (achieveRes.data) setAchievements(achieveRes.data as Achievement[]);
    if (rewardRes.data) setRewards(rewardRes.data as Reward[]);
    if (logsRes.data) setCompletionLogs(logsRes.data as CompletionLog[]);
    setLoading(false);
  }

  function refresh() {
    setLoadedAt(Date.now());
  }

  // Stars & progress
  const completedAchievements = achievements.filter((a) => a.completed);
  const completedStars = completionLogs.reduce((sum, l) => sum + l.stars_earned, 0);
  const totalPossibleStars = achievements.reduce(
    (sum, a) => sum + (a.repeatable ? 0 : a.stars_rewarded),
    0
  );
  const progressPct = totalPossibleStars > 0 ? Math.round((completedStars / totalPossibleStars) * 100) : 0;
  const mainTrackRewards = rewards.filter((r) => r.type === "MAIN_TRACK");
  const bonusTrackRewards = rewards.filter((r) => r.type === "BONUS_TRACK");
  const claimedRewards = rewards.filter((r) => r.claimed).length;
  const nextReward = rewards.find((r) => !r.claimed && r.type === "MAIN_TRACK");

  // Achievement CRUD
  async function toggleAchievement(achievement: Achievement) {
    const nowCompleted = !achievement.completed;
    const stars = achievement.stars_rewarded;

    if (nowCompleted) {
      // Insert completion log
      await supabase.from("completion_logs").insert({
        achievement_id: achievement.id,
        game_id: gameId,
        stars_earned: stars,
      });
      // Mark achievement as completed
      await supabase
        .from("achievements")
        .update({ completed: true })
        .eq("id", achievement.id);
      // Update game lifetime stars
      await supabase
        .from("games")
        .update({
          lifetime_stars: (game?.lifetime_stars || 0) + stars,
          total_possible_stars: (totalPossibleStars || 1),
        })
        .eq("id", gameId);
    } else {
      // Remove last completion log for this achievement
      const logToDelete = completionLogs.find((l) => l.achievement_id === achievement.id);
      if (logToDelete) {
        await supabase.from("completion_logs").delete().eq("id", logToDelete.id);
      }
      await supabase
        .from("achievements")
        .update({ completed: false })
        .eq("id", achievement.id);
      await supabase
        .from("games")
        .update({
          lifetime_stars: Math.max(0, (game?.lifetime_stars || 0) - stars),
        })
        .eq("id", gameId);
    }
    refresh();
  }

  async function deleteAchievement(id: string) {
    await supabase.from("completion_logs").delete().eq("achievement_id", id);
    await supabase.from("achievements").delete().eq("id", id);
    refresh();
  }

  async function createAchievement() {
    if (!newAchieveTitle.trim()) return;
    await supabase.from("achievements").insert({
      game_id: gameId,
      title: newAchieveTitle.trim(),
      difficulty: newAchieveDiff,
      stars_rewarded: newAchieveStars,
      repeatable: newAchieveRepeatable,
    });
    setShowNewAchieve(false);
    setNewAchieveTitle("");
    setNewAchieveDiff("medium");
    setNewAchieveStars(12);
    setNewAchieveRepeatable(false);
    refresh();
  }

  // Reward CRUD
  async function claimReward(reward: Reward) {
    await supabase
      .from("rewards")
      .update({ claimed: !reward.claimed })
      .eq("id", reward.id);
    refresh();
  }

  async function deleteReward(id: string) {
    await supabase.from("rewards").delete().eq("id", id);
    refresh();
  }

  async function createReward() {
    if (!newRewardTitle.trim()) return;
    await supabase.from("rewards").insert({
      game_id: gameId,
      title: newRewardTitle.trim(),
      icon: newRewardIcon,
      required_stars: newRewardStars,
      type: newRewardIsBonus ? "BONUS_TRACK" : "MAIN_TRACK",
      is_final: newRewardIsFinal,
    });
    setShowNewReward(false);
    setNewRewardTitle("");
    setNewRewardIcon("🎁");
    setNewRewardStars(50);
    setNewRewardIsBonus(false);
    setNewRewardIsFinal(false);
    refresh();
  }

  // AI Generation
  async function generateAchievements() {
    if (!aiGoal.trim()) return;
    setAiGenerating(true);
    setAiResults([]);
    setAiSelected(new Set());

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: aiGoal, style: aiStyle }),
      });
      const data = await res.json();
      if (data.achievements) {
        setAiResults(data.achievements);
        // Pre-select all
        setAiSelected(new Set(data.achievements.map((_: any, i: number) => i)));
      }
    } catch (e) {
      console.error(e);
    }
    setAiGenerating(false);
  }

  async function addSelectedAchievements() {
    const selected = aiResults.filter((_, i) => aiSelected.has(i));
    if (selected.length === 0) return;

    const inserts = selected.map((a) => ({
      game_id: gameId,
      title: a.title,
      difficulty: a.difficulty,
      stars_rewarded: a.stars_rewarded,
    }));

    await supabase.from("achievements").insert(inserts);
    setShowAiModal(false);
    setAiGoal("");
    setAiResults([]);
    setAiSelected(new Set());
    refresh();
  }

  function toggleAiSelect(idx: number) {
    setAiSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="wrap" style={{ textAlign: "center", padding: 48 }}>
          <div className="spinner" style={{ margin: "0 auto" }} />
        </div>
      </>
    );
  }

  if (!game) {
    return (
      <>
        <NavBar />
        <div className="wrap">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Game not found</div>
            <Link href="/" className="btn" style={{ textDecoration: "none" }}>
              Back to Games
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="wrap">
        {/* Header */}
        <div className="screen-title-bar">
          <Link href="/" className="back-btn">
            ←
          </Link>
          <div>
            <div className="screen-title-text">{game.title}</div>
            {game.description && (
              <div style={{ fontSize: 12, color: "#5f627a", marginTop: 1 }}>
                {game.description}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Stars</div>
            <div className="stat-value gold">{completedStars}</div>
            <div className="stat-sub">earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Achievements</div>
            <div className="stat-value">
              {completedAchievements.length}
              <span style={{ fontSize: 14, color: "#5f627a" }}>
                /{achievements.length}
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rewards</div>
            <div className="stat-value">
              {claimedRewards}
              <span style={{ fontSize: 14, color: "#5f627a" }}>
                /{rewards.length}
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Progress</div>
            <div className="stat-value" style={{ color: "#a08bff" }}>
              {progressPct}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-section">
          <div className="progress-label-row">
            <span className="progress-title">Overall Progress</span>
            <span className="progress-pct">{progressPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          {mainTrackRewards.length > 0 && (
            <div className="milestone-row">
              {mainTrackRewards.map((r) => {
                const done = completedStars >= r.required_stars;
                const isNext = !r.claimed && r.id === nextReward?.id;
                return (
                  <div className="milestone" key={r.id}>
                    <div
                      className={`milestone-dot ${done ? "done" : isNext ? "next" : ""}`}
                    />
                    <span>{r.required_stars}★</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button className="btn" onClick={() => setShowAiModal(true)}>
            ✨ AI Generate
          </button>
          <button className="btn-ghost" onClick={() => setShowNewAchieve(true)}>
            + Achievement
          </button>
          <button className="btn-ghost" onClick={() => setShowNewReward(true)}>
            + Reward
          </button>
        </div>

        {/* Two Column: Achievements & Main Track */}
        <div className="two-col">
          {/* Achievements */}
          <div>
            <div className="section-label">Achievements</div>
            {achievements.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px 12px" }}>
                <div className="empty-state-icon">🏆</div>
                <div className="empty-state-title" style={{ fontSize: 14 }}>
                  No achievements yet
                </div>
                <div className="empty-state-desc" style={{ fontSize: 12 }}>
                  Use AI to generate some or add manually
                </div>
              </div>
            ) : (
              <div className="achieve-list">
                {achievements.map((a) => (
                  <div key={a.id} className={`achieve-item ${a.completed ? "done" : ""}`}>
                    <div
                      className={`achieve-check ${a.completed ? "done" : ""}`}
                      onClick={() => toggleAchievement(a)}
                    >
                      {a.completed ? "✓" : ""}
                    </div>
                    <div className="achieve-info">
                      <div className={`achieve-name ${a.completed ? "done" : ""}`}>
                        {a.title}
                      </div>
                      <div className={`achieve-diff diff-${a.difficulty}`}>
                        {a.difficulty}
                        {a.repeatable ? " · repeatable" : ""}
                      </div>
                    </div>
                    <span className="achieve-stars">★{a.stars_rewarded}</span>
                    <button
                      onClick={() => deleteAchievement(a.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#5f627a",
                        cursor: "pointer",
                        fontSize: 14,
                        padding: "2px",
                        opacity: 0.5,
                      }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reward Main Track */}
          <div>
            <div className="section-label">Reward Track</div>
            {mainTrackRewards.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px 12px" }}>
                <div className="empty-state-icon">🎁</div>
                <div className="empty-state-title" style={{ fontSize: 14 }}>
                  No rewards yet
                </div>
                <div className="empty-state-desc" style={{ fontSize: 12 }}>
                  Add rewards to motivate yourself
                </div>
              </div>
            ) : (
              <div className="reward-track">
                {mainTrackRewards.map((r) => {
                  const canClaim = completedStars >= r.required_stars && !r.claimed;
                  const isNext = !r.claimed && r.id === nextReward?.id;
                  return (
                    <div
                      key={r.id}
                      className={`reward-item ${r.claimed ? "claimed" : isNext ? "next" : ""}`}
                    >
                      <div className="reward-star-badge">{r.icon}</div>
                      <div className="reward-info">
                        <div className="reward-name">{r.title}</div>
                        <div className="reward-req">{r.required_stars} stars needed</div>
                      </div>
                      {r.claimed ? (
                        <span className="reward-status status-claimed">Claimed</span>
                      ) : canClaim ? (
                        <span
                          className="reward-status status-next"
                          onClick={() => claimReward(r)}
                          style={{ cursor: "pointer" }}
                        >
                          Claim
                        </span>
                      ) : (
                        <span className="reward-status status-locked">Locked</span>
                      )}
                      <button
                        onClick={() => deleteReward(r.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#5f627a",
                          cursor: "pointer",
                          fontSize: 14,
                          padding: "2px",
                          opacity: 0.5,
                        }}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bonus Track */}
        {bonusTrackRewards.length > 0 && (
          <>
            <div className="divider-label">Bonus Track</div>
            <div className="bonus-banner">
              <div className="bonus-icon">⭐</div>
              <div className="bonus-info">
                <div className="bonus-title">Bonus Rewards</div>
                <div className="bonus-sub">
                  Go above and beyond for extra rewards
                </div>
              </div>
              <div className="bonus-progress-mini">
                {bonusTrackRewards.filter((r) => r.claimed).length}
                <span>/{bonusTrackRewards.length}</span>
              </div>
            </div>
            <div className="reward-track">
              {bonusTrackRewards.map((r) => {
                const canClaim = completedStars >= r.required_stars && !r.claimed;
                return (
                  <div
                    key={r.id}
                    className={`reward-item bonus ${r.claimed ? "claimed" : ""}`}
                  >
                    <div className="reward-star-badge">{r.icon}</div>
                    <div className="reward-info">
                      <div className="reward-name">{r.title}</div>
                      <div className="reward-req">{r.required_stars} stars needed</div>
                    </div>
                    {r.claimed ? (
                      <span className="reward-status status-claimed">Claimed</span>
                    ) : canClaim ? (
                      <span
                        className="reward-status status-bonus"
                        onClick={() => claimReward(r)}
                        style={{ cursor: "pointer" }}
                      >
                        Claim
                      </span>
                    ) : (
                      <span className="reward-status status-locked">Locked</span>
                    )}
                    <button
                      onClick={() => deleteReward(r.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#5f627a",
                        cursor: "pointer",
                        fontSize: 14,
                        padding: "2px",
                        opacity: 0.5,
                      }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* AI Modal */}
        {showAiModal && (
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAiModal(false);
            }}
          >
            <div className="modal-content">
              <div className="modal-title">✨ AI Achievement Generator</div>
              <div style={{ fontSize: 13, color: "#9497b0", marginBottom: 16 }}>
                Describe your goal and let AI generate achievements for you.
              </div>

              <div className="ai-input-wrap">
                <input
                  placeholder="e.g. Learn Spanish, get fit, read more..."
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                />
              </div>

              <div className="chip-row">
                {["balanced", "easy", "hard"].map((s) => (
                  <div
                    key={s}
                    className={`chip ${aiStyle === s ? "active" : ""}`}
                    onClick={() => setAiStyle(s)}
                  >
                    {s === "balanced" ? "Balanced" : s === "easy" ? "Easy Focus" : "Hard Focus"}
                  </div>
                ))}
              </div>

              <button
                className="ai-gen-btn"
                onClick={generateAchievements}
                disabled={aiGenerating || !aiGoal.trim()}
              >
                {aiGenerating ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="spinner" style={{ width: 14, height: 14 }} />
                    Generating...
                  </span>
                ) : (
                  "Generate"
                )}
              </button>

              {aiResults.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div className="ai-results">
                    {["easy", "medium", "hard"].map((diff) => {
                      const items = aiResults.filter((r) => r.difficulty === diff);
                      if (items.length === 0) return null;
                      return (
                        <div key={diff} className="ai-result-group">
                          <div className={`ai-result-group-label ${diff}`}>
                            {diff} ({items.length})
                          </div>
                          {items.map((item, idx) => {
                            const realIdx = aiResults.indexOf(item);
                            return (
                              <div key={idx} className="ai-achieve-row">
                                <div
                                  className={`ai-achieve-check ${aiSelected.has(realIdx) ? "checked" : ""}`}
                                  onClick={() => toggleAiSelect(realIdx)}
                                >
                                  {aiSelected.has(realIdx) ? "✓" : ""}
                                </div>
                                <span style={{ flex: 1, marginLeft: 8 }}>
                                  {item.title}
                                </span>
                                <span style={{ color: "#f4c430", fontSize: 12 }}>
                                  ★{item.stars_rewarded}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="add-selected-btn"
                    onClick={addSelectedAchievements}
                    disabled={aiSelected.size === 0}
                  >
                    Add {aiSelected.size} Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Achievement Modal */}
        {showNewAchieve && (
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowNewAchieve(false);
            }}
          >
            <div className="modal-content">
              <div className="modal-title">New Achievement</div>
              <div style={{ marginBottom: 12 }}>
                <input
                  className="form-input"
                  placeholder="Achievement title"
                  value={newAchieveTitle}
                  onChange={(e) => setNewAchieveTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div className="chip-row" style={{ marginBottom: 0 }}>
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <div
                      key={d}
                      className={`chip ${newAchieveDiff === d ? "active" : ""}`}
                      onClick={() => {
                        setNewAchieveDiff(d);
                        const stars = d === "easy" ? 5 : d === "medium" ? 12 : 25;
                        setNewAchieveStars(stars);
                      }}
                    >
                      {d} (★{d === "easy" ? 5 : d === "medium" ? 12 : 25})
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#9497b0" }}>
                  <input
                    type="checkbox"
                    checked={newAchieveRepeatable}
                    onChange={(e) => setNewAchieveRepeatable(e.target.checked)}
                  />
                  Repeatable (earn stars multiple times)
                </label>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" onClick={() => setShowNewAchieve(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button className="btn" onClick={createAchievement} disabled={!newAchieveTitle.trim()} style={{ flex: 1 }}>
                  Add Achievement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Reward Modal */}
        {showNewReward && (
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowNewReward(false);
            }}
          >
            <div className="modal-content">
              <div className="modal-title">New Reward</div>
              <div style={{ marginBottom: 12 }}>
                <input
                  className="form-input"
                  placeholder="Reward title"
                  value={newRewardTitle}
                  onChange={(e) => setNewRewardTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <input
                  className="form-input"
                  placeholder="Icon (e.g. 🎁, 🍕, 🎬)"
                  value={newRewardIcon}
                  onChange={(e) => setNewRewardIcon(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Required stars"
                  value={newRewardStars}
                  onChange={(e) => setNewRewardStars(Number(e.target.value))}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div className="chip-row" style={{ marginBottom: 0 }}>
                  <div
                    className={`chip ${!newRewardIsBonus ? "active" : ""}`}
                    onClick={() => { setNewRewardIsBonus(false); setNewRewardIsFinal(false); }}
                  >
                    Main Track
                  </div>
                  <div
                    className={`chip ${newRewardIsBonus ? "active" : ""}`}
                    onClick={() => setNewRewardIsBonus(true)}
                  >
                    Bonus Track
                  </div>
                </div>
              </div>
              {!newRewardIsBonus && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#9497b0" }}>
                    <input
                      type="checkbox"
                      checked={newRewardIsFinal}
                      onChange={(e) => setNewRewardIsFinal(e.target.checked)}
                    />
                    Final reward (game completion)
                  </label>
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" onClick={() => setShowNewReward(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button className="btn" onClick={createReward} disabled={!newRewardTitle.trim()} style={{ flex: 1 }}>
                  Add Reward
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}