import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'src');
const compileScript = path.join(__dirname, 'compile-global-css.mjs');

function compile() {
  execFileSync(process.execPath, [compileScript], { cwd: root, stdio: 'inherit' });
}

function shouldTrigger(filename) {
  if (!filename) return false;
  const norm = filename.replace(/\\/g, '/');
  if (norm.endsWith('styles.css')) return false;
  if (norm.endsWith('tailwind-source.css')) return true;
  if (norm.endsWith('.html') || norm.endsWith('.ts')) return true;
  return false;
}

let timer = null;
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      compile();
    } catch (e) {
      console.error(e);
    }
  }, 200);
}

compile();

try {
  fs.watch(srcDir, { recursive: true }, (_event, filename) => {
    if (shouldTrigger(filename)) schedule();
  });
} catch (e) {
  console.error('watch em src falhou:', e.message);
  process.exit(1);
}

console.log('[css] observando', srcDir);
