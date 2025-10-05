<!-- src/CssValidator.svelte -->
<script module lang="ts">

type CSSPropertiesDict = {
  [key: string]: readonly string[];
};

const usedCSSProperties: CSSPropertiesDict = {
  // Layout
  display: [
    "flex",
    "grid",
    "block",
    "inline",
    "inline-flex",
    "inline-block",
    "none",
    "contents",
  ],
  position: ["static", "relative", "absolute", "fixed", "sticky"],
  inset: [],
  left: [],
  right: [],
  top: [],
  bottom: [],
  "box-sizing": ["content-box", "border-box"],

  // Flexbox
  flex: [],
  "flex-grow": [],
  "flex-shrink": [],
  "flex-basis": [],
  "flex-direction": ["row", "column", "row-reverse", "column-reverse"],
  "align-items": [
    "stretch",
    "flex-start",
    "flex-end",
    "center",
    "baseline",
    "start",
    "end",
    "self-start",
    "self-end",
  ],
  "justify-content": [
    "flex-start",
    "flex-end",
    "center",
    "space-between",
    "space-around",
    "space-evenly",
    "start",
    "end",
    "left",
    "right",
  ],
  "justify-items": [
    "start",
    "end",
    "center",
    "stretch",
    "self-start",
    "self-end",
    "left",
    "right",
  ],
  "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
  gap: [],
  "row-gap": [],
  "column-gap": [],

  // Grid
  "grid-template-columns": [],
  "grid-template-rows": [],
  "grid-column": [],
  "grid-auto-flow": ["row", "column", "row dense", "column dense"],

  // Sizing
  width: ["auto", "min-content", "max-content", "fit-content"],
  height: ["auto", "min-content", "max-content", "fit-content"],
  "min-width": ["auto", "min-content", "max-content", "fit-content"],
  "max-width": ["auto", "min-content", "max-content", "fit-content"],
  "min-height": ["auto", "min-content", "max-content", "fit-content"],
  "max-height": ["auto", "min-content", "max-content", "fit-content"],

  // Spacing
  margin: [],
  "margin-top": [],
  "margin-right": [],
  "margin-bottom": [],
  "margin-left": [],
  padding: [],
  "padding-top": [],
  "padding-right": [],
  "padding-bottom": [],
  "padding-left": [],
  "padding-x": [],
  "padding-y": [],

  // Typography
  "font-size": [],
  "font-weight": [
    "normal",
    "bold",
    "lighter",
    "bolder",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
  "font-family": [],
  "font-style": ["normal", "italic", "oblique"],
  "line-height": ["normal"],
  "text-align": ["left", "center", "right", "justify"],
  "text-decoration": ["none", "underline", "overline", "line-through"],
  "text-transform": ["none", "uppercase", "lowercase", "capitalize"],
  "white-space": ["normal", "nowrap", "pre", "pre-wrap", "pre-line"],
  "letter-spacing": [],
  "word-break": ["normal", "break-all", "keep-all", "break-word"],

  // Colors
  color: [],
  background: [],
  "background-color": [],
  "background-image": [],
  "background-repeat": [
    "repeat",
    "repeat-x",
    "repeat-y",
    "no-repeat",
    "space",
    "round",
  ],
  "background-position": ["left", "center", "right", "top", "bottom"],
  "background-size": [],
  "accent-color": [],

  // Borders
  border: [],
  "border-width": [],
  "border-style": [
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
  ],
  "border-color": [],
  "border-radius": [],
  "border-collapse": ["collapse", "separate"],
  "border-spacing": [],
  outline: [],
  "outline-color": [],
  "outline-style": ["none", "dotted", "dashed", "solid", "double"],
  "outline-width": [],
  "outline-offset": [],
  "border-top": [],
  "border-right": [],
  "border-bottom": [],
  "border-left": [],
  "border-top-color": [],
  "border-right-color": [],
  "border-bottom-color": [],
  "border-left-color": [],
  "border-top-style": [],
  "border-right-style": [],
  "border-bottom-style": [],
  "border-left-style": [],
  "border-top-width": [],
  "border-right-width": [],
  "border-bottom-width": [],
  "border-left-width": [],

  // Effects
  "box-shadow": [],
  opacity: [],
  filter: [],
  transform: [],
  "transform-origin": [],
  "will-change": [],

  // Interaction
  cursor: ["auto", "default", "pointer", "not-allowed", "text", "move"],
  "user-select": ["none", "auto", "text", "all"],
  "pointer-events": ["auto", "none"],

  // Transition & Animation
  transition: [],
  "transition-duration": [],
  "transition-timing-function": [
    "ease",
    "ease-in",
    "ease-out",
    "ease-in-out",
    "linear",
    "step-start",
    "step-end",
  ],

  // Overflow
  overflow: ["visible", "hidden", "clip", "scroll", "auto"],
  "overflow-x": ["visible", "hidden", "clip", "scroll", "auto"],
  "overflow-y": ["visible", "hidden", "clip", "scroll", "auto"],

  // Other
  "z-index": [],
  visibility: ["visible", "hidden", "collapse"],
  resize: ["none", "both", "horizontal", "vertical"],
  appearance: ["none", "auto"],
  "list-style": ["none"],
} as const;

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

	function isValidColorValue(value: string): boolean {
	  const colorRegex =
	    /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)|hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\))$/i;
	  
	  const namedColors = [
	    'transparent', 'currentcolor', 'inherit', 'unset', 'initial',
	    'white', 'black', 'red', 'blue', 'green', 'yellow', 'orange',
	    'purple', 'gray', 'grey', 'silver', 'maroon', 'olive', 'lime',
	    'aqua', 'teal', 'navy', 'fuchsia', 'magenta', 'cyan', 'pink'
	  ];
	  
	  return (
	    colorRegex.test(value) ||
	    namedColors.includes(value.toLowerCase()) ||
	    value.startsWith("oklch(") ||
	    value.startsWith("lab(") ||
	    value === "currentColor"
	  );
	}

	function isValidNumericValue(value: string): boolean {
	  const numericRegex = /^(-?\d*\.?\d+)(px|%|em|rem|vh|vw|vmin|vmax|ch|ex|fr|cm|mm|in|pt|pc|s|ms)?$|^(auto|initial|inherit|unset|0)$/i;
	  
	  return (
	    numericRegex.test(value.trim()) ||
	    value.includes("calc(") ||
	    value.includes("var(") ||
	    value.includes("min(") ||
	    value.includes("max(") ||
	    value.includes("clamp(")
	  );
	}

	export function isValidCSSValue(
	  property: string,
	  value: string,
	): ValidationResult {
	  const result: ValidationResult = {
	    isValid: true,
	    errors: [],
	    warnings: [],
	  };

  const normalizedProperty = property.toLowerCase().trim();
  const normalizedValue = value.toLowerCase().trim();

  if (!(normalizedProperty in usedCSSProperties)) {
    result.isValid = false;
    result.errors.push(`Unknown CSS property: "${property}"`);
    return result;
  }

  const allowedValues =
    usedCSSProperties[normalizedProperty as keyof typeof usedCSSProperties];

  const hasCalc = normalizedValue.includes("calc(");
  const hasVar = normalizedValue.includes("var(");

  if (allowedValues && allowedValues.length > 0) {
    if (!allowedValues.includes(normalizedValue)) {
      if (
        normalizedProperty.includes("color") &&
        isValidColorValue(normalizedValue)
      ) {
        return result;
      }

      if (
        (normalizedProperty.includes("width") ||
          normalizedProperty.includes("height") ||
          normalizedProperty.includes("margin") ||
          normalizedProperty.includes("padding") ||
          normalizedProperty.includes("gap") ||
          (normalizedProperty.includes("border") &&
            !normalizedProperty.includes("color") &&
            !normalizedProperty.includes("style"))) &&
        (hasCalc ||
          hasVar ||
          normalizedValue
            .split(/\s+/)
            .every((part) => isValidNumericValue(part)))
      ) {
        return result;
      }

      if (
        normalizedProperty === "z-index" &&
        (hasCalc || /^-?\d+$/.test(normalizedValue))
      ) {
        return result;
      }

      result.warnings.push(
        `The value "${value}" may not be valid for the property "${property}". Valid values are: ${allowedValues.join(", ")}`,
      );
    }
  } else {
    if (
      normalizedProperty.includes("color") &&
      !isValidColorValue(normalizedValue)
    ) {
      result.warnings.push(`Possibly invalid color value: "${value}"`);
    }

    if (
      (normalizedProperty.includes("width") ||
        normalizedProperty.includes("height") ||
        normalizedProperty.includes("margin") ||
        normalizedProperty.includes("padding") ||
        normalizedProperty.includes("gap")) &&
      !hasCalc &&
      !hasVar &&
      !normalizedValue.split(/\s+/).every((part) => isValidNumericValue(part))
    ) {
      result.warnings.push(`Possibly invalid dimension value: "${value}"`);
    }
  }

  return result;
}

export function splitCssDeclarationsSafe(cssString: string): string[] {
  const out: string[] = [];
  let current = "";
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < cssString.length; i++) {
    const ch = cssString[i];

    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    } else if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    }

    if (!inSingleQuote && !inDoubleQuote) {
      if (ch === "(") {
        depth++;
      } else if (ch === ")") {
        if (depth > 0) depth--;
      } else if (ch === ";" && depth === 0) {
        out.push(current.trim());
        current = "";
        continue;
      }
    }

    current += ch;
  }

  if (current.trim()) out.push(current.trim());
  return out.filter(Boolean);
}

export function validateCssString(str: string): string[] {
  const errors: string[] = [];
  const warnings: string[] = [];

  const properties = splitCssDeclarationsSafe(str);

  for (const prop of properties) {
    const parts = prop.split(":").map((p) => p.trim());
    if (parts.length === 2) {
      const [property, value] = parts;
      const validation = isValidCSSValue(property, value);
      if (!validation.isValid) errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    } else if (prop.trim()) {
      warnings.push(`Invalid CSS format: "${prop}"`);
    }
  }

  return [...errors, ...warnings];
}

</script>