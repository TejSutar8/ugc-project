import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://e64f2377c7dd5745754d394b9c179ce2@o4510845652107264.ingest.us.sentry.io/4510845666525184",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});