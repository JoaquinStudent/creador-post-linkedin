"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import type { PostFilters, PostLink, Mention } from "@/lib/prompts";

const LINK_TYPES = [
  ["github", "GitHub"],
  ["portfolio", "Portafolio"],
  ["formulario", "Formulario"],
  ["linkedin", "LinkedIn"],
  ["web", "Sitio web"],
  ["otro", "Otro"],
] as const;

const PRESETS: { label: string; icon: string; desc: string; filters: Partial<PostFilters> }[] = [
  {
    label: "Hackathon",
    icon: "\u{1F680}",
    desc: "Storytelling largo con emojis",
    filters: { tone: "storytelling", length: "largo", structure: "narrativa", emojis: true, hashtags: true, cta: true },
  },
  {
    label: "Conferencia",
    icon: "\u{1F3A4}",
    desc: "Profesional con bullets",
    filters: { tone: "profesional", length: "medio", structure: "bullets", emojis: false, hashtags: true, cta: true },
  },
  {
    label: "Agradecimiento",
    icon: "\u{1F64F}",
    desc: "Casual y cercano",
    filters: { tone: "casual", length: "medio", structure: "narrativa", emojis: true, hashtags: false, cta: false },
  },
  {
    label: "Proyecto",
    icon: "\u{1F4BB}",
    desc: "Profesional y detallado",
    filters: { tone: "profesional", length: "largo", structure: "narrativa", emojis: false, hashtags: true, cta: true },
  },
];

const PROGRESS_MESSAGES = [
  "Analizando el evento...",
  "Redactando tu post...",
  "Puliendo el resultado...",
];

const defaultFilters: PostFilters = {
  language: "es",
  tone: "profesional",
  length: "medio",
  structure: "narrativa",
  hashtags: true,
  emojis: true,
  cta: true,
};

function getFilterSummary(f: PostFilters): string {
  const parts = [
    f.tone.charAt(0).toUpperCase() + f.tone.slice(1),
    f.length,
    f.hashtags ? "hashtags" : null,
    f.emojis ? "emojis" : null,
    f.cta ? "CTA" : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

export interface PostFormRef {
  regenerate: () => void;
}

const PostForm = forwardRef<PostFormRef, {
  onGenerated: (post: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}>(function PostForm({ onGenerated, loading, setLoading }, ref) {
  const [eventUrl, setEventUrl] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [filters, setFilters] = useState<PostFilters>(defaultFilters);
  const [links, setLinks] = useState<PostLink[]>([]);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [progressIdx, setProgressIdx] = useState(0);

  function addLink() {
    setLinks([...links, { type: "github", url: "", label: "" }]);
  }
  function updateLink(i: number, field: keyof PostLink, value: string) {
    setLinks(links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }
  function removeLink(i: number) {
    setLinks(links.filter((_, idx) => idx !== i));
  }

  function addMention() {
    setMentions([...mentions, { name: "", profileUrl: "" }]);
  }
  function updateMention(i: number, field: keyof Mention, value: string) {
    setMentions(mentions.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }
  function removeMention(i: number) {
    setMentions(mentions.filter((_, idx) => idx !== i));
  }

  const updateFilter = <K extends keyof PostFilters>(key: K, value: PostFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  function applyPreset(preset: typeof PRESETS[number]) {
    setFilters((f) => ({ ...f, ...preset.filters }));
    setActivePreset(preset.label);
  }

  async function doGenerate() {
    setLoading(true);
    setError("");
    setProgressIdx(0);
    const interval = setInterval(() => {
      setProgressIdx((i) => Math.min(i + 1, PROGRESS_MESSAGES.length - 1));
    }, 3000);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventUrl,
          additionalContext,
          filters,
          links: links.filter((l) => l.url.trim()),
          mentions: mentions.filter((m) => m.name.trim()),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.post) {
        onGenerated(data.post);
      }
    } catch {
      setError("Error de conexion. Revisa que el servidor este corriendo.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  useImperativeHandle(ref, () => ({ regenerate: doGenerate }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doGenerate();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Step 1: Plantillas */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-linkedin text-white text-xs font-bold shrink-0">1</span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Elige una plantilla</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg text-center border transition-all ${
                activePreset === p.label
                  ? "bg-linkedin text-white border-linkedin shadow-sm scale-[1.02]"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-linkedin hover:text-linkedin bg-white dark:bg-neutral-800"
              }`}
            >
              <span className="text-lg">{p.icon}</span>
              <span className="text-xs font-medium">{p.label}</span>
              <span className={`text-[10px] leading-tight ${activePreset === p.label ? "text-white/80" : "text-gray-400 dark:text-gray-500"}`}>{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Contenido */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-linkedin text-white text-xs font-bold shrink-0">2</span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Describe tu evento</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              URL del evento
            </label>
            <textarea
              value={eventUrl}
              onChange={(e) => setEventUrl(e.target.value)}
              placeholder="Pega URLs de Luma, Instagram, Eventbrite... (una por linea)"
              rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-3 py-2 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Contexto adicional
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Me tome foto con el ponente X, quiero agradecer a Y, mis takeaways fueron..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-3 py-2 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Step 3: Personalizar (collapsible sections) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 text-white text-xs font-bold shrink-0">3</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Personalizar <span className="text-xs font-normal text-gray-400 dark:text-gray-500">opcional</span></span>
        </div>

        <div className="space-y-1">
          {/* Mentions accordion */}
          <button
            type="button"
            onClick={() => setShowMentions(!showMentions)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <span className={`transition-transform text-xs ${showMentions ? "rotate-90" : ""}`}>▶</span>
              Mencionar personas
              {mentions.length > 0 && <span className="text-xs bg-linkedin/10 text-linkedin px-1.5 py-0.5 rounded-full">{mentions.length}</span>}
            </span>
            <button type="button" onClick={(e) => { e.stopPropagation(); setShowMentions(true); addMention(); }} className="text-xs text-linkedin hover:text-linkedin-hover font-medium">
              + Agregar
            </button>
          </button>
          {showMentions && (
            <div className="pl-3 pr-1 pb-2 space-y-2 animate-fade-in-up">
              {mentions.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 pl-5">
                  Nombre + perfil de LinkedIn para menciones con enlace.
                </p>
              )}
              {mentions.map((m, i) => (
                <div key={i} className="flex flex-wrap gap-2">
                  <input type="text" value={m.name} onChange={(e) => updateMention(i, "name", e.target.value)}
                    placeholder="Nombre (ej: Juan Perez)"
                    className="flex-1 min-w-[120px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-2 py-1.5 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none" />
                  <input type="url" value={m.profileUrl} onChange={(e) => updateMention(i, "profileUrl", e.target.value)}
                    placeholder="linkedin.com/in/juanperez"
                    className="flex-1 min-w-[160px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-2 py-1.5 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none" />
                  <button type="button" onClick={() => removeMention(i)} className="text-gray-400 hover:text-red-500 text-sm px-1 py-1.5 shrink-0">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Links accordion */}
          <button
            type="button"
            onClick={() => setShowLinks(!showLinks)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <span className={`transition-transform text-xs ${showLinks ? "rotate-90" : ""}`}>▶</span>
              Enlaces para incluir
              {links.length > 0 && <span className="text-xs bg-linkedin/10 text-linkedin px-1.5 py-0.5 rounded-full">{links.length}</span>}
            </span>
            <button type="button" onClick={(e) => { e.stopPropagation(); setShowLinks(true); addLink(); }} className="text-xs text-linkedin hover:text-linkedin-hover font-medium">
              + Agregar
            </button>
          </button>
          {showLinks && (
            <div className="pl-3 pr-1 pb-2 space-y-2 animate-fade-in-up">
              {links.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 pl-5">
                  GitHub, portafolio, formularios — la IA los integra en el post.
                </p>
              )}
              {links.map((link, i) => (
                <div key={i} className="flex flex-wrap gap-2 items-start">
                  <div className="flex gap-2 w-full sm:w-auto sm:flex-1 items-start">
                    <select value={link.type} onChange={(e) => updateLink(i, "type", e.target.value)}
                      className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm bg-white dark:bg-neutral-800 dark:text-gray-100 focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none shrink-0 w-28">
                      {LINK_TYPES.map(([val, text]) => (<option key={val} value={val}>{text}</option>))}
                    </select>
                    <input type="url" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)}
                      placeholder="https://..."
                      className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-2 py-1.5 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none min-w-0" />
                    <button type="button" onClick={() => removeLink(i)} className="text-gray-400 hover:text-red-500 text-sm px-1 py-1.5 shrink-0">✕</button>
                  </div>
                  {link.type === "otro" && (
                    <input type="text" value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)}
                      placeholder="Descripcion del enlace"
                      className="w-full sm:w-auto rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 dark:text-gray-100 px-2 py-1.5 text-sm focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Filters accordion */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <span className={`transition-transform text-xs ${showFilters ? "rotate-90" : ""}`}>▶</span>
              Filtros avanzados
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{getFilterSummary(filters)}</span>
          </button>
          {showFilters && (
            <div className="animate-fade-in-up grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-linkedin-light/50 dark:bg-neutral-800/50 rounded-lg border border-linkedin/10 dark:border-gray-600">
              <Select label="Idioma" value={filters.language} onChange={(v) => updateFilter("language", v as PostFilters["language"])}
                options={[["es", "Espanol"], ["en", "English"]]} />
              <Select label="Tono" value={filters.tone} onChange={(v) => updateFilter("tone", v as PostFilters["tone"])}
                options={[["profesional", "Profesional"], ["casual", "Casual"], ["inspiracional", "Inspiracional"], ["storytelling", "Storytelling"]]} />
              <Select label="Longitud" value={filters.length} onChange={(v) => updateFilter("length", v as PostFilters["length"])}
                options={[["corto", "Corto (3-5 lineas)"], ["medio", "Medio (5-10 lineas)"], ["largo", "Largo (10+ lineas)"]]} />
              <Select label="Estructura" value={filters.structure} onChange={(v) => updateFilter("structure", v as PostFilters["structure"])}
                options={[["narrativa", "Narrativa"], ["bullets", "Lista / Bullets"], ["pregunta", "Pregunta + Reflexion"]]} />
              <Toggle label="Hashtags" checked={filters.hashtags} onChange={(v) => updateFilter("hashtags", v)} />
              <Toggle label="Emojis" checked={filters.emojis} onChange={(v) => updateFilter("emojis", v)} />
              <Toggle label="Call-to-action" checked={filters.cta} onChange={(v) => updateFilter("cta", v)} />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (!eventUrl.trim() && !additionalContext.trim())}
        className="w-full bg-linkedin text-white font-medium py-3 rounded-lg hover:bg-linkedin-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {PROGRESS_MESSAGES[progressIdx]}
          </span>
        ) : "Generar post"}
      </button>
    </form>
  );
});

export default PostForm;

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm bg-white dark:bg-neutral-800 dark:text-gray-100 focus:border-linkedin focus:ring-1 focus:ring-linkedin outline-none">
        {options.map(([val, text]) => (<option key={val} value={val}>{text}</option>))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-linkedin" : "bg-gray-300 dark:bg-gray-600"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${checked ? "translate-x-4.5 ml-0" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}
