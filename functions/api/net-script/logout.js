export async function onRequestPost() {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Set-Cookie": "net_script_session=; HttpOnly; Secure; SameSite=Strict; Path=/net-script; Max-Age=0"
  });
  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}
