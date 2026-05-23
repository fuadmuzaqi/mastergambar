<script>
  export let data;
  let title = 'Demo Sequence';
  let subtitle = 'Frame sequence untuk After Effects dari SvelteKit + Turso.';
  let width = 1920;
  let height = 1080;
  let fps = 30;
  let duration_seconds = 3;
  let accent = '#6ee7b7';
  let bg = '#111827';
  let loading = false;

  async function createProject() {
    loading = true;
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title, subtitle, width, height, fps, duration_seconds, accent, bg })
    });
    const json = await res.json();
    loading = false;
    if (json.id) window.location.href = `/editor/${json.id}`;
    else alert(json.error || 'Gagal membuat project');
  }
</script>

<svelte:head>
  <title>Frame Sequence Tool</title>
</svelte:head>

<div class="container hero">
  <div class="topbar">
    <div>
      <h1>Frame Sequence Tool</h1>
      <p class="muted">Bikin project animasi, preview frame, lalu export PNG sequence ZIP untuk diimport ke After Effects.</p>
    </div>
  </div>

  <div class="grid" style="grid-template-columns: 1.05fr 1.4fr; margin-bottom: 18px;">
    <section class="card panel">
      <h2>Buat project baru</h2>
      <div class="grid" style="margin-top: 14px;">
        <label class="label">Judul
          <input class="input" bind:value={title} />
        </label>
        <label class="label">Subjudul
          <textarea class="textarea" bind:value={subtitle}></textarea>
        </label>
        <div class="row">
          <label class="label" style="flex:1;">Width
            <input class="input" type="number" bind:value={width} />
          </label>
          <label class="label" style="flex:1;">Height
            <input class="input" type="number" bind:value={height} />
          </label>
        </div>
        <div class="row">
          <label class="label" style="flex:1;">FPS
            <input class="input" type="number" bind:value={fps} />
          </label>
          <label class="label" style="flex:1;">Durasi (detik)
            <input class="input" type="number" bind:value={duration_seconds} />
          </label>
        </div>
        <div class="row">
          <label class="label" style="flex:1;">Accent
            <input class="input" bind:value={accent} />
          </label>
          <label class="label" style="flex:1;">Background
            <input class="input" bind:value={bg} />
          </label>
        </div>
        <button class="btn btn-primary" on:click={createProject} disabled={loading}>
          {loading ? 'Membuat...' : 'Buat project'}
        </button>
      </div>
    </section>

    <section class="card panel">
      <h2>Workflow</h2>
      <div class="stats" style="margin-top: 14px;">
        <div class="stat"><strong>1.</strong><br />Buat project scene.</div>
        <div class="stat"><strong>2.</strong><br />Preview animasi per frame.</div>
        <div class="stat"><strong>3.</strong><br />Export ZIP PNG sequence.</div>
        <div class="stat"><strong>4.</strong><br />Import ke After Effects.</div>
      </div>
      <p class="muted" style="margin-top: 14px;">Tool ini sengaja dibuat ringan: data project disimpan di Turso, sedangkan export sequence dilakukan di browser agar cocok untuk deploy di Vercel.</p>
    </section>
  </div>

  <section class="card panel">
    <h2>Project tersimpan</h2>
    <div class="grid project-list" style="margin-top: 14px;">
      {#if data.projects.length}
        {#each data.projects as project}
          <a class="project-card card" href={`/editor/${project.id}`}>
            <div>
              <strong>{project.title}</strong>
              <div class="muted">{project.width}x{project.height} · {project.fps} fps · {project.duration_seconds}s</div>
            </div>
            <div class="muted">ID: <code>{project.id}</code></div>
          </a>
        {/each}
      {:else}
        <div class="project-card card">Belum ada project.</div>
      {/if}
    </div>
  </section>
</div>
