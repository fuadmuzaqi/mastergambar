<script>
  import { onMount } from 'svelte';
  import { drawFrame } from '$lib/canvas';
  import { createZipBlob } from '$lib/zip';

  export let params;

  let canvas;
  let ctx;
  let project = null;
  let loading = true;
  let saving = false;
  let exporting = false;
  let frameIndex = 0;
  let totalFrames = 90;
  let progress = 0;

  onMount(async () => {
    const res = await fetch(`/api/projects/${params.id}`);
    const json = await res.json();
    if (json.project) {
      project = {
        ...json.project,
        width: Number(json.project.width),
        height: Number(json.project.height),
        fps: Number(json.project.fps),
        duration_seconds: Number(json.project.duration_seconds)
      };
      totalFrames = project.fps * project.duration_seconds;
      setupCanvas();
      renderPreview();
    } else {
      alert(json.error || 'Project tidak ditemukan');
    }
    loading = false;
  });

  function setupCanvas() {
    canvas.width = project.width;
    canvas.height = project.height;
    ctx = canvas.getContext('2d');
  }

  function renderPreview() {
    if (!ctx || !project) return;
    drawFrame(ctx, { ...project, totalFrames }, frameIndex);
  }

  async function saveProject() {
    saving = true;
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(project)
    });
    const json = await res.json();
    saving = false;
    if (!json.ok) alert(json.error || 'Gagal simpan');
    totalFrames = project.fps * project.duration_seconds;
    setupCanvas();
    renderPreview();
  }

  function dataUrlToBytes(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function exportSequence() {
    exporting = true;
    progress = 0;
    totalFrames = project.fps * project.duration_seconds;
    const files = [];

    for (let i = 0; i < totalFrames; i += 1) {
      frameIndex = i;
      renderPreview();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const url = canvas.toDataURL('image/png');
      const bytes = dataUrlToBytes(url);
      const name = `frame-${String(i + 1).padStart(6, '0')}.png`;
      files.push({ name, bytes });
      progress = Math.round(((i + 1) / totalFrames) * 100);
    }

    const zipBlob = await createZipBlob(files);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'sequence'}-${project.width}x${project.height}-${project.fps}fps.zip`;
    link.click();
    exporting = false;
  }
</script>

<svelte:head>
  <title>Editor Project</title>
</svelte:head>

{#if loading}
  <div class="container hero"><div class="card panel">Memuat...</div></div>
{:else if project}
  <div class="container hero">
    <div class="topbar">
      <div>
        <a class="muted" href="/">← Kembali</a>
        <h1 style="margin-top:8px;">Editor Project</h1>
      </div>
      <div class="row">
        <button class="btn btn-secondary" on:click={saveProject} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        <button class="btn btn-primary" on:click={exportSequence} disabled={exporting}>{exporting ? `Export ${progress}%` : 'Export PNG ZIP'}</button>
      </div>
    </div>

    <div class="grid editor-grid">
      <section class="card panel">
        <div class="grid">
          <label class="label">Judul
            <input class="input" bind:value={project.title} />
          </label>
          <label class="label">Subjudul
            <textarea class="textarea" bind:value={project.subtitle}></textarea>
          </label>
          <div class="row">
            <label class="label" style="flex:1;">Width
              <input class="input" type="number" bind:value={project.width} />
            </label>
            <label class="label" style="flex:1;">Height
              <input class="input" type="number" bind:value={project.height} />
            </label>
          </div>
          <div class="row">
            <label class="label" style="flex:1;">FPS
              <input class="input" type="number" bind:value={project.fps} />
            </label>
            <label class="label" style="flex:1;">Durasi
              <input class="input" type="number" bind:value={project.duration_seconds} />
            </label>
          </div>
          <div class="row">
            <label class="label" style="flex:1;">Accent
              <input class="input" bind:value={project.accent} />
            </label>
            <label class="label" style="flex:1;">Background
              <input class="input" bind:value={project.bg} />
            </label>
          </div>
          <label class="label">Frame preview
            <input class="input" type="range" min="0" max={Math.max(0, totalFrames - 1)} bind:value={frameIndex} on:input={renderPreview} />
          </label>
          <div class="muted">Frame {frameIndex + 1} / {totalFrames}</div>
        </div>
      </section>

      <section class="card canvas-wrap">
        <canvas bind:this={canvas} class="preview-canvas"></canvas>
      </section>
    </div>
  </div>
{/if}
