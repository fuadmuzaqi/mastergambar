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
        SET title = ?, html_code = ?, css_code = ?, js_code = ?, width = ?, height = ?, fps = ?, duration_seconds = ?, updated_at = datetime('now')
        WHERE id = ?
      `,
      args: [
        String(body.title || 'Untitled Project').trim(),
        String(body.html_code || ''),
        String(body.css_code || ''),
        String(body.js_code || ''),
        Number(body.width || 1080),
        Number(body.height || 1080),
        Number(body.fps || 30),
        Number(body.duration_seconds || 3),
        params.id
      ]
    });

    return json({ ok: true });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}
