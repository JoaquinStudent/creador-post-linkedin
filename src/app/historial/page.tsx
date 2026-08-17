"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PostCard from "@/components/post-card";

interface Post {
  id: string;
  title: string | null;
  event_url: string | null;
  generated_post: string;
  language: string;
  created_at: string;
}

export default function Historial() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [regenerated, setRegenerated] = useState<{ text: string; originalTitle: string } | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [saveTitle, setSaveTitle] = useState("");

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPosts(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error de conexion");
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setPosts((p) => p.filter((post) => post.id !== id));
  }

  async function handleRegenerate(post: Post) {
    setRegenerating(post.id);
    setRegenerated(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventUrl: "",
          additionalContext: post.generated_post,
          filters: {
            language: post.language || "es",
            tone: "profesional",
            length: "medio",
            structure: "narrativa",
            hashtags: true,
            emojis: true,
            cta: true,
          },
          links: [],
          mentions: [],
        }),
      });
      const data = await res.json();
      if (data.post) {
        setRegenerated({ text: data.post, originalTitle: post.title || "Sin titulo" });
        setSaveTitle(`${post.title || "Post"} (v2)`);
      }
    } finally {
      setRegenerating(null);
    }
  }

  async function handleSaveRegenerated() {
    if (!regenerated || !saveTitle.trim()) return;
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: saveTitle.trim(),
        generated_post: regenerated.text,
        language: "es",
      }),
    });
    const data = await res.json();
    if (!data.error) {
      setPosts((p) => [data, ...p]);
      setRegenerated(null);
    }
  }

  const filtered = posts.filter((p) => !search || (p.title || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historial</h1>
          {posts.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-linkedin-light dark:bg-linkedin/15 text-linkedin">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          )}
        </div>
        {posts.length > 0 && (
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por titulo..."
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 pl-8 pr-3 py-1.5 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none w-full sm:w-52"
            />
          </div>
        )}
      </div>

      {regenerated && (
        <div className="mb-6 bg-white dark:bg-neutral-900 border border-linkedin/30 rounded-xl p-5 shadow-sm space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-linkedin">
              Nueva version de &quot;{regenerated.originalTitle}&quot;
            </h2>
            <button onClick={() => setRegenerated(null)} className="text-xs text-gray-400 hover:text-red-500">
              Descartar
            </button>
          </div>
          <textarea
            value={regenerated.text}
            onChange={(e) => setRegenerated({ ...regenerated, text: e.target.value })}
            rows={10}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-3 py-2 text-sm leading-relaxed focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none resize-y"
          />
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Titulo para guardar"
              className="flex-1 min-w-[150px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-3 py-2 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none"
            />
            <button
              onClick={handleSaveRegenerated}
              className="px-4 py-2 bg-linkedin text-white font-medium rounded-lg hover:bg-linkedin-hover transition-colors text-sm"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 py-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-neutral-900">
              <div className="h-3 w-32 bg-gray-200 dark:bg-neutral-700 rounded animate-skeleton mb-3" />
              <div className="space-y-2">
                <div className="h-2.5 w-full bg-gray-200 dark:bg-neutral-700 rounded animate-skeleton" />
                <div className="h-2.5 w-3/4 bg-gray-200 dark:bg-neutral-700 rounded animate-skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 inline-block">
            {error}
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="text-5xl">📝</div>
          <div className="space-y-1">
            <p className="text-gray-700 dark:text-gray-200 font-medium">Todavia no tienes posts guardados</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
              Genera tu primer post y guardalo para tenerlo siempre a mano.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-linkedin text-white font-medium rounded-lg hover:bg-linkedin-hover transition-colors text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
            Crear mi primer post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && search ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No se encontraron posts con &quot;{search}&quot;</p>
            </div>
          ) : (
            filtered.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
                onRegenerate={handleRegenerate}
                regenerating={regenerating === post.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
