"use client";

import { useState } from "react";

export default function PostPreview({
  post,
  setPost,
  onSave,
}: {
  post: string;
  setPost: (v: string) => void;
  onSave: (title: string) => Promise<string | null>;
}) {
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");

  async function handleCopy() {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    if (!showSaveForm) {
      setShowSaveForm(true);
      return;
    }
    if (!title.trim()) return;
    setSaveState("saving");
    setSaveError("");
    const err = await onSave(title.trim());
    if (err) {
      setSaveState("error");
      setSaveError(err);
    } else {
      setSaveState("saved");
      setShowSaveForm(false);
      setTitle("");
      setTimeout(() => setSaveState("idle"), 2000);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">Post generado</h2>
        <span className="text-xs text-gray-400">
          {post.length} caracteres
        </span>
      </div>

      <textarea
        value={post}
        onChange={(e) => setPost(e.target.value)}
        rows={12}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none resize-y"
      />

      {showSaveForm && saveState !== "saved" && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del post (ej: Hackathon AWS 2026)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />
      )}

      {saveState === "error" && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          Error al guardar: {saveError}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 bg-linkedin text-white font-medium py-2 rounded-lg hover:bg-linkedin-hover transition-colors text-sm"
        >
          {copied ? "Copiado!" : "Copiar al clipboard"}
        </button>
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="px-4 py-2 rounded-lg border border-linkedin text-linkedin font-medium hover:bg-linkedin-light transition-colors text-sm disabled:opacity-50"
        >
          {saveState === "saving" ? "Guardando..." : saveState === "saved" ? "Guardado!" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
