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
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {post.title && (
            <span className="text-sm font-semibold text-gray-800">{post.title}</span>
          )}
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-linkedin-light text-linkedin">
            {post.language === "es" ? "ES" : "EN"}
          </span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <button
          onClick={() => onDelete(post.id)}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Eliminar
        </button>
      </div>

      <p className="text-sm text-gray-700 whitespace-pre-line">
        {expanded ? post.generated_post : preview}
        {!expanded && post.generated_post.length > 150 && "..."}
      </p>

      <div className="flex items-center gap-2 mt-3">
        {post.generated_post.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-linkedin hover:text-linkedin-hover"
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
        <button
          onClick={handleCopy}
          className="text-xs text-linkedin hover:text-linkedin-hover ml-auto"
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
