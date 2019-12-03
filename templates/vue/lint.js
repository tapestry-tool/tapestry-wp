const CLIEngine = require("eslint").CLIEngine

const cli = new CLIEngine({
  extensions: [".js", ".vue"],
  fix: true
})

const report = cli.executeOnFiles(["src/"])
const hasFixes = report.results.some(result => result.output)
const hasErrors = report.results.some(result => result.errorCount)

if (hasErrors) {
  console.log("Unfixable errors found. Please fix them and try committing again.")
  process.exit(1)
}

if (hasFixes) {
  console.log("Errors found. Eslint will attempt to fix. Please recommit files.")
  CLIEngine.outputFixes(report)
  console.log("Done.")
  process.exit(1)
}

process.exit(0)
