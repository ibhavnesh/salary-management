// Force Rollup to use its JS fallback instead of the native .node binary,
// which Windows Application Control policies may block.
process.env.ROLLUP_NATIVE = 'false';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
