function isAuthenticated(request) {

    const cookie =
        request.headers.get("Cookie") || "";

    return cookie
        .split(";")
        .some(cookie =>
            cookie.trim() === "blog_admin=authenticated"
        );

}

export async function onRequestGet(context) {

    if (!isAuthenticated(context.request)) {

        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );

    }

    const result =
        await context.env.BLOG_DB
        .prepare(`
            SELECT
                id,
                title,
                excerpt,
                content,
                created_at,
                published
            FROM posts
            ORDER BY created_at DESC
        `)
        .all();

    return Response.json(result.results);
}


export async function onRequestPost(context) {

    if (!isAuthenticated(context.request)) {

        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );

    }

    try {

        const body =
            await context.request.json();

        const title =
            String(body.title || "").trim();

        const excerpt =
            String(body.excerpt || "").trim();

        const content =
            String(body.content || "").trim();

        if (!title || !content) {

            return Response.json(
                { error: "Title and content are required." },
                { status: 400 }
            );

        }

        await context.env.BLOG_DB
            .prepare(`
                INSERT INTO posts
                (title, excerpt, content, published)
                VALUES (?, ?, ?, 1)
            `)
            .bind(
                title,
                excerpt,
                content
            )
            .run();

        return Response.json({
            success: true
        });

    } catch {

        return Response.json(
            { error: "Unable to create post." },
            { status: 500 }
        );

    }

}


export async function onRequestDelete(context) {

    if (!isAuthenticated(context.request)) {

        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );

    }

    const url =
        new URL(context.request.url);

    const id =
        url.searchParams.get("id");

    if (!id) {

        return Response.json(
            { error: "Missing post ID." },
            { status: 400 }
        );

    }

    await context.env.BLOG_DB
        .prepare(`
            DELETE FROM posts
            WHERE id = ?
        `)
        .bind(id)
        .run();

    return Response.json({
        success: true
    });

}
