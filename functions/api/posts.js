javascript
function isAuthenticated(request) {

    const cookie = request.headers.get("Cookie") || "";

    return cookie
        .split(";")
        .some(cookie =>
            cookie.trim() === "blog_admin=authenticated"
        );

}


/* ==============================
   GET POSTS
   ============================== */

export async function onRequestGet(context) {

    if (!isAuthenticated(context.request)) {

        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );

    }

    try {

        const result = await context.env.BLOG_DB
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

    } catch (error) {

        console.error(error);

        return Response.json(
            { error: "Database error." },
            { status: 500 }
        );

    }

}


/* ==============================
   CREATE POST
   ============================== */

export async function onRequestPost(context) {

    if (!isAuthenticated(context.request)) {

        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );

    }

    try {

        const body = await context.request.json();

        const title = String(body.title || "").trim();

        const excerpt = String(body.excerpt || "").trim();

        const content = String(body.content || "").trim();

        if (!title || !content) {

            return Response.json(
                {
                    error: "Title and content are required."
                },
                { status: 400 }
            );

        }

        const result = await context.env.BLOG_DB
            .prepare(`
                INSERT INTO posts
                (
                    title,
                    excerpt,
                    content,
                    published
                )
                VALUES (?, ?, ?, 1)
            `)
            .bind(
                title,
                excerpt,
                content
            )
            .run();

        return Response.json({
            success: true,
            id: result.meta.last_row_id
        });

    } catch (error) {

        console.error(error);

        return Response.json(
            {
                error: "Unable to create post."
            },
            { status: 500 }
        );

    }

}


/* ==============================
   EDIT POST
   ============================== */

export async function onRequestPut(context) {

    if (!isAuthenticated(context.request)) {

        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );

    }

    try {

        const url = new URL(context.request.url);

        const id = url.searchParams.get("id");

        if (!id) {

            return Response.json(
                {
                    error: "Missing post ID."
                },
                { status: 400 }
            );

        }

        const body = await context.request.json();

        const title = String(body.title || "").trim();

        const excerpt = String(body.excerpt || "").trim();

        const content = String(body.content || "").trim();

        if (!title || !content) {

            return Response.json(
                {
                    error: "Title and content are required."
                },
                { status: 400 }
            );

        }

        const result = await context.env.BLOG_DB
            .prepare(`
                UPDATE posts
                SET
                    title = ?,
                    excerpt = ?,
                    content = ?
                WHERE id = ?
            `)
            .bind(
                title,
                excerpt,
                content,
                id
            )
            .run();

        if (result.meta.changes === 0) {

            return Response.json(
                {
                    error: "Post not found."
                },
                { status: 404 }
            );

        }

        return Response.json({
            success: true,
            updated: Number(result.meta.changes)
        });

    } catch (error) {

        console.error(error);

        return Response.json(
            {
                error: "Unable to update post."
            },
            { status: 500 }
        );

    }

}


/* ==============================
   DELETE POST
   ============================== */

export async function onRequestDelete(context) {

    if (!isAuthenticated(context.request)) {

        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );

    }

    try {

        const url = new URL(context.request.url);

        const id = url.searchParams.get("id");

        if (!id) {

            return Response.json(
                {
                    error: "Missing post ID."
                },
                { status: 400 }
            );

        }

        const result = await context.env.BLOG_DB
            .prepare(`
                DELETE FROM posts
                WHERE id = ?
            `)
            .bind(id)
            .run();

        if (result.meta.changes === 0) {

            return Response.json(
                {
                    error: "Post not found."
                },
                { status: 404 }
            );

        }

        return Response.json({
            success: true,
            deleted: Number(result.meta.changes)
        });

    } catch (error) {

        console.error(error);

        return Response.json(
            {
                error: "Unable to delete post."
            },
            { status: 500 }
        );

    }

}
