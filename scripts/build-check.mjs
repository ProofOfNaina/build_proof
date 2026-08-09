// Runs a production build into `.next-check` instead of `.next`.
//
// `next build` writing to the default directory while `next dev` is serving
// corrupts the dev server's output: its chunks start 404ing and the browser
// surfaces an opaque "[object Event]" runtime error. Use this to verify a build
// without disturbing a running dev server.
//
// Set NEXT_DIST_DIR yourself if you want a different target.

import { spawn } from 'node:child_process';

const distDir = process.env.NEXT_DIST_DIR || '.next-check';

const child = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: distDir },
});

child.on('exit', (code) => process.exit(code ?? 1));
