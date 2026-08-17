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
}: {
  post: Post;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState(false);

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
          onClick={() => onDelete(post.id)}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0"
        >
          Eliminar
        </button>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
        {expanded ? post.generated_post : preview}
        {!expanded && post.generated_post.length > 150 && "..."}
      </p>

      {toast && (
        <div className="bg-linkedin text-white text-xs px-3 py-2 rounded-lg text-center mt-2 animate-pulse">
          Texto copiado — click en &quot;Crear publicaci&oacute;n&quot; en LinkedIn y pega con Ctrl+V
        </div>
      )}

      <div className="flex items-center gap-3 mt-3">
        {post.generated_post.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-linkedin hover:text-linkedin-hover"
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={handleCopyAndOpen}
            className="text-xs text-linkedin hover:text-linkedin-hover font-medium"
          >
            Abrir en LinkedIn
          </button>
          <button
            onClick={handleCopy}
            className="text-xs text-linkedin hover:text-linkedin-hover"
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}
