<script>
  import { onMount } from 'svelte';
  import { createZipBlob } from '$lib/zip';

  export let data;

  let project = null;
  let loading = true;
  let saving = false;
  let exporting = false;
  let frameIndex = 0;
  let totalFrames = 90;
  let progress = 0;
  let previewHost;

  onMount(async () => {
    try {
      await ensureHtml2Canvas();

      const res = await fetch(`/api/projects/${data.id}`);
      const json = await res.json();

      if (!res.ok || !json.project) {
        alert(json.error || 'Project tidak ditemukan');
        loading = false;
        return;
      }

      project = {
        ...json.project,
        width: Number(json.project.width),
        height: Number(json.project.height),
        fps: Number(json.project.fps),
        duration_seconds: Number(json.project.duration_seconds)
      };

      totalFrames = project.fps * project.duration_seconds;
      await renderPreview();
    } catch (err) {
      console.error(err);
      alert('Gagal memuat editor: ' + err.message);
    } finally {
      loading = false;
    }
  });

  async function ensureHtml2Canvas() {
    if (window.html2canvas) return;

    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-html2canvas]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      script.dataset.html2canvas = 'true';
      script.onload = resolve;
      script.onerror = () => reject(new Error('html2canvas gagal dimuat'));
      document.head.appendChild(script);
    });
  }

  async function renderPreview() {
    if (!project || !previewHost) return;

    totalFrames = project.fps * project.duration_seconds;
    previewHost.style.width = project.width + 'px';
    previewHost.style.height = project.height + 'px';
    previewHost.innerHTML = `<style>${project.css_code}</style>${project.html_code}`;

    window.__FRAME__ = Number(frameIndex);
    window.__FPS__ = Number(project.fps);
    window.__TIME__ = Number(frameIndex) / Number(project.fps);
    window.__DURATION__ = Number(project.duration_seconds);

    try {
      window.__renderFrame = undefined;
      const runner = new Function(
        project.js_code +
          '\n;return typeof window.__renderFrame === "function" ? window.__renderFrame : null;'
      );
      const fn = runner();
      if (typeof fn === 'function') fn();
    } catch (err) {
      console.error(err);
      alert('JS error: ' + err.message);
    }

    fitPreview();
  }

  function fitPreview() {
    const wrapper = previewHost?.parentElement;
    if (!wrapper || !project) return;

    const maxW = wrapper.clientWidth - 20;
    const scale = Math.min(1, maxW / Number(project.width || 1080));

    previewHost.style.transform = `scale(${scale})`;
    previewHost.style.transformOrigin = 'top left';
    wrapper.style.minHeight = Math.max(420, Number(project.height || 1080) * scale + 20) + 'px';
  }

  async function saveProject() {
    if (!project) return;

    saving = true;
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(project)
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        alert(json.error || 'Gagal simpan');
        return;
      }

      await renderPreview();
    } catch (err) {
      alert('Gagal simpan: ' + err.message);
    } finally {
      saving = false;
    }
  }

  function dataUrlToBytes(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  }

  async function exportSequence() {
    if (!project || !window.html2canvas) return;

    exporting = true;
    progress = 0;
    totalFrames = project.fps * project.duration_seconds;

    try {
      const files = [];

      for (let i = 0; i < totalFrames; i += 1) {
        frameIndex = i;
        await renderPreview();
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const canvas = await window.html2canvas(previewHost, {
          backgroundColor: null,
          width: project.width,
          height: project.height,
          scale: 1,
          useCORS: true
        });

        const url = canvas.toDataURL('image/png');
        const bytes = dataUrlToBytes(url);

        files.push({
          name: `frame-${String(i + 1).padStart(6, '0')}.png`,
          bytes
        });

        progress = Math.round(((i + 1) / totalFrames) * 100);
      }

      const zipBlob = await createZipBlob(files);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'sequence'}-${project.width}x${project.height}-${project.fps}fps.zip`;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Export gagal: ' + err.message);
    } finally {
      exporting = false;
    }
  }
</script>

<svelte:head>
  <title>Editor Project</title>
</svelte:head>

{#if loading}
  <div class="container hero">
    <div class="card panel">Memuat...</div>
  </div>
{:else if project}
  <div class="container hero">
    <div class="topbar">
      <div>
        <a class="muted" href="/">← Kembali</a>
        <h1 style="margin-top:8px;">Editor HTML / CSS / JS</h1>
      </div>

      <div class="row">
        <button class="btn btn-secondary" on:click={saveProject} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>

        <button class="btn btn-primary" on:click={exportSequence} disabled={exporting}>
          {exporting ? `Export ${progress}%` : 'Export PNG ZIP'}
        </button>
      </div>
    </div>

    <div class="grid editor-grid">
      <section class="card panel">
        <div class="grid">
          <label class="label">
            Judul
            <input class="input" bind:value={project.title} />
          </label>

          <div class="row">
            <label class="label grow">
              Width
              <input class="input" type="number" bind:value={project.width} />
            </label>

            <label class="label grow">
              Height
              <input class="input" type="number" bind:value={project.height} />
            </label>
          </div>

          <div class="row">
            <label class="label grow">
              FPS
              <input class="input" type="number" bind:value={project.fps} />
            </label>

            <label class="label grow">
              Durasi
              <input class="input" type="number" bind:value={project.duration_seconds} />
            </label>
          </div>

          <label class="label">
            HTML
            <textarea class="textarea" bind:value={project.html_code}></textarea>
          </label>

          <label class="label">
            CSS
            <textarea class="textarea" bind:value={project.css_code}></textarea>
          </label>

          <label class="label">
            JS
            <textarea class="textarea" bind:value={project.js_code}></textarea>
          </label>

          <label class="label">
            Frame preview
            <input
              class="input"
              type="range"
              min="0"
              max={Math.max(0, totalFrames - 1)}
              bind:value={frameIndex}
              on:input={renderPreview}
            />
          </label>

          <div class="muted">Frame {frameIndex + 1} / {totalFrames}</div>

          <div class="muted">
            JS bisa memakai <code>window.__FRAME__</code>, <code>window.__FPS__</code>,
            <code>window.__TIME__</code>, <code>window.__DURATION__</code>, lalu mendefinisikan
            <code>window.__renderFrame = () => {}</code>.
          </div>

          <button class="btn btn-secondary" on:click={renderPreview}>Render Preview</button>
        </div>
      </section>

      <section class="card canvas-wrap">
        <div class="preview-shell">
          <div
            bind:this={previewHost}
            class="preview-canvas"
            style="display:block;max-width:none;background:#fff;"
          ></div>
        </div>
      </section>
    </div>
  </div>
{:else}
  <div class="container hero">
    <div class="card panel">Project tidak ditemukan.</div>
  </div>
{/if}

<svelte:window on:resize={fitPreview} />
