import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!supabase) {
    return Response.json({ error: "Supabase no configurado. Agrega NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY a .env.local" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: Request) {
  if (!supabase) {
    return Response.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  const body = await req.json();
  const { title, event_url, event_context, additional_context, language, generated_post } = body;

  const { data, error } = await supabase
    .from("posts")
    .insert({ title, event_url, event_context, additional_context, language, generated_post })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
