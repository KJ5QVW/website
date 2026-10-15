function isAuthenticated(request) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.split(";").some(value => value.trim() === "blog_admin=authenticated");
}

async function ensureTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS on_air_status (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      on_air INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  await db.prepare(`
    INSERT OR IGNORE INTO on_air_status (id, on_air) VALUES (1, 0)
  `).run();
}

export async function onRequestGet({ env }) {
  try {
    await ensureTable(env.BLOG_DB);
    const row = await env.BLOG_DB.prepare(
      "SELECT on_air, updated_at FROM on_air_status WHERE id = 1"
    ).first();
    return Response.json({
      onAir: Boolean(row?.on_air),
      updatedAt: row?.updated_at || null
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to read on-air status." }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  if (!isAuthenticated(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (typeof body.onAir !== "boolean") {
      return Response.json({ error: "onAir must be true or false." }, { status: 400 });
    }

    await ensureTable(env.BLOG_DB);
    await env.BLOG_DB.prepare(`
      UPDATE on_air_status
      SET on_air = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).bind(body.onAir ? 1 : 0).run();

    return Response.json({ success: true, onAir: body.onAir });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to update on-air status." }, { status: 500 });
  }
}
