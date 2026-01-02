import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

/**
 * Custom Playwright reporter with detailed progress logging
 * Shows test count, timing, and detailed status for each test
 */
class CustomProgressReporter implements Reporter {
  private totalTests = 0;
  private completedTests = 0;
  private passedTests = 0;
  private failedTests = 0;
  private skippedTests = 0;
  private startTime = 0;

  onBegin(config: FullConfig, suite: Suite) {
    this.totalTests = suite.allTests().length;
    this.startTime = Date.now();

    console.log('\n' + '='.repeat(80));
    console.log('🚀 Starting Playwright Test Suite');
    console.log('='.repeat(80));
    console.log(`📊 Total Tests: ${this.totalTests}`);
    console.log(`👥 Workers: ${config.workers}`);
    console.log(`🌐 Projects: ${config.projects.map(p => p.name).join(', ')}`);
    console.log(`🔄 Retries: ${config.projects[0]?.retries ?? 0}`);
    console.log('='.repeat(80) + '\n');
  }

  onTestBegin(test: TestCase) {
    const progress = `[${this.completedTests + 1}/${this.totalTests}]`;
    const percentage = Math.round(((this.completedTests) / this.totalTests) * 100);

    console.log(`${progress} (${percentage}%) 🔄 Running: [${test.parent.project()?.name}] ${test.titlePath().slice(1).join(' › ')}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.completedTests++;
    const progress = `[${this.completedTests}/${this.totalTests}]`;
    const percentage = Math.round((this.completedTests / this.totalTests) * 100);
    const duration = `${result.duration}ms`;
    const testPath = test.titlePath().slice(1).join(' › ');
    const projectName = test.parent.project()?.name;

    let statusIcon = '';
    let statusText = '';

    switch (result.status) {
      case 'passed':
        this.passedTests++;
        statusIcon = '✅';
        statusText = 'PASSED';
        break;
      case 'failed':
        this.failedTests++;
        statusIcon = '❌';
        statusText = 'FAILED';
        break;
      case 'timedOut':
        this.failedTests++;
        statusIcon = '⏱️';
        statusText = 'TIMEOUT';
        break;
      case 'skipped':
        this.skippedTests++;
        statusIcon = '⏭️';
        statusText = 'SKIPPED';
        break;
      default:
        statusIcon = '❓';
        statusText = result.status.toUpperCase();
    }

    console.log(`${progress} (${percentage}%) ${statusIcon} ${statusText} [${projectName}] ${testPath} (${duration})`);

    // Show error details for failed tests
    if (result.status === 'failed' || result.status === 'timedOut') {
      if (result.error) {
        console.log(`   ⚠️  Error: ${result.error.message}`);
      }
    }

    // Show progress summary every 10 tests
    if (this.completedTests % 10 === 0) {
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.log(`\n📈 Progress: ${this.passedTests} passed, ${this.failedTests} failed, ${this.skippedTests} skipped | Elapsed: ${elapsed}s\n`);
    }
  }

  onEnd(result: FullResult) {
    const totalDuration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const avgDuration = (parseFloat(totalDuration) / this.totalTests).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('📋 Test Suite Summary');
    console.log('='.repeat(80));
    console.log(`✅ Passed:  ${this.passedTests}/${this.totalTests}`);
    console.log(`❌ Failed:  ${this.failedTests}/${this.totalTests}`);
    console.log(`⏭️  Skipped: ${this.skippedTests}/${this.totalTests}`);
    console.log(`⏱️  Total Duration: ${totalDuration}s`);
    console.log(`📊 Average Duration: ${avgDuration}s per test`);
    console.log(`🎯 Success Rate: ${Math.round((this.passedTests / this.totalTests) * 100)}%`);
    console.log('='.repeat(80));

    if (result.status === 'passed') {
      console.log('\n🎉 All tests passed!\n');
    } else {
      console.log(`\n⚠️  Test suite ${result.status}\n`);
    }
  }
}

export default CustomProgressReporter;
