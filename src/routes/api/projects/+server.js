import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { randomUUID } from 'crypto';

export async function POST({ request }) {
  try {
    const body = await request.json();

    const id = randomUUID();
    const title = String(body.title || 'Untitled Project').trim();
    const html_code = String(body.html_code || '');
    const css_code = String(body.css_code || '');
    const js_code = String(body.js_code || '');
    const width = Number(body.width || 1080);
    const height = Number(body.height || 1080);
    const fps = Number(body.fps || 30);
    const duration = Number(body.duration_seconds || 3);

    await db.execute({
      sql: `
        INSERT INTO projects (
          id, title, html_code, css_code, js_code, width, height, fps, duration_seconds, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
      args: [id, title, html_code, css_code, js_code, width, height, fps, duration]
    });

    return json({ id });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}
