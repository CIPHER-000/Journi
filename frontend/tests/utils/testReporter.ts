/**
 * Test Reporter Utility
 * 
 * Tracks and reports which tests use mock vs real data
 */

export interface TestReport {
  testName: string
  testFile: string
  dataSource: 'mock' | 'real' | 'staging'
  duration: number
  status: 'passed' | 'failed' | 'skipped'
  timestamp: string
}

class TestReporterClass {
  private reports: TestReport[] = []
  private enabled: boolean = process.env.VITE_ENABLE_TEST_REPORTER === 'true'

  /**
   * Record a test execution
   */
  record(report: TestReport): void {
    if (!this.enabled) return
    this.reports.push(report)
  }

  /**
   * Get all reports
   */
  getReports(): TestReport[] {
    return [...this.reports]
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const mockTests = this.reports.filter(r => r.dataSource === 'mock')
    const realTests = this.reports.filter(r => r.dataSource === 'real')
    const stagingTests = this.reports.filter(r => r.dataSource === 'staging')
    
    const passedTests = this.reports.filter(r => r.status === 'passed')
    const failedTests = this.reports.filter(r => r.status === 'failed')
    const skippedTests = this.reports.filter(r => r.status === 'skipped')

    return {
      total: this.reports.length,
      mock: {
        count: mockTests.length,
        percentage: (mockTests.length / this.reports.length * 100).toFixed(1),
        passed: mockTests.filter(r => r.status === 'passed').length,
        failed: mockTests.filter(r => r.status === 'failed').length,
      },
      real: {
        count: realTests.length,
        percentage: (realTests.length / this.reports.length * 100).toFixed(1),
        passed: realTests.filter(r => r.status === 'passed').length,
        failed: realTests.filter(r => r.status === 'failed').length,
      },
      staging: {
        count: stagingTests.length,
        percentage: (stagingTests.length / this.reports.length * 100).toFixed(1),
        passed: stagingTests.filter(r => r.status === 'passed').length,
        failed: stagingTests.filter(r => r.status === 'failed').length,
      },
      passed: passedTests.length,
      failed: failedTests.length,
      skipped: skippedTests.length,
      totalDuration: this.reports.reduce((sum, r) => sum + r.duration, 0),
    }
  }

  /**
   * Generate formatted report
   */
  generateReport(): string {
    const summary = this.getSummary()
    
    const report = `
╔═══════════════════════════════════════════════════════════════════╗
║                    TEST EXECUTION REPORT                          ║
╚═══════════════════════════════════════════════════════════════════╝

📊 OVERALL STATISTICS
─────────────────────────────────────────────────────────────────────
Total Tests:     ${summary.total}
✅ Passed:       ${summary.passed}
❌ Failed:       ${summary.failed}
⏭️  Skipped:      ${summary.skipped}
⏱️  Duration:     ${(summary.totalDuration / 1000).toFixed(2)}s

📋 DATA SOURCE BREAKDOWN
─────────────────────────────────────────────────────────────────────
✅ Mock Data Tests:
   Count:        ${summary.mock.count} (${summary.mock.percentage}%)
   Passed:       ${summary.mock.passed}
   Failed:       ${summary.mock.failed}

🌐 Real Data Tests:
   Count:        ${summary.real.count} (${summary.real.percentage}%)
   Passed:       ${summary.real.passed}
   Failed:       ${summary.real.failed}

🚀 Staging Tests:
   Count:        ${summary.staging.count} (${summary.staging.percentage}%)
   Passed:       ${summary.staging.passed}
   Failed:       ${summary.staging.failed}

─────────────────────────────────────────────────────────────────────
${this.getDiscrepancyWarnings()}
`
    return report
  }

  /**
   * Check for discrepancies between mock and real tests
   */
  private getDiscrepancyWarnings(): string {
    const mockFailed = this.reports.filter(r => r.dataSource === 'mock' && r.status === 'failed')
    const realFailed = this.reports.filter(r => r.dataSource === 'real' && r.status === 'failed')
    
    if (mockFailed.length === 0 && realFailed.length === 0) {
      return '✅ No discrepancies detected - all tests passing!'
    }
    
    const warnings: string[] = []
    
    if (mockFailed.length > 0 && realFailed.length === 0) {
      warnings.push('⚠️  Mock tests failing but real tests passing')
      warnings.push('   → Check if mocks accurately reflect real API')
    }
    
    if (mockFailed.length === 0 && realFailed.length > 0) {
      warnings.push('⚠️  Real tests failing but mock tests passing')
      warnings.push('   → Possible integration issues or environment problems')
    }
    
    if (mockFailed.length > 0 && realFailed.length > 0) {
      warnings.push('⚠️  Both mock and real tests have failures')
      warnings.push('   → Review test logic and API contract')
    }
    
    return warnings.join('\n')
  }

  /**
   * Save report to file
   */
  async saveReport(filepath: string): Promise<void> {
    if (typeof window === 'undefined' && typeof process !== 'undefined') {
      const fs = await import('fs/promises')
      const report = this.generateReport()
      await fs.writeFile(filepath, report, 'utf-8')
    }
  }

  /**
   * Print report to console
   */
  printReport(): void {
    console.log(this.generateReport())
  }

  /**
   * Clear all reports
   */
  clear(): void {
    this.reports = []
  }

  /**
   * Export reports as JSON
   */
  exportJSON(): string {
    return JSON.stringify({
      summary: this.getSummary(),
      reports: this.reports,
      timestamp: new Date().toISOString(),
    }, null, 2)
  }
}

// Singleton instance
export const TestReporter = new TestReporterClass()

/**
 * Helper function to wrap test execution with reporting
 */
export function withReporting<T>(
  testName: string,
  testFile: string,
  dataSource: 'mock' | 'real' | 'staging',
  testFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  
  return testFn()
    .then((result) => {
      TestReporter.record({
        testName,
        testFile,
        dataSource,
        duration: Date.now() - startTime,
        status: 'passed',
        timestamp: new Date().toISOString(),
      })
      return result
    })
    .catch((error) => {
      TestReporter.record({
        testName,
        testFile,
        dataSource,
        duration: Date.now() - startTime,
        status: 'failed',
        timestamp: new Date().toISOString(),
      })
      throw error
    })
}
