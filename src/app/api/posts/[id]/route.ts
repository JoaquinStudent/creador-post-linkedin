import { supabase } from "@/lib/supabase";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabase) {
    return Response.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  const { id } = await params;
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
