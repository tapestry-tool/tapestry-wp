const CLIEngine = require("eslint").CLIEngine

const cli = new CLIEngine({
  extensions: [".js", ".vue"],
  fix: true,
})

const report = cli.executeOnFiles(["src/"])
const hasFixes = report.results.some(result => result.output)
const hasErrors = report.results.some(result => result.errorCount)

if (hasErrors) {
  console.log("Unfixable errors found. Please fix them and try committing again.")
  const formatter = cli.getFormatter()
  console.log(formatter(report.results))
  process.exit(1)
}

if (hasFixes) {
  console.log(
    "Lint errors found. ESLint will attempt to fix them. Please review changes and re-commit files."
  )
  CLIEngine.outputFixes(report)
  console.log("Lint fixes complete.")
  process.exit(1)
}

process.exit(0)
