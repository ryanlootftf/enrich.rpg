"use client";

export function NewGameCard() {
  return (
    <div
      className="bg-transparent border-[1.5px] border-dashed border-border-default rounded-2xl p-5 cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[160px] transition-colors duration-200 hover:border-accent"
      onClick={() => alert("Create new game form coming soon!")}
    >
      <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-xl text-accent-2">
        +
      </div>
      <span className="text-[13px] text-text-tertiary">Create new game</span>
    </div>
  );
}