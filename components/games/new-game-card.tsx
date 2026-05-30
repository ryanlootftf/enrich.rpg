"use client";

import { useState } from "react";
import { createGame } from "@/app/actions/games";

export function NewGameCard() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);

    const result = await createGame(formData);

    setPending(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setTitle("");
      setDescription("");
    }
  };

  return (
    <>
      {/* Trigger card */}
      <div
        className="bg-transparent border-[1.5px] border-dashed border-border-default rounded-2xl p-5 cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[160px] transition-colors duration-200 hover:border-accent"
        onClick={() => setOpen(true)}
      >
        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-xl text-accent-2">
          +
        </div>
        <span className="text-xs text-text-tertiary">Create new game</span>
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-bg-2 border border-border-subtle rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-syne text-base font-semibold text-text-primary mb-4">
              Create New Quest
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs uppercase tracking-[0.12em] text-text-tertiary mb-1.5"
                >
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Learn TypeScript"
                  className="w-full bg-bg border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent transition-colors"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-xs uppercase tracking-[0.12em] text-text-tertiary mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this quest about?"
                  rows={3}
                  className="w-full bg-bg border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-red text-xs">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-bg border border-border-subtle text-text-secondary text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-border-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || !title.trim()}
                  className="flex-1 bg-accent text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-accent-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {pending ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}