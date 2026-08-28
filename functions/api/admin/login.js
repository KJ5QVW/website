export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const password = String(body.password || "");

        const expected = context.env.BLOG_ADMIN_PASSWORD;

        if (!expected) {
            return Response.json(
                {
                    error: "BLOG_ADMIN_PASSWORD is not configured"
                },
                { status: 500 }
            );
        }

        if (password !== expected) {
            return Response.json(
                {
                    error: "Incorrect password"
                },
                { status: 401 }
            );
        }

        const headers = new Headers();

        headers.set(
            "Set-Cookie",
            "blog_admin=authenticated; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400"
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

    } catch (error) {

        return Response.json(
            {
                error: "Invalid request"
            },
            { status: 400 }
        );

    }
}
