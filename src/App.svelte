<!-- src/App.svelte -->
<script lang="ts">
  import { setContext } from "svelte";
  import { validateCssString } from "./CssValidator.svelte";
  import CodeView from "./CodeView.svelte";

  const version = "v1.0.0";

  // Dark/Light Theme Toggle
  type Theme = "light" | "dark";
  let theme = $state<Theme>("light");

  setContext("theme", {
    get theme() {
      return theme;
    },
  });

  function toggle() {
    theme = theme === "light" ? "dark" : "light";
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }

  // Localization
  type Language = "en" | "ru";

  const translations = {
    en: {
      title: "CSS Playground",
      selectLabel: "Component:",
      editorCSS: "Editor CSS",
      compile: "Compile",
      clear: "Clear",
      errorsTitle: "Validation errors:",
      editor: "Editor",
      preview: "Preview",
      cssTitle: "Compiled CSS",
      language: "Language:",
      showHTML: "Show HTML",
      htmlCssTitle: "HTML + CSS",
      resultHTMLCSS: "Result HTML+CSS",
      resultCSS: "Result CSS",
      components: {
        button: "Button",
        input: "Input",
        select: "Select",
        textarea: "Textarea",
        table: "Table",
        checkbox: "Checkbox",
        radio: "Radio",
        progress: "Progress",
        range: "Range",
        details: "Details",
      },
      htmlContent: {
        clickMe: "Click me",
        typeHere: "Type here...",
        writeSomething: "Write something...",
        optionA: "Option A",
        optionB: "Option B",
        optionC: "Option C",
        header1: "Header 1",
        header2: "Header 2",
        cellA1: "Cell A1",
        cellA2: "Cell A2",
        cellB1: "Cell B1",
        cellB2: "Cell B2",
        checkMe: "Check me",
        option1: "Option 1",
        option2: "Option 2",
        clickToExpand: "Click to expand",
        hiddenDetails: "Hidden details here",
      },
    },
    ru: {
      title: "CSS Песочница",
      selectLabel: "Компонент:",
      editorCSS: "Редактор CSS",
      compile: "Скомпилировать",
      clear: "Очистить",
      errorsTitle: "Ошибки валидации:",
      editor: "Редактор",
      preview: "Предпросмотр",
      cssTitle: "Скомпилированный CSS",
      language: "Язык:",
      showHTML: "Показать HTML",
      htmlCssTitle: "HTML + CSS",
      resultHTMLCSS: "Результат HTML+CSS",
      resultCSS: "Результат CSS",
      components: {
        button: "Кнопка",
        input: "Поле ввода",
        select: "Выпадающий список",
        textarea: "Текстовая область",
        table: "Таблица",
        checkbox: "Чекбокс",
        radio: "Радиокнопка",
        progress: "Прогресс",
        range: "Ползунок",
        details: "Детали",
      },
      htmlContent: {
        clickMe: "Нажми меня",
        typeHere: "Введите текст...",
        writeSomething: "Напишите что-нибудь...",
        optionA: "Опция А",
        optionB: "Опция Б",
        optionC: "Опция В",
        header1: "Заголовок 1",
        header2: "Заголовок 2",
        cellA1: "Ячейка А1",
        cellA2: "Ячейка А2",
        cellB1: "Ячейка Б1",
        cellB2: "Ячейка Б2",
        checkMe: "Выберите меня",
        option1: "Вариант 1",
        option2: "Вариант 2",
        clickToExpand: "Нажмите чтобы раскрыть",
        hiddenDetails: "Скрытые детали здесь",
      },
    },
  };

  let currentLanguage: Language = $state("en");
  let L = $derived(translations[currentLanguage]);

  let presets: Record<
    | "button"
    | "input"
    | "select"
    | "textarea"
    | "table"
    | "checkbox"
    | "radio"
    | "progress"
    | "range"
    | "details",
    string
  > = {
    button: `color: white;
background-color: blue;
padding: 8px 16px;
border-radius: 4px;
border: none;
cursor: pointer;`,

    input: `color: #222;
padding: 8px 12px;
border: 1px solid #ccc;
border-radius: 4px;`,

    select: `color: #222;
padding: 6px 10px;
border: 1px solid #ccc;
border-radius: 4px;
background-color: white;`,

    textarea: `color: #222;
padding: 8px 12px;
border: 1px solid #ccc;
border-radius: 4px;
resize: vertical;`,

    table: `width: 100%;
border-collapse: collapse;`,

    checkbox: `accent-color: #4299e1;
margin-right: 6px;`,

    radio: `accent-color: #e53e3e;
margin-right: 6px;`,

    progress: `width: 100%;
height: 16px;`,

    range: `width: 100%;
accent-color: #48bb78;`,

    details: `border: 1px solid #ccc;
border-radius: 4px;
padding: 8px;`,
  };

  type ComponentType = keyof typeof presets;
  let componentType: ComponentType = $state("button");
  let cssInput = $derived(presets[componentType]);

  $effect(() => {
    return () => {
      const styleEl = document.querySelector("style[data-playground]");
      if (styleEl) styleEl.remove();
    };
  });

  let errors: string[] = $state([]);
  let compiledCss = $state("");

  function css(
    ...chunks: (
      | string
      | Record<string, string>
      | { __mode?: "inline" | "block"; __selector?: string }
    )[]
  ): string {
    const result: string[] = [];
    let mode: "inline" | "block" = "inline";
    let selector = "";

    for (const chunk of chunks) {
      if (!chunk) continue;
      if (
        typeof chunk === "object" &&
        ("__mode" in chunk || "__selector" in chunk)
      ) {
        if ("__mode" in chunk)
          mode = (chunk.__mode as "inline" | "block") ?? "inline";
        if ("__selector" in chunk) selector = chunk.__selector ?? "";
        continue;
      }
      if (typeof chunk === "string") {
        const trimmed = chunk.trim();
        if (!trimmed) continue;
        result.push(/[;}]$/.test(trimmed) ? trimmed : trimmed + ";");
      } else {
        for (const [key, value] of Object.entries(chunk)) {
          const cssVar = key.startsWith("--") ? key : `--${key}`;
          result.push(`${cssVar}: ${value};`);
        }
      }
    }
    if (mode === "block") {
      const body = result.join("\n");
      return selector ? `${selector} {\n${body}\n}` : body;
    }
    return result.join(" ");
  }

  let compiledHtml = $state("");

  function compileStyles() {
    try {
      errors = validateCssString(cssInput);
      compiledCss = css(
        { __mode: "block", __selector: ".playground-el" },
        cssInput
      );

      compiledHtml = generateComponentHtml(componentType);

      if (typeof document !== "undefined") {
        let styleEl = document.querySelector("style[data-playground]");
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.setAttribute("data-playground", "true");
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = compiledCss;
      }
    } catch (error) {
      errors = [`Compilation error: ${(error as Error).message}`];
    }
  }

  function generateComponentHtml(type: ComponentType): string {
    const components = {
      button: `<button class="playground-el">${L.htmlContent.clickMe}</button>`,
      input: `<input class="playground-el" placeholder="${L.htmlContent.typeHere}" />`,
      select: `<select class="playground-el">
  <option>${L.htmlContent.optionA}</option>
  <option>${L.htmlContent.optionB}</option>
  <option>${L.htmlContent.optionC}</option>
</select>`,
      textarea: `<textarea class="playground-el" rows="4" cols="30" placeholder="${L.htmlContent.writeSomething}"></textarea>`,
      table: `<table class="playground-el">
  <thead>
    <tr>
      <th>${L.htmlContent.header1}</th>
      <th>${L.htmlContent.header2}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>${L.htmlContent.cellA1}</td>
      <td>${L.htmlContent.cellA2}</td>
    </tr>
    <tr>
      <td>${L.htmlContent.cellB1}</td>
      <td>${L.htmlContent.cellB2}</td>
    </tr>
  </tbody>
</table>`,
      checkbox: `<label>
  <input type="checkbox" class="playground-el" />
  ${L.htmlContent.checkMe}
</label>`,
      radio: `<div class="playground-el">
  <label>
    <input type="radio" name="demo" />
    ${L.htmlContent.option1}
  </label>
  <label>
    <input type="radio" name="demo" />
    ${L.htmlContent.option2}
  </label>
</div>`,
      progress: `<progress class="playground-el" value="40" max="100"></progress>`,
      range: `<input type="range" class="playground-el" min="0" max="100" value="50" />`,
      details: `<details class="playground-el">
  <summary>${L.htmlContent.clickToExpand}</summary>
  <p>${L.htmlContent.hiddenDetails}</p>
</details>`,
    };

    return components[type];
  }

  let showFullCode = $state(false);
  compileStyles();
</script>

<div class="playground">
  <button class="theme-toggle" onclick={toggle}>
    {theme === "light" ? "🌙" : "🌞"}
  </button>

  <div class="language-selector-container">
    <label class="language-label">
      {L.language}
      <select bind:value={currentLanguage} class="language-select">
        <option value="en">🇺🇸</option>
        <option value="ru">🇷🇺</option>
      </select>
    </label>
  </div>

  <header class="header">
    <h1 class="title">{L.title}</h1>
    <div class="component-selector">
      <label class="select-label">
        {L.selectLabel}
        <select
          bind:value={componentType}
          class="select"
          onchange={() => {
            cssInput = presets[componentType];
            compileStyles();
          }}
        >
          <option value="button">{L.components.button}</option>
          <option value="input">{L.components.input}</option>
          <option value="select">{L.components.select}</option>
          <option value="textarea">{L.components.textarea}</option>
          <option value="table">{L.components.table}</option>
          <option value="checkbox">{L.components.checkbox}</option>
          <option value="radio">{L.components.radio}</option>
          <option value="progress">{L.components.progress}</option>
          <option value="range">{L.components.range}</option>
          <option value="details">{L.components.details}</option>
        </select>
      </label>
    </div>
  </header>

  <main class="main">
    <section class="editor-section">
      <h3 class="section-title">{L.editor}</h3>
      <div class="editor-container">
        <CodeView
          bind:code={cssInput}
          language="css"
          title={L.editorCSS}
          showCopyButton={false}
          showLineNumbers={true}
          editable={true}
        />
      </div>

      <div class="actions">
        <button onclick={compileStyles} class="btn btn-primary"
          >{L.compile}</button
        >
        <button
          onclick={() => {
            cssInput = "";
            compileStyles();
          }}
          class="btn btn-secondary"
        >
          {L.clear}
        </button>
      </div>

      {#if errors.length}
        <div class="errors">
          <strong class="errors-title">{L.errorsTitle}</strong>
          <ul class="errors-list">
            {#each errors as e}
              <li class="error-item">{e}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </section>

    <section class="preview-section">
      <h3 class="section-title">{L.preview}</h3>
      <div class="preview-container">
        {#if componentType === "button"}
          <button class="playground-el">Click me</button>
        {:else if componentType === "input"}
          <input class="playground-el" placeholder="Type here..." />
        {:else if componentType === "select"}
          <select class="playground-el">
            <option>Option A</option>
            <option>Option B</option>
            <option>Option C</option>
          </select>
        {:else if componentType === "textarea"}
          <textarea
            class="playground-el"
            rows="4"
            cols="30"
            placeholder="Write something..."
          ></textarea>
        {:else if componentType === "table"}
          <table class="playground-el">
            <thead>
              <tr><th>Header 1</th><th>Header 2</th></tr>
            </thead>
            <tbody>
              <tr><td>Cell A1</td><td>Cell A2</td></tr>
              <tr><td>Cell B1</td><td>Cell B2</td></tr>
            </tbody>
          </table>
        {:else if componentType === "checkbox"}
          <label>
            <input type="checkbox" class="playground-el" /> Check me
          </label>
        {:else if componentType === "radio"}
          <div class="playground-el">
            <label><input type="radio" name="demo" /> Option 1</label>
            <label><input type="radio" name="demo" /> Option 2</label>
          </div>
        {:else if componentType === "progress"}
          <progress class="playground-el" value="40" max="100"></progress>
        {:else if componentType === "range"}
          <input
            type="range"
            class="playground-el"
            min="0"
            max="100"
            value="50"
          />
        {:else if componentType === "details"}
          <details class="playground-el">
            <summary>Click to expand</summary>
            <p>Hidden details here</p>
          </details>
        {/if}
      </div>
    </section>

    <section class="output-section">
      <div class="output-header">
        <h3 class="section-title">
          {showFullCode ? L.htmlCssTitle : L.cssTitle}
        </h3>
        <label class="toggle-label">
          <input type="checkbox" bind:checked={showFullCode} />
          {L.showHTML}
        </label>
      </div>
      <CodeView
        code={showFullCode
          ? `${compiledHtml}\n\n<style>\n${compiledCss}\n</style>`
          : compiledCss.replace(".playground-el ", "")}
        language={showFullCode ? "html" : "css"}
        title={showFullCode ? L.resultHTMLCSS : L.resultCSS}
        showCopyButton={true}
        showLineNumbers={true}
      />
    </section>
  </main>
</div>
<!-- svelte-ignore css_unused_selector -->
<style>

  :global(.cv-tag) { color: #1a6bb7; font-weight: 600; }
  :global(.cv-attr) { color: #0d7ea8; font-weight: 600; }
  :global(.cv-val) { color: #a65a2b; }
  :global(.cv-comment) { color: #3d6b33; font-style: italic; }
  :global(.cv-keyword) { color: #8a3db6; font-weight: bold; }
  :global(.cv-string) { color: #a65a2b; }
  :global(.cv-number) { color: #2d7a3d; }
  
  :global([data-theme="dark"]) .cv-tag { color: #569cd6; }
  :global([data-theme="dark"]) .cv-attr { color: #9cdcfe; }
  :global([data-theme="dark"]) .cv-val { color: #ce9178; }
  :global([data-theme="dark"]) .cv-comment { color: #6a9955; }
  :global([data-theme="dark"]) .cv-keyword { color: #c678dd; }
  :global([data-theme="dark"]) .cv-string { color: #ce9178; }
  :global([data-theme="dark"]) .cv-number { color: #b5cea8; }

  :global([data-theme="light"]) {
    margin: 0;
    background: #f5f5f5;
    color: #222;
  }

  :global([data-theme="dark"]) {
    background: #1e1e1e;
    color: #f5f5f5;
  }

  :global([data-theme="light"]),
  :global([data-theme="dark"]) {
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    line-height: 1.5;
  }

  :global(pre),
  :global(code) {
    background: transparent;
    margin: 0;
    padding: 0;
  }

  .playground {
    max-width: 100%;
    margin: 0;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: 100vh;
  }

  .theme-toggle {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 999;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: inherit;
  }

  .theme-toggle:hover {
    opacity: 0.7;
  }

  .language-selector-container {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .language-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: var(--language-fg, #4a5568);
    font-size: 14px;
  }

  .language-select {
    padding: 4px 8px;
    border: 1px solid var(--select-border, #cbd5e0);
    border-radius: 6px;
    background: var(--select-bg, white);
    font-size: 14px;
    color: var(--select-fg, #222);
    width: auto;
    min-width: unset;
  }

  .language-select:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;
  }

  .title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
    text-align: center;
  }

  .component-selector {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .select-label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 500;
    color: #4a5568;
  }

  .select {
    padding: 8px 12px;
    border: 1px solid #cbd5e0;
    border-radius: 6px;
    background: white;
    font-size: 14px;
    min-width: 140px;
  }

  .select:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
  }

  .main {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-top: 12px;
  }

  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: #4299e1;
    color: white;
  }

  .btn-primary:hover {
    background: #3182ce;
  }

  .btn-secondary {
    background: #e2e8f0;
    color: #4a5568;
  }

  .btn-secondary:hover {
    background: #cbd5e0;
  }

  .errors {
    background: #fed7d7;
    border: 1px solid #feb2b2;
    border-radius: 8px;
    padding: 16px;
    color: #c53030;
    margin-top: 16px;
  }

  .errors-title {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .errors-list {
    margin: 0;
    padding-left: 20px;
  }

  .error-item {
    margin: 4px 0;
    font-size: 13px;
  }

  .preview-section,
  .output-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    margin: 0 0 12px 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #2d3748;
  }

  .preview-container {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 120px;
    overflow: hidden;
    max-width: 100%;
  }

  .editor-section,
  .preview-section,
  .output-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .playground-el {
    min-width: 200px;
    padding: 8px 12px;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    font-size: 14px;
    overflow: hidden;
  }

  .output-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  @media (min-width: 768px) {
    .playground {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .select-label {
      flex-direction: row;
      align-items: center;
      gap: 12px;
    }

    .language-label {
      flex-direction: row;
    }

    .main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 24px;
    }

    .editor-section {
      grid-column: 1;
      grid-row: 1;
    }

    .preview-section {
      grid-column: 2;
      grid-row: 1;
    }

    .output-section {
      grid-column: 1 / -1;
      grid-row: 2;
    }
  }

  @media (min-width: 1024px) {
    .playground {
      max-width: 1200px;
      padding: 32px;
    }

    .main {
      grid-template-columns: 2fr 1fr;
      grid-template-rows: auto 1fr;
    }

    .editor-section {
      grid-column: 1;
      grid-row: 1 / -1;
    }

    .preview-section {
      grid-column: 2;
      grid-row: 1;
    }

    .output-section {
      grid-column: 2;
      grid-row: 2;
    }
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--fg, #4a5568);
    cursor: pointer;
  }

  .toggle-label input[type="checkbox"] {
    margin: 0;
  }

  /* Dark theme support */
  :global([data-theme="dark"]) .language-label {
    color: #e2e8f0;
  }

  :global([data-theme="dark"]) .language-select {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }

  :global([data-theme="dark"]) .title,
  :global([data-theme="dark"]) .section-title {
    color: #e2e8f0;
  }

  :global([data-theme="dark"]) .select {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }

  :global([data-theme="dark"]) .preview-container {
    background: #2d3748;
    border-color: #4a5568;
  }

  :global([data-theme="dark"]) .btn-secondary {
    background: #4a5568;
    color: #e2e8f0;
  }

  :global([data-theme="dark"]) .toggle-label {
    color: #e2e8f0;
  }
</style>
