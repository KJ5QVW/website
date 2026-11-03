const COOKIE = "net_script_session";

function base64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromBase64url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(normalized), c => c.charCodeAt(0));
}

async function verifySession(token, secret) {
  if (!token || !secret) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC", key, fromBase64url(signature), new TextEncoder().encode(payload)
    );
    if (!valid) return false;
    const data = JSON.parse(new TextDecoder().decode(fromBase64url(payload)));
    return Number(data.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function loginPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#07111f"><title>Private Net Script | KJ5QVW</title><style>
  *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:22px;background:#07111f;color:#f4f7fb;font:16px/1.6 system-ui,sans-serif}.card{width:min(100%,420px);padding:30px;background:#0d1b2d;border:1px solid #1b3149;border-radius:14px}h1{margin:0 0 8px;font-size:28px}p{color:#9eafc2}label{display:block;margin:20px 0 7px;font-size:14px}input{width:100%;padding:12px;border:1px solid #29425f;border-radius:7px;background:#061326;color:#fff;font:inherit}button{width:100%;margin-top:14px;padding:12px;border:0;border-radius:7px;background:#4da3ff;color:#061326;font-weight:750;font:inherit;cursor:pointer}#error{min-height:24px;color:#ff9b9b;font-size:14px}a{color:#4da3ff}
  </style></head><body><main class="card"><h1>Net Control Script</h1><p>This page is private. Enter the separate net-script password to continue.</p><form id="login"><label for="password">Password</label><input id="password" type="password" autocomplete="current-password" required autofocus><button type="submit">Unlock script</button><p id="error" role="status"></p></form><p><a href="/">Return to KJ5QVW</a></p></main><script>
  const form=document.getElementById("login"),error=document.getElementById("error");
  form.addEventListener("submit",async e=>{e.preventDefault();error.textContent="Checking…";try{const r=await fetch("/api/net-script/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:document.getElementById("password").value})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Unable to sign in.");location.reload()}catch(err){error.textContent=err.message;document.getElementById("password").select()}});
  </script></body></html>`;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (!url.pathname.startsWith("/net-script")) return context.next();
  const token = (context.request.headers.get("Cookie") || "")
    .split(";").map(v => v.trim()).find(v => v.startsWith(COOKIE + "="))
    ?.slice(COOKIE.length + 1);
  const ok = await verifySession(token, context.env.NET_SCRIPT_SESSION_SECRET);
  if (ok) return context.next();
  return new Response(loginPage(), {
    status: 401,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin"
    }
  });
}
