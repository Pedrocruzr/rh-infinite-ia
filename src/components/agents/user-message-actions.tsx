"use client";

import { useState } from "react";

type UserMessageActionsProps = {
  onCopy: () => void | Promise<void>;
  onEdit: () => void;
};

export default function UserMessageActions({
  onCopy,
  onEdit,
}: UserMessageActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await onCopy();
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  return (
    <div className="mt-2 flex justify-end gap-2">
      <button
        type="button"
        onClick={() => void handleCopy()}
        aria-label={copied ? "Mensagem copiada" : "Copiar mensagem"}
        title={copied ? "Mensagem copiada" : "Copiar mensagem"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200"
      >
        {copied ? (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="3" />
            <rect x="2" y="2" width="13" height="13" rx="3" />
          </svg>
        )}
      </button>

      <button
        type="button"
        onClick={onEdit}
        aria-label="Editar mensagem"
        title="Editar mensagem"
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
        </svg>
      </button>
    </div>
  );
}
