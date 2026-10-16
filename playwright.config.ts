import { defineConfig } from '@playwright/test';
const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';
if (!['localhost','127.0.0.1','[::1]'].includes(new URL(baseURL).hostname)) {
  throw new Error('Os testes criam contas e pedidos: use somente um ambiente local isolado.');
}
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, retries: 0,
  forbidOnly: !!process.env.CI, timeout: 240_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL, actionTimeout: 15_000, navigationTimeout: 30_000, browserName: 'chromium', viewport: { width: 1440, height: 900 },
    locale: 'pt-BR', timezoneId: 'America/Sao_Paulo',
    video: process.env.DEMO === '1' ? { mode: 'on', size: { width: 1440, height: 900 } } : 'retain-on-failure',
    screenshot: 'only-on-failure', trace: 'retain-on-failure',
  },
});
