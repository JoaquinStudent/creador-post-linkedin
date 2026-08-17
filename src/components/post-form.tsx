"use client";

import { useState } from "react";
import type { PostFilters, PostLink } from "@/lib/prompts";

const LINK_TYPES = [
  ["github", "GitHub"],
  ["portfolio", "Portafolio"],
  ["formulario", "Formulario"],
  ["linkedin", "LinkedIn"],
  ["web", "Sitio web"],
  ["otro", "Otro"],
] as const;

const defaultFilters: PostFilters = {
  language: "es",
  tone: "profesional",
  length: "medio",
  structure: "narrativa",
  hashtags: true,
  emojis: true,
  cta: true,
  mentions: "",
};

export default function PostForm({
  onGenerated,
  loading,
  setLoading,
}: {
  onGenerated: (post: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const [eventUrl, setEventUrl] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [filters, setFilters] = useState<PostFilters>(defaultFilters);
  const [links, setLinks] = useState<PostLink[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState("");

  function addLink() {
    setLinks([...links, { type: "github", url: "", label: "" }]);
  }

  function updateLink(i: number, field: keyof PostLink, value: string) {
    setLinks(links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  function removeLink(i: number) {
    setLinks(links.filter((_, idx) => idx !== i));
  }

  const updateFilter = <K extends keyof PostFilters>(
    key: K,
    value: PostFilters[K]
  ) => setFilters((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventUrl, additionalContext, filters, links: links.filter(l => l.url.trim()) }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.post) {
        onGenerated(data.post);
      }
    } catch {
      setError("Error de conexión. Revisa que el servidor esté corriendo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL del evento
        </label>
        <textarea
          value={eventUrl}
          onChange={(e) => setEventUrl(e.target.value)}
          placeholder="Pega URLs de Luma, Instagram, formularios... (una por línea)"
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contexto adicional
        </label>
        <textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="Me tomé foto con el ponente X, quiero agradecer a Y, mis takeaways fueron..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none resize-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Enlaces para incluir
          </label>
          <button
            type="button"
            onClick={addLink}
            className="text-xs text-linkedin hover:text-linkedin-hover font-medium"
          >
            + Agregar enlace
          </button>
        </div>
        {links.length === 0 && (
          <p className="text-xs text-gray-400">
            Agrega enlaces de GitHub, portafolio, formularios, etc. para que se incluyan en el post.
          </p>
        )}
        {links.map((link, i) => (
          <div key={i} className="flex flex-wrap gap-2 mt-2 items-start">
            <div className="flex gap-2 w-full sm:w-auto sm:flex-1 items-start">
              <select
                value={link.type}
                onChange={(e) => updateLink(i, "type", e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm bg-white focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none shrink-0 w-28"
              >
                {LINK_TYPES.map(([val, text]) => (
                  <option key={val} value={val}>{text}</option>
                ))}
              </select>
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none min-w-0"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="text-gray-400 hover:text-red-500 text-sm px-1 py-1.5 shrink-0"
              >
                ✕
              </button>
            </div>
            {link.type === "otro" && (
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                placeholder="Descripción del enlace"
                className="w-full sm:w-auto rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="text-sm text-linkedin hover:text-linkedin-hover font-medium flex items-center gap-1"
      >
        <span className={`transition-transform ${showFilters ? "rotate-90" : ""}`}>
          ▶
        </span>
        Filtros avanzados
      </button>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-linkedin-light/50 rounded-lg border border-linkedin/10">
          <Select
            label="Idioma"
            value={filters.language}
            onChange={(v) => updateFilter("language", v as PostFilters["language"])}
            options={[
              ["es", "Español"],
              ["en", "English"],
            ]}
          />
          <Select
            label="Tono"
            value={filters.tone}
            onChange={(v) => updateFilter("tone", v as PostFilters["tone"])}
            options={[
              ["profesional", "Profesional"],
              ["casual", "Casual"],
              ["inspiracional", "Inspiracional"],
              ["storytelling", "Storytelling"],
            ]}
          />
          <Select
            label="Longitud"
            value={filters.length}
            onChange={(v) => updateFilter("length", v as PostFilters["length"])}
            options={[
              ["corto", "Corto (3-5 líneas)"],
              ["medio", "Medio (5-10 líneas)"],
              ["largo", "Largo (10+ líneas)"],
            ]}
          />
          <Select
            label="Estructura"
            value={filters.structure}
            onChange={(v) => updateFilter("structure", v as PostFilters["structure"])}
            options={[
              ["narrativa", "Narrativa"],
              ["bullets", "Lista / Bullets"],
              ["pregunta", "Pregunta + Reflexión"],
            ]}
          />
          <Toggle
            label="Hashtags"
            checked={filters.hashtags}
            onChange={(v) => updateFilter("hashtags", v)}
          />
          <Toggle
            label="Emojis"
            checked={filters.emojis}
            onChange={(v) => updateFilter("emojis", v)}
          />
          <Toggle
            label="Call-to-action"
            checked={filters.cta}
            onChange={(v) => updateFilter("cta", v)}
          />
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Mencionar personas/orgs
            </label>
            <input
              type="text"
              value={filters.mentions}
              onChange={(e) => updateFilter("mentions", e.target.value)}
              placeholder="@persona, Organización X..."
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (!eventUrl.trim() && !additionalContext.trim())}
        className="w-full bg-linkedin text-white font-medium py-2.5 rounded-lg hover:bg-linkedin-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Generando..." : "Generar post"}
      </button>
    </form>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm bg-white focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none"
      >
        {options.map(([val, text]) => (
          <option key={val} value={val}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-linkedin" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
            checked ? "translate-x-4.5 ml-0" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
