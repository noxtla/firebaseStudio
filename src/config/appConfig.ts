// src/config/appConfig.ts

/**
 * Global configuration for the application.
 *
 * To switch between environments, simply change the `isProduction` flag.
 * - Set to `false` to use the TEST webhook URL.
 * - Set to `true` to use the PRODUCTION webhook URL.
 */
const isProduction = false; // <-- CHANGE THIS VALUE TO SWITCH

// --- Webhook URLs ---
const urls = {
  prod: 'https://noxtla.app.n8n.cloud/webhook/login',
  test: 'https://noxtla.app.n8n.cloud/webhook-test/login',
};

// Export the selected URL to be used throughout the app
export const WEBHOOK_URL = isProduction ? urls.prod : urls.test;