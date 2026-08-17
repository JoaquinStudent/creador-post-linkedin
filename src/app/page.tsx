"use client";

import { useRef, useState } from "react";
import PostForm, { type PostFormRef } from "@/components/post-form";
import PostPreview from "@/components/post-preview";

export default function Home() {
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<PostFormRef>(null);

  async function handleSave(title: string): Promise<string | null> {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        generated_post: post,
        language: "es",
      }),
    });
    const data = await res.json();
    if (data.error) return data.error;
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Crea tu post de LinkedIn
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pega el link del evento, personaliza y genera con IA
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
        <PostForm
          ref={formRef}
          onGenerated={setPost}
          loading={loading}
          setLoading={setLoading}
        />
      </div>

      {/* Skeleton loader while generating */}
      {loading && !post && (
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-3 animate-fade-in-up">
          <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 rounded animate-skeleton" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-200 dark:bg-neutral-700 rounded animate-skeleton" />
            <div className="h-3 w-5/6 bg-gray-200 dark:bg-neutral-700 rounded animate-skeleton" style={{ animationDelay: "0.1s" }} />
            <div className="h-3 w-4/6 bg-gray-200 dark:bg-neutral-700 rounded animate-skeleton" style={{ animationDelay: "0.2s" }} />
            <div className="h-3 w-full bg-gray-200 dark:bg-neutral-700 rounded animate-skeleton" style={{ animationDelay: "0.3s" }} />
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-neutral-700 rounded animate-skeleton" style={{ animationDelay: "0.4s" }} />
            <div className="h-3 w-5/6 bg-gray-200 dark:bg-neutral-700 rounded animate-skeleton" style={{ animationDelay: "0.5s" }} />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-9 flex-1 bg-gray-200 dark:bg-neutral-700 rounded-lg animate-skeleton" />
          </div>
        </div>
      )}

      {post && (
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
          <PostPreview
            post={post}
            setPost={setPost}
            onSave={handleSave}
            onRegenerate={() => formRef.current?.regenerate()}
            regenerating={loading}
          />
        </div>
      )}
    </div>
  );
}
