import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { randomUUID } from 'crypto';

export async function POST({ request }) {
  try {
    const body = await request.json();
    const id = randomUUID();
    const title = String(body.title || 'Untitled').trim();
    const subtitle = String(body.subtitle || '').trim();
    const width = Number(body.width || 1920);
    const height = Number(body.height || 1080);
    const fps = Number(body.fps || 30);
    const duration = Number(body.duration_seconds || 3);
    const accent = String(body.accent || '#6ee7b7').trim();
    const bg = String(body.bg || '#111827').trim();

    await db.execute({
      sql: `
        INSERT INTO projects (
          id, title, subtitle, width, height, fps, duration_seconds, accent, bg, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
      args: [id, title, subtitle, width, height, fps, duration, accent, bg]
    });

    return json({ id });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}
