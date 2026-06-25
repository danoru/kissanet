import { NextResponse } from "next/server";
import { getAlbum, deleteAlbum, markPlayed, setFeatured } from "@/lib/albums";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const album = await getAlbum(params.id);
  if (!album) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ album });
}

// PATCH records small state changes: putting a record on, or featuring it.
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  let body: { action?: string; featured?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body is fine */
  }

  if (body.action === "played") {
    const album = await markPlayed(params.id);
    return NextResponse.json({ album });
  }
  if (body.action === "featured") {
    const album = await setFeatured(params.id, Boolean(body.featured));
    return NextResponse.json({ album });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await deleteAlbum(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
