import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: true,
  entry: ['src/index.ts', 'src/cut1.ts', 'src/cut2.ts'],
  format: 'esm',
  minify: true,
  outDir: 'dist',
  platform: 'neutral',
  sourcemap: 'hidden',
});
