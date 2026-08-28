export async function onRequestPost(context) {

    try {

        const body =
            await context.request.json();

        const password =
            body.password || "";

        const expected =
            context.env.BLOG_ADMIN_PASSWORD;

        if (!expected) {

            return Response.json(
                { error: "Admin password is not configured." },
                { status: 500 }
            );

        }

        if (password !== expected) {

            return Response.json(
                { error: "Invalid password." },
                { status: 401 }
            );

        }

        const headers = new Headers();

        headers.set(
            "Set-Cookie",
            "blog_admin=authenticated; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400"
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

    } catch {

        return Response.json(
            { error: "Invalid request." },
            { status: 400 }
        );

    }

}
