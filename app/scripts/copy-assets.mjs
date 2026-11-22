// Copies the shared images from the static site (../img) into public/img.
// The live site and the React app use the same image files; keep one source of truth.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
const src = new URL('../../img', import.meta.url);
const dst = new URL('../public/img', import.meta.url);
if (!existsSync(src)) { console.error('Missing ../img (run from the Bayan2 repo).'); process.exit(1); }
mkdirSync(dst, { recursive: true });
cpSync(src, dst, { recursive: true });
console.log('Copied images to public/img');
