export async function onRequestPost() {

    const headers = new Headers();

    headers.set(
        "Set-Cookie",
        "blog_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
    );

    headers.set(
        "Content-Type",
        "application/json"
    );

    return new Response(
        JSON.stringify({
            success: true
        }),
        {
            status: 200,
            headers
        }
    );

}
