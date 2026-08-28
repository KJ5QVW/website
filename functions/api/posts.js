export async function onRequestGet(context) {

    const result = await context.env.BLOG_DB
        .prepare(`
            SELECT
                id,
                title,
                excerpt,
                created_at
            FROM posts
            WHERE published = 1
            ORDER BY created_at DESC
        `)
        .all();

    return Response.json(result.results);
}
