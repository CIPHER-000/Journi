import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts', './tests/utils/testSetup.ts'],
    css: true,
    
    // Test file patterns - organized by type
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
      'tests/api/**/*.{test,spec}.{ts,tsx}',
    ],
    
    // Exclude e2e tests from vitest (use Playwright for those)
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'tests/e2e/**/*',
    ],
    
    // Test timeouts - increased for API tests with real network calls
    testTimeout: 60000, // 60s global timeout (API tests need time for real backend)
    hookTimeout: 30000, // 30s for setup/teardown hooks
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        'tests/utils/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 55,
        statements: 60,
      },
    },
    
    // Reporters
    reporters: process.env.CI 
      ? ['dot', 'json', 'html']
      : ['verbose'],
    
    // Output
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html',
    },
    
    // Watch mode settings
    watch: false, // Disable by default, enable with --watch flag
    
    // Environment variables
    env: {
      VITE_TEST_ENV: process.env.TEST_ENV || 'mock',
      VITE_ENABLE_TEST_REPORTER: process.env.ENABLE_TEST_REPORTER || 'false',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
})
