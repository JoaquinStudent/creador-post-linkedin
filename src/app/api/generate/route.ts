import { generate } from "@/lib/ai";
import { scrapeUrl } from "@/lib/scraper";
import {
  buildSystemPrompt,
  buildUserPrompt,
  type PostFilters,
  type PostLink,
  type Mention,
} from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventUrl, additionalContext, filters, links, mentions } = body as {
      eventUrl: string;
      additionalContext: string;
      filters: PostFilters;
      links: PostLink[];
      mentions: Mention[];
    };

    let eventContext = "";
    if (eventUrl?.trim()) {
      const urls = eventUrl
        .split(/[\n,]+/)
        .map((u: string) => u.trim())
        .filter(Boolean);
      const results = await Promise.all(urls.map(scrapeUrl));
      eventContext = results.join("\n\n---\n\n");
    }

    const text = await generate(
      buildSystemPrompt(filters),
      buildUserPrompt(eventContext, additionalContext, links || [], mentions || []),
    );

    return Response.json({ post: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    console.error("generate error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
