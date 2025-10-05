<!-- src/CodeView.svelte -->
<script lang="ts">
  type Props = {
    code?: string;
    language?: "css" | "html";
    title?: string;
    showCopyButton?: boolean;
    showLineNumbers?: boolean;
    editable?: boolean;
  };

  let {
    code = $bindable(""),
    language = "css",
    title = "Code",
    showCopyButton = true,
    showLineNumbers = false,
    editable = false,
  }: Props = $props();

  let copied = $state(false);
  let ta: HTMLTextAreaElement | null = $state(null);
  let gutterEl: HTMLDivElement | null = $state(null);

  function escapeHtml(s: string) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalize(raw: string): string {
    if (!raw) return "";
    let s = raw.replace(/\r\n/g, "\n");
    const lines = s.split("\n");
    let firstNonEmpty = 0;
    while (firstNonEmpty < lines.length && lines[firstNonEmpty].trim() === "") {
      firstNonEmpty++;
    }
    if (firstNonEmpty === lines.length) return "";
    const trimmedLines = lines.slice(firstNonEmpty);
    return trimmedLines.join("\n");
  }

  function hlCSS(safe: string): string {
    return safe
      .replace(/\/\*[\s\S]*?\*\//g, '<span class="cv-comment">$&</span>')
      .replace(/([a-z-]+)\s*:/gi, '<span class="cv-attr">$1</span>:')
      .replace(/:\s*([^;\n]+);?/g, ': <span class="cv-val">$1</span>')
      .replace(/\.([\w-]+)/g, '<span class="cv-tag">.$1</span>')
      .replace(/#([\w-]+)/g, '<span class="cv-tag">#$1</span>');
  }

  function hlHTML(safe: string): string {
    let result = safe.replace(
      /(&lt;style[^&]*?&gt;)([\s\S]*?)(&lt;\/style&gt;)/gi,
      (match, startTag, cssContent, endTag) => {
        const highlightedCSS = hlCSS(cssContent);
        return `${startTag}${highlightedCSS}${endTag}`;
      }
    );

    result = result
      .replace(
        /&lt;(\/?)([A-Za-z][\w:-]*)(?=[\s&gt;])/g,
        (_m, slash, name) => `&lt;${slash}<span class="cv-tag">${name}</span>`
      )
      .replace(
        /([A-Za-z_:][-A-Za-z0-9_:.]*)(=)(&quot;[^&]*?&quot;)/g,
        (_m, attr, eq, val) =>
          `<span class="cv-attr">${attr}</span>${eq}<span class="cv-val">${val}</span>`
      )
      .replace(
        /&lt;!--([\s\S]*?)--&gt;/g,
        `<span class="cv-comment">&lt;!--$1--&gt;</span>`
      );

    return result;
  }

  function highlight(raw: string): string {
    if (!raw) return "";
    const cleaned = normalize(raw);
    const safe = escapeHtml(cleaned);
    if (language === "css") return hlCSS(safe);
    if (language === "html") return hlHTML(safe);
    return safe;
  }

  const displayed = $derived(normalize(code).trim()); 
  const formatted = $derived(
    ["css", "html"].includes(language)
      ? highlight(displayed)
      : escapeHtml(displayed)
  );
  const lines = $derived(displayed.split("\n"));

  function syncGutterScroll() {
    if (gutterEl && ta) gutterEl.scrollTop = ta.scrollTop;
  }

  $effect(() => {
    if (!editable || !ta) return;
    requestAnimationFrame(() => {
      if (ta) {
        ta.style.height = "0px";
        ta.style.height = ta.scrollHeight + "px";
      }
      syncGutterScroll();
    });
  });

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="cv">
  <div class="cv-head">
    <div>{title}</div>
    {#if showCopyButton}
      <button
        class="cv-copy-btn {copied ? 'copied' : ''}"
        onclick={() => copyToClipboard(displayed)}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    {/if}
  </div>

  <div class="cv-body {editable ? 'is-editable' : ''}">
    {#if showLineNumbers}
      <div class="cv-gutter" bind:this={gutterEl}>
        {#each lines as _, i}
          <div>{i + 1}</div>
        {/each}
      </div>
    {/if}

    {#if editable}
      <textarea
        bind:this={ta}
        bind:value={code}
        class="cv-textarea"
        spellcheck="false"
        onscroll={syncGutterScroll}
      ></textarea>
    {:else}
      <pre><code>{@html formatted}</code></pre>
    {/if}
  </div>
</div>

<style>
  .cv {
    --cv-bg: #fff;
    --cv-fg: #1e1e1e;
    --cv-border: #e1e4e8;
    --cv-head-bg: #f6f8fa;
    --cv-head-fg: #24292e;
    --cv-muted: #6a737d;
    --cv-btn-bg: #569cd6;
    --cv-btn-bg-hover: #4a8bc2;
    --cv-btn-copied: #6a9955;

    border: 1px solid var(--cv-border);
    border-radius: 8px;
    overflow: hidden;
    font-family: "Fira Code", monospace;
    background: var(--cv-bg);
    color: var(--cv-fg);
  }

  .cv-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--cv-head-bg);
    color: var(--cv-head-fg);
    font-size: 12px;
    padding: 6px 10px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .cv-copy-btn {
    padding: 4px 12px;
    font-size: 12px;
    border: none;
    border-radius: 4px;
    background: var(--cv-btn-bg);
    color: #fff;
    cursor: pointer;
  }
  .cv-copy-btn:hover {
    background: var(--cv-btn-bg-hover);
  }
  .cv-copy-btn.copied {
    background: var(--cv-btn-copied);
  }

  .cv-body {
    display: flex;
    font-size: 13px;
    line-height: 1.4;
    overflow-x: auto;
  }

  .cv-textarea {
    flex: 1;
    min-height: 120px;
    max-height: 240px;
    border: none;
    outline: none;
    resize: vertical;
    padding: 8px;
    background: var(--cv-bg);
    color: var(--cv-fg);
    font-family: "Fira Code", monospace;
    line-height: 1.4;
    overflow-y: auto;
  }

  pre {
    margin: 0;
    padding: 8px;
    background: transparent;
    flex: 1;
    overflow: auto;
    max-height: 240px;
    line-height: 1.4;
  }

  code {
    white-space: pre;
    line-height: 1.4;
  }

  .cv-gutter {
    flex-shrink: 0;
    padding: 8px 6px 8px 8px;
    text-align: right;
    color: var(--cv-muted);
    user-select: none;
    background: var(--cv-bg);
    border-right: 1px solid var(--cv-border);
    min-width: 32px;
    font-size: 12px;
    max-height: 240px;
    overflow: hidden;
  }

  .cv-gutter div {
    line-height: 1.4;
    height: 18.2px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  :global([data-theme="dark"]) .cv {
    --cv-bg: #1e1e1e;
    --cv-fg: #d4d4d4;
    --cv-border: #3e3e42;
    --cv-head-bg: #2d2d30;
    --cv-head-fg: #cccccc;
    --cv-muted: #858585;
    --cv-btn-bg: #569cd6;
    --cv-btn-bg-hover: #4a8bc2;
    --cv-btn-copied: #6a9955;
  }
</style>
