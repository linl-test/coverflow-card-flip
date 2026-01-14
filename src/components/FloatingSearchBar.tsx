import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface FloatingSearchBarProps {
  placeholder?: string;
  query: string;
  onQueryChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: (value: string) => void;
  isActive?: boolean;
}

const FloatingSearchBar = ({
  placeholder = "Search skills (coming soon)…",
  query,
  onQueryChange,
  onFocus,
  onBlur,
  onSubmit,
  isActive = false,
}: FloatingSearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      const tagName = target.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea" || target.isContentEditable) {
        return;
      }

      event.preventDefault();
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();

    if (import.meta.env.DEV) {
      console.log("[Search] submit", { query: trimmed });
    }

    onSubmit?.(trimmed);
  };

  return (
    <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4 pointer-events-none">
      <form onSubmit={handleSubmit} className="pointer-events-auto w-full max-w-xl">
        <div
          className={`flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 transition-all duration-200 ${
            isActive
              ? "shadow-[0_24px_60px_rgba(0,0,0,0.08)] ring-1 ring-black/10 scale-[1.01] bg-white/95"
              : "shadow-[0_18px_50px_rgba(0,0,0,0.12)]"
          }`}
        >
          <Search className="h-5 w-5 text-black/50" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[15px] text-black placeholder:text-black/40 outline-none"
            aria-label="Search"
          />
          <button
            type="submit"
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black/90 active:scale-[0.98]"
            >
            Search
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between px-2 text-xs text-black/40">
          <span>Press / to focus</span>
          <span>Placeholder</span>
        </div>
      </form>
    </div>
  );
};

export default FloatingSearchBar;
