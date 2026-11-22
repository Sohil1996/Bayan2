/** Builds ../ui (installing its dependencies on first run) so @bayan/ui is ready for Next.js. */
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ui = new URL('../../ui/', import.meta.url).pathname;
if (!existsSync(`${ui}node_modules`)) execSync('npm ci --no-audit --no-fund', { cwd: ui, stdio: 'inherit' });
execSync('npm run build', { cwd: ui, stdio: 'inherit' });
