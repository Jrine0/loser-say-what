/**
 * Next.js configuration
 *
 * Limiting CPU usage helps avoid spawn EAGAIN errors (error code -11) that can occur
 * in constrained environments when Turbopack tries to spawn too many worker threads.
 */
module.exports = {
  experimental: {
    // Use a single CPU core to reduce parallel process spawning.
    // Adjust the number if you have more resources available.
    cpus: 1,
  },
  // Optional: enable strict mode and future Webpack 5 features.
  reactStrictMode: true,
};
