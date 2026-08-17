"use client";

import { useState } from "react";

function getHookInfo(post: string) {
  const hook = post.split("\n")[0] || "";
  const len = hook.length;
  if (len === 0) return { len, color: "text-gray-400", label: "" };
  if (len <= 210) return { len, color: "text-green-600", label: "Hook visible sin 'ver más'" };
  return { len, color: "text-amber-600", label: "Hook se corta — LinkedIn mostrará 'ver más'" };
}

function getPostingTip() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    return "Los fines de semana tienen menos alcance. Si puedes, programa para lunes 8-10am.";
  }
  if (hour >= 8 && hour <= 10) return "Buen momento para publicar — horario de mayor alcance.";
  if (hour >= 17 && hour <= 19) return "Buen horario — la gente revisa LinkedIn al salir del trabajo.";
  if (hour >= 12 && hour <= 13) return "Horario decente — pausa de almuerzo.";
  return "Mejor horario: 8-10am o 5-7pm entre semana.";
}

export default function PostPreview({
  post,
  setPost,
  onSave,
  onRegenerate,
  regenerating,
}: {
  post: string;
  setPost: (v: string) => void;
  onSave: (title: string) => Promise<string | null>;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");

  const hookInfo = getHookInfo(post);

  async function handleCopyAndOpen() {
    await navigator.clipboard.writeText(post);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 4000);
    window.open("https://www.linkedin.com/feed/", "_blank");
  }

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
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">Post generado</h2>
        <span className="text-xs text-gray-400">
          {post.length} caracteres
        </span>
      </div>

      <textarea
        value={post}
        onChange={(e) => setPost(e.target.value)}
        rows={12}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-3 py-2 text-sm leading-relaxed focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none resize-y"
      />

      {copiedToast && (
        <div className="bg-linkedin text-white text-sm px-4 py-2.5 rounded-lg text-center animate-pulse">
          Texto copiado — click en &quot;Crear publicaci&oacute;n&quot; en LinkedIn y pega con Ctrl+V
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`text-xs ${hookInfo.color}`}>
          {hookInfo.label && `Hook: ${hookInfo.len} chars — ${hookInfo.label}`}
        </span>
        <span className="text-xs text-gray-400">{getPostingTip()}</span>
      </div>

      {showSaveForm && saveState !== "saved" && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del post (ej: Hackathon AWS 2026)"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-3 py-2 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />
      )}

      {saveState === "error" && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          Error al guardar: {saveError}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopyAndOpen}
          className="flex-1 bg-linkedin text-white font-medium py-2 rounded-lg hover:bg-linkedin-hover transition-colors text-sm min-w-[140px]"
        >
          Copiar + Abrir LinkedIn
        </button>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
        >
          {regenerating ? "Generando..." : "Otra versión"}
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          {copied ? "Copiado!" : "Copiar"}
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
