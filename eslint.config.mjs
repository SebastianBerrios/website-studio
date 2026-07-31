import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const PRICE_PLACEHOLDER_MESSAGE =
  "Do not hardcode a `[PRICE:*]` placeholder string — prices are a designed " +
  "`pending`/`set` state in lib/content/pricing.ts, rendered exclusively " +
  "through <Price>/<PricePending> (design.md D8, task 4.9).";
const CURRENCY_PLACEHOLDER_MESSAGE =
  "Do not hardcode a `[CURRENCY]` placeholder string — use " +
  "`DISPLAY_CURRENCY`/`formatMoney()` from lib/content/pricing.ts instead " +
  "(design.md D8, task 4.9).";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Task 4.9 / design.md D8 layer 4: ban the literal placeholder strings
  // `[PRICE:` and `[CURRENCY]` in copy-bearing source. This catches someone
  // typing a price placeholder directly into copy instead of using the
  // typed `PRICES` data module and the `Price`/`PricePending` components —
  // it does NOT catch strings assembled at runtime, which is a known,
  // documented gap (design.md §6, layer 4 table).
  {
    files: [
      "app/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "lib/dictionaries/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\[PRICE:/]",
          message: PRICE_PLACEHOLDER_MESSAGE,
        },
        {
          selector: "TemplateElement[value.raw=/\\[PRICE:/]",
          message: PRICE_PLACEHOLDER_MESSAGE,
        },
        {
          selector: "Literal[value=/\\[CURRENCY\\]/]",
          message: CURRENCY_PLACEHOLDER_MESSAGE,
        },
        {
          selector: "TemplateElement[value.raw=/\\[CURRENCY\\]/]",
          message: CURRENCY_PLACEHOLDER_MESSAGE,
        },
      ],
    },
  },
]);

export default eslintConfig;
