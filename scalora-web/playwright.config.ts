import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env['CI']);

/**
 * Las pruebas corren contra el sitio compilado (no contra el servidor de desarrollo)
 * y en un directorio aparte, para no pisar el `dist/` que se despliega.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx astro build --outDir dist-e2e && npx sirv dist-e2e --port ${PORT} --quiet`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    env: {
      SITE_URL: 'https://scalora.test',
      BASE_PATH: '/',
      PUBLIC_CONTACT_ENDPOINT: `${BASE_URL}/__e2e__/contact`,
      PUBLIC_CONTACT_EMAIL: 'hola@scalora.test',
    },
  },
});
