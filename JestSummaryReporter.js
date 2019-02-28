const { red, green, black, bgLightGreen, bgLightRed, lightRed, white, yellow } = require('./utils/BashColorUtils');
const timeObj = require('./utils/TimeUtils').timestampToTimeObject;
const { processFullPath } = require('./utils/PathUtils');

class JestSummaryReporter {
  constructor(globalConfig, options) {
    this.globalConfig = globalConfig;
    this.options = options;
  }

  onRunComplete(contexts, results) {
    console.log('\n\nSummary reporter output:');
    if (this.options.diffs) {
      printFailedTestDiffs(results);
    }
    printSummary(results);
  }
}


function printFailedTestDiffs(results) {
  let failedSuites = results.testResults
    .filter(suiteResult => suiteResult.failureMessage);

  if (failedSuites.length > 0) {
    console.log('\nDiffs of failed tests:');

    failedSuites
      .map(suiteResult => {
        return {
          path: processFullPath(suiteResult.testFilePath),
          msg: suiteResult.failureMessage,
          toString() {
            return `${black(bgLightRed(" FAIL "))} ${this.path}\n${this.msg}`;
          }
        }
      })
      .forEach(failedSuite => console.log(failedSuite.toString()));

    console.log('Summary:');
  }
}

function printSummary(results) {
  let {
    numTotalTestSuites: totalSuites,
    numPassedTestSuites: passedSuites,
    numPendingTestSuites: pendingSuites,
    numTotalTests: totalTests,
    numPassedTests: passedTests,
    numFailedTests: failedTests
  } = results;
  let failedSuites = totalSuites - passedSuites - pendingSuites;

  let failed = failedSuites > 0;
  console.log(`Suites: ${failed ? lightRed(failedSuites) : green(passedSuites)}/${white(totalSuites)}`);
  console.log(`Tests:  ${failed ? lightRed(failedTests) : green(passedTests)}/${white(totalTests)}`);
  console.log(`Time:   ${timeObj(Date.now() - results.startTime)}`);
  console.log();
  results.testResults.forEach(printSuiteResults);
}

function printSuiteResults(suiteResult) {
  let failNum = suiteResult.numFailingTests;
  let passNum = suiteResult.numPassingTests;
  let pendingNum = suiteResult.numPendingTests;
  let failed = failNum > 0 || suiteResult.failureMessage;

  let state = black(failed ? bgLightRed(" FAIL ") : bgLightGreen(" PASS "));
  let path = processFullPath(suiteResult.testFilePath);

  let failureRatio = `${lightRed(failNum)}/${white(failNum + passNum + pendingNum)}`;
  let failureRatioLiteral = failed ? failureRatio : "";

  let duration = suiteResult.perfStats.end - suiteResult.perfStats.start;
  let durationLiteral = duration > 0 ? `(${duration}ms)` : "";
  durationLiteral = failed ? red(durationLiteral) : green(durationLiteral);

  console.log(`${state} ${path} ${failureRatioLiteral} ${durationLiteral}`);
  if (failNum > 0) {
    printFailedTestNames(suiteResult);
  }
}

function printFailedTestNames(suiteResult) {
  suiteResult.testResults.forEach(testResult => {
    let duration = testResult.duration;
    let durationLiteral = duration > 0 ? `(${duration}ms)` : "";
    if (testResult.status == "failed") {
      console.log(`${red('  ?')} ${testResult.fullName} ${yellow(durationLiteral)}`);
    }
  })
}

module.exports = JestSummaryReporter;