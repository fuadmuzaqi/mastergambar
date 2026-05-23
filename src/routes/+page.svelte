<script>
  export let data;

  let title = 'Demo Project';
  let width = 1080;
  let height = 1080;
  let fps = 30;
  let duration_seconds = 3;

  let html_code = `<div class="stage">
  <div class="card">
    <div class="line"></div>
    <h1 id="titleText">Hello Frame</h1>
    <p id="subText">Animasi HTML/CSS/JS per frame untuk export sequence.</p>
    <div class="dot" id="dot"></div>
  </div>
</div>`;

  let css_code = `.stage{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#111827,#0f172a);overflow:hidden;position:relative;font-family:Arial,sans-serif;}
.card{width:72%;padding:44px;border-radius:28px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(8px);position:relative;color:#fff;}
.line{width:120px;height:8px;border-radius:999px;background:#61e7b3;margin-bottom:24px;}
h1{margin:0 0 14px;font-size:64px;line-height:1.05;}
p{margin:0;font-size:28px;color:rgba(255,255,255,.8);max-width:700px;line-height:1.4;}
.dot{position:absolute;left:40px;bottom:32px;width:44px;height:44px;border-radius:999px;background:#61e7b3;}`;

  let js_code = `window.__renderFrame = () => {
  const frame = window.__FRAME__ || 0;
  const fps = window.__FPS__ || 30;
  const time = window.__TIME__ || 0;
  const title = document.getElementById('titleText');
  const sub = document.getElementById('subText');
  const dot = document.getElementById('dot');
  const progress = Math.min(1, time / 3);
  const x = 40 + progress * 700;
  dot.style.transform = 'translateX(' + x + 'px) scale(' + (1 + Math.sin(time * 6) * 0.15) + ')';
  title.style.transform = 'translateY(' + (Math.sin(time * 2) * -10) + 'px)';
  title.textContent = 'Frame ' + (frame + 1);
  sub.textContent = 'Time ' + time.toFixed(2) + 's • ' + fps + ' fps';
};`;

  let loading = false;

  async function createProject() {
    loading = true;

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title,
        html_code,
        css_code,
        js_code,
        width,
        height,
        fps,
        duration_seconds
      })
    });

    const json = await res.json();
    loading = false;

    if (json.id) {
      window.location.href = `/editor/${json.id}`;
      return;
    }

    alert(json.error || 'Gagal membuat project');
  }
</script>

<svelte:head>
  <title>Frame Sequence Tool</title>
</svelte:head>

<div class="container hero">
  <div class="topbar">
    <div>
      <h1>HTML / CSS / JS Frame Tool</h1>
      <p class="muted">
        Buat project kode web, preview per frame, lalu export PNG sequence ZIP untuk After Effects.
      </p>
    </div>
  </div>

  <div class="grid two-col" style="margin-bottom:18px;">
    <section class="card panel">
      <h2>Buat project baru</h2>

      <div class="grid" style="margin-top:14px;">
        <label class="label">
          Judul
          <input class="input" bind:value={title} />
        </label>

        <div class="row">
          <label class="label grow">
            Width
            <input class="input" type="number" bind:value={width} />
          </label>

          <label class="label grow">
            Height
            <input class="input" type="number" bind:value={height} />
          </label>
        </div>

        <div class="row">
          <label class="label grow">
            FPS
            <input class="input" type="number" bind:value={fps} />
          </label>

          <label class="label grow">
            Durasi (detik)
            <input class="input" type="number" bind:value={duration_seconds} />
          </label>
        </div>

        <label class="label">
          HTML
          <textarea class="textarea" bind:value={html_code}></textarea>
        </label>

        <label class="label">
          CSS
          <textarea class="textarea" bind:value={css_code}></textarea>
        </label>

        <label class="label">
          JS
          <textarea class="textarea" bind:value={js_code}></textarea>
        </label>

        <button class="btn btn-primary" on:click={createProject} disabled={loading}>
          {loading ? 'Membuat...' : 'Buat project'}
        </button>
      </div>
    </section>

    <section class="card panel">
      <h2>Workflow</h2>

      <div class="stats" style="margin-top:14px;">
        <div class="stat"><strong>1.</strong><br />Tulis HTML, CSS, JS.</div>
        <div class="stat"><strong>2.</strong><br />Preview hasil render.</div>
        <div class="stat"><strong>3.</strong><br />Export ZIP PNG sequence.</div>
        <div class="stat"><strong>4.</strong><br />Import ke After Effects.</div>
      </div>

      <p class="muted" style="margin-top:14px;">
        Kode JavaScript bisa memakai <code>window.__FRAME__</code>, <code>window.__FPS__</code>,
        <code>window.__TIME__</code>, dan fungsi <code>window.__renderFrame()</code>.
      </p>
    </section>
  </div>

  <section class="card panel">
    <h2>Project tersimpan</h2>

    <div class="grid project-list" style="margin-top:14px;">
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
