import { db } from '$lib/db';

export async function load() {
  const result = await db.execute(`
    SELECT id, title, width, height, fps, duration_seconds, created_at, updated_at
    FROM projects
    ORDER BY updated_at DESC
  `);

  return {
    projects: result.rows
  };
}
