"use client";

import { useState, useEffect, useRef } from "react";

function getHookInfo(post: string) {
  const hook = post.split("\n")[0] || "";
  const len = hook.length;
  if (len === 0) return { len, color: "text-gray-400", label: "", ok: true };
  if (len <= 210) return { len, color: "text-green-600 dark:text-green-400", label: "Hook visible sin 'ver mas'", ok: true };
  return { len, color: "text-amber-600 dark:text-amber-400", label: "Hook se corta — LinkedIn mostrara 'ver mas'", ok: false };
}

function getPostingTip() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) return "Fines de semana tienen menos alcance. Mejor lunes 8-10am.";
  if (hour >= 8 && hour <= 10) return "Buen momento para publicar.";
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
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const containerRef = useRef<HTMLDivElement>(null);

  const hookInfo = getHookInfo(post);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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
      setTimeout(() => setSaveState("idle"), 2500);
    }
  }

  return (
    <div ref={containerRef} className="space-y-3 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">Post generado</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{post.length} chars</span>
          <div className="flex bg-gray-100 dark:bg-neutral-800 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${viewMode === "edit" ? "bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${viewMode === "preview" ? "bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
            >
              Vista LinkedIn
            </button>
          </div>
        </div>
      </div>

      {viewMode === "edit" ? (
        <textarea
          value={post}
          onChange={(e) => setPost(e.target.value)}
          rows={12}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-3 py-2 text-sm leading-relaxed focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none resize-y"
        />
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 overflow-hidden">
          {/* LinkedIn card header */}
          <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
            <div className="w-10 h-10 rounded-full bg-linkedin/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-linkedin"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 3.5-7 7-7s7 3 7 7"/></svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">Tu nombre</div>
              <div className="text-xs text-gray-400">Ahora · <svg className="inline w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>
            </div>
          </div>
          {/* Post text */}
          <div className="px-4 pb-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
            {post}
          </div>
          {/* Reactions bar */}
          <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2 flex items-center gap-4 text-xs text-gray-400">
            <span>Me gusta</span>
            <span>Comentar</span>
            <span>Compartir</span>
          </div>
        </div>
      )}

      {copiedToast && (
        <div className="bg-linkedin text-white text-sm px-4 py-2.5 rounded-lg text-center animate-toast-in">
          Texto copiado — click en &quot;Crear publicacion&quot; en LinkedIn y pega con Ctrl+V
        </div>
      )}

      {/* Hook info + posting tip */}
      <div className="flex flex-col gap-1">
        {hookInfo.label && (
          <div className={`flex items-center gap-1.5 text-xs ${hookInfo.color}`}>
            <span>{hookInfo.ok ? "✓" : "⚠"}</span>
            Hook: {hookInfo.len} chars — {hookInfo.label}
          </div>
        )}
        <div className="text-xs text-gray-400 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {getPostingTip()}
        </div>
      </div>

      {showSaveForm && saveState !== "saved" && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titulo del post (ej: Hackathon AWS 2026)"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-3 py-2 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none animate-fade-in-up"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />
      )}

      {saveState === "error" && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          Error al guardar: {saveError}
        </div>
      )}

      {saveState === "saved" && (
        <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 text-center animate-toast-in">
          ✓ Post guardado en historial
        </div>
      )}

      {/* Primary CTA */}
      <button
        onClick={handleCopyAndOpen}
        className="w-full bg-linkedin text-white font-medium py-3 rounded-lg hover:bg-linkedin-hover transition-colors text-sm flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
        Copiar + Abrir LinkedIn
      </button>

      {/* Secondary actions */}
      <div className="flex gap-2">
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          {regenerating ? "Generando..." : "Otra version"}
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-xs flex items-center justify-center gap-1.5"
        >
          {copied ? (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg><span className="text-green-600 dark:text-green-400">Copiado</span></>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copiar</>
          )}
        </button>
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="flex-1 px-3 py-2 rounded-lg border border-linkedin text-linkedin font-medium hover:bg-linkedin-light dark:hover:bg-linkedin/10 transition-colors text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {saveState === "saving" ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
