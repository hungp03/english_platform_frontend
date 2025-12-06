"use client";
import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="px-3 py-1 rounded-xl border text-sm hover:bg-gray-50 active:scale-95 transition"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text || "");
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        } catch (e) {
          console.error(e);
          alert("Copy failed");
        }
      }}
    >
      {ok ? "Copied!" : label}
    </button>
  );
}
