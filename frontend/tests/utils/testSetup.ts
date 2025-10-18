/**
 * Global Test Setup
 * 
 * Runs before all tests to configure the test environment
 */

import { afterAll, beforeEach } from 'vitest'
import { TestReporter } from './testReporter'
import { getTestEnvironment, shouldUseRealAPI } from './testConfig'

// Log test environment on startup
console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    TEST ENVIRONMENT SETUP                          ║
╚═══════════════════════════════════════════════════════════════════╝

Environment: ${getTestEnvironment().toUpperCase()}
Data Source: ${shouldUseRealAPI() ? '🌐 REAL API' : '✅ MOCKED'}
Reporter:    ${process.env.VITE_ENABLE_TEST_REPORTER === 'true' ? 'ENABLED' : 'DISABLED'}

`)

// Clear test reporter before each test
beforeEach(() => {
  if (process.env.VITE_ENABLE_TEST_REPORTER === 'true') {
    TestReporter.clear()
  }
})

// Print final report after all tests
afterAll(() => {
  if (process.env.VITE_ENABLE_TEST_REPORTER === 'true') {
    console.log('\n')
    TestReporter.printReport()
    
    // Save report to file
    TestReporter.saveReport('./test-results/test-report.txt').catch(console.error)
    
    // Save JSON export
    const fs = require('fs')
    const path = require('path')
    const reportDir = path.join(__dirname, '../../test-results')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    fs.writeFileSync(
      path.join(reportDir, 'test-report.json'),
      TestReporter.exportJSON(),
      'utf-8'
    )
  }
})

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
