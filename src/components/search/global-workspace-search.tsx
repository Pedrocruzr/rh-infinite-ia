"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { WORKSPACE_SEARCH_ITEMS } from "@/lib/workspace-search";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function GlobalWorkspaceSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const q = normalize(query.trim());

    if (!q) {
      return WORKSPACE_SEARCH_ITEMS.slice(0, 8);
    }

    return WORKSPACE_SEARCH_ITEMS
      .map((item) => {
        const haystack = normalize(
          [item.title, item.category, ...(item.keywords ?? [])].join(" ")
        );

        let score = 0;
        if (normalize(item.title).includes(q)) score += 8;
        if (haystack.includes(q)) score += 4;

        const tokens = q.split(/\s+/).filter(Boolean);
        for (const token of tokens) {
          if (haystack.includes(token)) score += 2;
        }

        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry) => entry.item);
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function onClickOutside(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) =>
        Math.min(current + 1, Math.max(results.length - 1, 0))
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = results[activeIndex];
      if (selected) {
        goTo(selected.href);
      }
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full max-w-[520px]">
      <div className="flex h-14 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/90 px-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
        <Search className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Buscar..."
          className="flex-1 bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-neutral-100 dark:placeholder:text-neutral-400"
        />
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          <div className="max-h-[380px] overflow-y-auto p-2">
            {results.length ? (
              results.map((item, index) => (
                <button
                  key={`${item.href}-${item.title}`}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => goTo(item.href)}
                  className={`flex w-full items-start rounded-xl px-3 py-3 text-left transition ${
                    index === activeIndex
                      ? "bg-neutral-100 dark:bg-neutral-900"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-900/70"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {item.category}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-6 text-sm text-neutral-500 dark:text-neutral-400">
                Nada encontrado no microsaas.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
