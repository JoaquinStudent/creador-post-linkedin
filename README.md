# PostCreator - Generador de Posts de LinkedIn

Herramienta web para generar posts de LinkedIn sobre eventos, hackathons y conferencias usando IA. Pensada para universitarios activos en comunidades tech que quieren mantener su marca personal sin perder tiempo redactando.

## Funcionalidades

- **Generacion con IA** — Pega URLs de eventos (Luma, Instagram, formularios) y la app extrae contexto automaticamente
- **Filtros avanzados** — Idioma (ES/EN), tono, longitud, estructura, hashtags, emojis, call-to-action
- **Plantillas rapidas** — Presets para Hackathon, Conferencia, Agradecimiento y Proyecto
- **Menciones con perfil** — Agrega nombre + URL de LinkedIn para menciones clickeables
- **Enlaces integrados** — GitHub, portafolio, formularios: la IA los integra naturalmente en el post
- **Edicion inline** — Edita el post generado directamente antes de copiar
- **Regenerar** — Boton "Otra version" para generar variaciones sin re-llenar el formulario
- **Copiar + Abrir LinkedIn** — Un click: copia el texto y abre LinkedIn para publicar
- **Historial** — Guarda posts con titulo, busca por titulo, copia o abre desde el historial
- **Hook counter** — Indica si la primera linea se cortara con "ver mas" en LinkedIn
- **Sugerencia de horario** — Tip dinamico sobre el mejor momento para publicar
- **Dark mode** — Toggle manual o automatico segun preferencia del sistema

## Stack

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Estilos | Tailwind CSS |
| IA | OpenRouter (compatible con cualquier modelo) |
| Base de datos | Supabase (PostgreSQL) |
| Deploy | Vercel |

## Setup local

```bash
# Clonar e instalar
git clone https://github.com/tu-usuario/creador-post-linkedin.git
cd creador-post-linkedin
npm install
```

### Variables de entorno

Crea un archivo `.env.local` en la raiz:

```
OPENROUTER_API_KEY=sk-or-tu-key
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ-tu-key
```

- **OpenRouter**: Crea una cuenta en [openrouter.ai](https://openrouter.ai) y genera una API key
- **Supabase**: Crea un proyecto en [supabase.com](https://supabase.com), las keys estan en Settings > API

### Base de datos

En el SQL Editor de Supabase, ejecuta:

```sql
CREATE TABLE posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  event_url text,
  event_context text,
  additional_context text,
  language varchar(2) NOT NULL DEFAULT 'es',
  generated_post text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Correr

```bash
npm run dev
```

Abre [localhost:3000](http://localhost:3000).

## Cambiar modelo de IA

Edita `src/lib/ai.ts` y cambia el modelo. Cualquier modelo disponible en OpenRouter funciona:

```ts
export const OPENROUTER_MODEL = "google/gemini-3.7-flash";  // barato y rapido
// export const OPENROUTER_MODEL = "anthropic/claude-sonnet-5";  // mejor calidad
// export const OPENROUTER_MODEL = "meta-llama/llama-4-maverick";  // gratis
```

## Deploy en Vercel

1. Sube el repo a GitHub
2. Importa el repo en [vercel.com](https://vercel.com)
3. Agrega las 3 variables de entorno en el dashboard
4. Deploy

Cada push a `main` hace deploy automatico.
