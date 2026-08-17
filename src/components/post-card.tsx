"use client";

import { useState } from "react";

interface Post {
  id: string;
  title: string | null;
  event_url: string | null;
  generated_post: string;
  language: string;
  created_at: string;
}

export default function PostCard({
  post,
  onDelete,
  onRegenerate,
  regenerating,
}: {
  post: Post;
  onDelete: (id: string) => void;
  onRegenerate: (post: Post) => void;
  regenerating?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleCopyAndOpen() {
    await navigator.clipboard.writeText(post.generated_post);
    setToast(true);
    setTimeout(() => setToast(false), 4000);
    window.open("https://www.linkedin.com/feed/", "_blank");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(post.generated_post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete(post.id);
  }

  const preview = post.generated_post.slice(0, 150);
  const date = new Date(post.created_at).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-neutral-900">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {post.title && (
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{post.title}</span>
          )}
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-linkedin-light dark:bg-linkedin/20 text-linkedin">
            {post.language === "es" ? "ES" : "EN"}
          </span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <button
          onClick={handleDelete}
          className={`text-xs px-2 py-1 rounded transition-colors shrink-0 ${
            confirmDelete
              ? "bg-red-500 text-white"
              : "text-gray-400 hover:text-red-500"
          }`}
        >
          {confirmDelete ? "Confirmar" : "Eliminar"}
        </button>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
        {expanded ? post.generated_post : preview}
        {!expanded && post.generated_post.length > 150 && "..."}
      </p>

      {post.generated_post.length > 150 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-linkedin hover:text-linkedin-hover mt-1"
        >
          {expanded ? "Ver menos" : "Ver mas"}
        </button>
      )}

      {toast && (
        <div className="bg-linkedin text-white text-xs px-3 py-2 rounded-lg text-center mt-2 animate-toast-in">
          Texto copiado — click en &quot;Crear publicacion&quot; en LinkedIn y pega con Ctrl+V
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <button
          onClick={handleCopyAndOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-linkedin text-white text-xs font-medium hover:bg-linkedin-hover transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
          Abrir en LinkedIn
        </button>
        <button
          onClick={() => onRegenerate(post)}
          disabled={regenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          {regenerating ? "Regenerando..." : "Regenerar"}
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
        >
          {copied ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg><span className="text-green-600 dark:text-green-400">Copiado</span></>
          ) : (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copiar</>
          )}
        </button>
      </div>
    </div>
  );
}
