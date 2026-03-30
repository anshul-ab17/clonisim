"use client";

export function ServerSidebar() {
  return (
    <div className="w-16 bg-bg-server flex flex-col items-center py-3 gap-3 shrink-0">
      <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:rounded-xl transition-all">
        E
      </div>

      <div className="w-8 h-px bg-border-subtle" />

      <div className="w-10 h-10 rounded-2xl bg-bg-surface flex items-center justify-center text-gray-400 cursor-pointer hover:bg-primary hover:text-white hover:rounded-xl transition-all text-lg font-light">
        +
      </div>
    </div>
  );
}
