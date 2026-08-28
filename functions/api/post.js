export async function onRequestGet(context) {

    const url = new URL(context.request.url);

    const id = url.searchParams.get("id");

    if (!id) {

        return Response.json(
            { error: "Missing post ID" },
            { status: 400 }
        );

    }

    const post = await context.env.BLOG_DB
        .prepare(`
            SELECT
                id,
                title,
                excerpt,
                content,
                created_at
            FROM posts
            WHERE id = ?
            AND published = 1
        `)
        .bind(id)
        .first();

    if (!post) {

        return Response.json(
            { error: "Post not found" },
            { status: 404 }
        );

    }

    return Response.json(post);
}
