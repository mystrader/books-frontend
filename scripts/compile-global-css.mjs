import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const inputPath = path.join(root, 'src', 'tailwind-source.css');
const outputPath = path.join(root, 'src', 'styles.css');

const css = fs.readFileSync(inputPath, 'utf8');
const result = await postcss([tailwind]).process(css, { from: inputPath, to: outputPath });
fs.writeFileSync(
  outputPath,
  `/* Gerado por scripts/compile-global-css.mjs — edite src/tailwind-source.css */\n${result.css}`
);
console.log('CSS global:', outputPath, `(${result.css.length} bytes)`);
