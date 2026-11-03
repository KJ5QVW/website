function base64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export async function onRequestPost(context) {
  try {
    const password = String((await context.request.json()).password || "");
    const expected = context.env.NET_SCRIPT_PASSWORD;
    const secret = context.env.NET_SCRIPT_SESSION_SECRET;
    if (!expected || !secret || secret.length < 32) {
      return Response.json({ error: "Net-script password is not configured correctly." }, { status: 503 });
    }
    if (password !== expected) {
      return Response.json({ error: "Incorrect password." }, { status: 401 });
    }
    const payload = base64url(new TextEncoder().encode(JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12
    })));
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signature = base64url(await crypto.subtle.sign(
      "HMAC", key, new TextEncoder().encode(payload)
    ));
    const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" });
    headers.append("Set-Cookie",
      "net_script_session=" + payload + "." + signature + "; HttpOnly; Secure; SameSite=Strict; Path=/net-script; Max-Age=43200"
    );
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch {
    return Response.json({ error: "Invalid sign-in request." }, { status: 400 });
  }
}
