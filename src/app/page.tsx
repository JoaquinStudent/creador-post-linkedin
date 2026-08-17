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
        <p className="text-sm text-gray-500">
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
