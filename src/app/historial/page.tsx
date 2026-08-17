"use client";

import { useEffect, useState } from "react";
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
        setError("Error de conexión");
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setPosts((p) => p.filter((post) => post.id !== id));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historial</h1>
        {posts.length > 0 && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-3 py-1.5 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none w-full sm:w-48"
          />
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-12">Cargando...</p>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 inline-block">
            {error}
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">No hay posts guardados aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts
            .filter((p) => !search || (p.title || "").toLowerCase().includes(search.toLowerCase()))
            .map((post) => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
