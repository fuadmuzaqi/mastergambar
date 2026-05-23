import { json } from '@sveltejs/kit';
import { db } from '$lib/db';

export async function GET({ params }) {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM projects WHERE id = ? LIMIT 1`,
      args: [params.id]
    });

    if (!result.rows.length) {
      return json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }

    return json({ project: result.rows[0] });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function PUT({ params, request }) {
  try {
    const body = await request.json();
    await db.execute({
      sql: `
        UPDATE projects
        SET title = ?, subtitle = ?, width = ?, height = ?, fps = ?, duration_seconds = ?, accent = ?, bg = ?, updated_at = datetime('now')
        WHERE id = ?
      `,
      args: [
        body.title,
        body.subtitle,
        Number(body.width),
        Number(body.height),
        Number(body.fps),
        Number(body.duration_seconds),
        body.accent,
        body.bg,
        params.id
      ]
    });

    return json({ ok: true });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}
