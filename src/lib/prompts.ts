export interface PostLink {
  type: string;
  url: string;
  label: string;
}

export interface Mention {
  name: string;
  profileUrl: string;
}

export interface PostFilters {
  language: "es" | "en";
  tone: "profesional" | "casual" | "inspiracional" | "storytelling";
  length: "corto" | "medio" | "largo";
  structure: "narrativa" | "bullets" | "pregunta";
  hashtags: boolean;
  emojis: boolean;
  cta: boolean;
}

const lengthMap = {
  corto: "Breve pero impactante: 3-5 líneas. Ve al punto con fuerza.",
  medio: "Longitud media: 6-10 líneas. Desarrolla la idea con detalle.",
  largo: "Post largo y completo: 12-18 líneas. Cuenta toda la historia con profundidad.",
};

const structureMap = {
  narrativa: "Narrativa fluida en primera persona. Abre con un hook que atrape, desarrolla la experiencia, cierra con una reflexión personal.",
  bullets: "Abre con 1-2 líneas de contexto, luego lista los puntos clave con bullets (usa • o números). Cierra con una línea de cierre.",
  pregunta: "Abre con una pregunta provocadora que genere curiosidad. Desarrolla tu experiencia como respuesta. Cierra con otra pregunta o reflexión abierta.",
};

const toneMap = {
  profesional: "Profesional pero humano. Vocabulario cuidado, sin sonar corporativo ni robótico. Muestra expertise con humildad.",
  casual: "Cercano y conversacional, como contarle a un amigo. Usa lenguaje natural, frases cortas, ritmo dinámico.",
  inspiracional: "Motivador y con energía. Transmite pasión por lo que haces. Que el lector sienta ganas de actuar o participar.",
  storytelling: "Cuenta una historia en primera persona con inicio-nudo-desenlace. Haz que el lector se sienta ahí contigo. Usa detalles sensoriales y emocionales.",
};

export function buildSystemPrompt(filters: PostFilters): string {
  const lang = filters.language === "es" ? "español" : "inglés";

  return `Eres un ghostwriter experto en LinkedIn especializado en marca personal para estudiantes universitarios activos en comunidades tech, hackathons y eventos.

CONTEXTO DEL AUTOR: Estudiante universitario que asiste activamente a eventos, competencias y comunidades. Busca posicionarse como alguien proactivo, curioso y en constante aprendizaje.

TAREA: Genera UN post de LinkedIn completo y listo para publicar. El post debe sentirse escrito por una persona real, no por una IA.

ESTILO:
- Idioma: ${lang}
- Tono: ${toneMap[filters.tone]}
- Longitud: ${lengthMap[filters.length]}
- Estructura: ${structureMap[filters.structure]}

REGLAS DE CONTENIDO:
${filters.hashtags ? "- Incluye 3-5 hashtags relevantes al final del post, separados del texto principal con un salto de línea" : "- NO incluyas hashtags"}
${filters.emojis ? "- Usa emojis estratégicamente para dar ritmo visual (máximo 4-6 en todo el post, no al inicio de cada línea)" : "- NO uses emojis en absoluto"}
${filters.cta ? "- Cierra con un call-to-action natural: una pregunta genuina al lector, invitación a compartir su experiencia, o reflexión que invite a comentar" : "- Cierra con una reflexión personal, sin pedir interacción"}

REGLAS DE FORMATO (MUY IMPORTANTE — LinkedIn no es Markdown):
- Devuelve SOLO el texto del post, nada más
- No escribas "Post:", comillas, ni encabezados
- NUNCA uses markdown: nada de **bold**, *italic*, ni ningún formato markdown. LinkedIn muestra esos asteriscos como texto plano
- Usa DOBLE salto de línea (línea vacía) entre cada párrafo. LinkedIn ignora saltos simples — sin la línea vacía todo queda pegado
- Para listas usa • sin negritas, con doble salto de línea entre cada bullet
- Cuando menciones personas, usa solo su nombre completo. NUNCA pongas URLs de perfil junto al nombre ni entre paréntesis. Las URLs de perfil de LinkedIn NO se ponen en el post
- Los enlaces de proyectos, repos o sitios web SÍ van en el texto, escritos como URL directa (no entre paréntesis ni con formato markdown)
- El hook (primera línea) es lo más importante: debe generar curiosidad para que hagan clic en "ver más"
- IMPORTANTE: Escribe el post COMPLETO. No lo cortes. Termina con un cierre claro.`;
}

function formatMentions(mentions: Mention[]): string {
  if (!mentions.length) return "";
  const names = mentions.map((m) => m.name).join(", ");
  return `\nPERSONAS A MENCIONAR: ${names}\nInstrucción: Menciona a estas personas por su nombre completo de forma natural en el post. NO incluyas URLs de perfil de LinkedIn junto a los nombres — el autor los etiquetará manualmente en LinkedIn.`;
}

function formatLinks(links: PostLink[]): string {
  if (!links.length) return "";
  const typeLabels: Record<string, string> = {
    github: "Repositorio GitHub",
    portfolio: "Portafolio",
    formulario: "Formulario/registro",
    linkedin: "Perfil LinkedIn",
    web: "Sitio web",
    otro: "Enlace",
  };
  const items = links.map(
    (l) => `- ${typeLabels[l.type] || l.label || "Enlace"}: ${l.url}`
  );
  return `\nENLACES PARA INCLUIR EN EL POST:\n${items.join("\n")}\nInstrucción: Integra estos enlaces de forma natural en el post. Menciónalos en contexto (ej: "Puedes ver el proyecto aquí: [url]" o "Si quieres participar: [url]"). No los listes al final como una sección aparte.`;
}

export function buildUserPrompt(
  eventContext: string,
  additionalContext: string,
  links: PostLink[] = [],
  mentions: Mention[] = []
): string {
  return `INFORMACIÓN DEL EVENTO:
${eventContext || "No se proporcionó URL del evento. Usa solo las notas del autor."}

NOTAS DEL AUTOR:
${additionalContext || "Sin notas adicionales."}
${formatMentions(mentions)}
${formatLinks(links)}

Genera el post de LinkedIn completo basándote en esta información. Recuerda: hook potente, contenido auténtico, cierre claro.`;
}
