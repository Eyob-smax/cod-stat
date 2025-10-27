#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import path from "path";
import cliProgress from "cli-progress";
import { analyzeDirectory } from "../lib/fileAnalyzer.js";
import { saveReport } from "../lib/report.js";

program
  .name("code-stats")
  .argument("[directory]", "Directory to scan", ".")
  .option("-c, --count-comments", "Count comment lines", false)
  .option("-f, --function-count", "Count functions/methods", false)
  .option("-a, --avg-func-length", "Average function length", false)
  .option("-l, --language <extensions...>", "Only scan certain languages", [])
  .option("--ignore <dirs...>", "Directories to ignore", [])
  .option("--only-config", "Only scan config files", false)
  .option("--only-code", "Only scan code files", false)
  .option("--largest <n>", "Show top N largest files by code lines", 5)
  .option("--json", "Output JSON", false)
  .action((directory, options) => {
    const stats = analyzeDirectory(directory, options);

    // Progress bar
    const progressBar = new cliProgress.SingleBar(
      {
        format: "Scanning [{bar}] {percentage}% | {value}/{total} files",
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic
    );
    progressBar.start(stats.length, 0);
    for (let i = 0; i < stats.length; i++) progressBar.update(i + 1);
    progressBar.stop();

    if (options.json) {
      saveReport(stats, directory);
      console.log(
        chalk.green(
          `JSON saved to ${path.join(
            process.cwd(),
            "code-stats",
            "report.json"
          )}`
        )
      );
      return;
    }

    if (stats.length === 0) {
      console.log(chalk.yellow("No files found matching criteria."));
      return;
    }

    // Largest files
    if (options.largest) {
      const largestFiles = [...stats]
        .sort((a, b) => b.codeLines - a.codeLines)
        .slice(0, options.largest);
      console.log(chalk.bold.green(`\nTop ${options.largest} largest files:`));
      largestFiles.forEach((f, i) =>
        console.log(
          `${i + 1}. ${f.file} | Code lines: ${chalk.blue(f.codeLines)}`
        )
      );
    }

    // Table
    const tableData = stats.slice(0, 20).map((f) => ({
      File: path.relative(process.cwd(), f.file),
      Lang: f.lang,
      Lines: f.lines,
      Code: f.codeLines,
      Comments: !options.countComments ? "Disabled" : f.comments,
      Complexity: f.complexity,
      Functions: f.functions ?? "-",
      AvgFuncLength: f.avgFuncLength ?? "-",
    }));
    console.table(tableData);

    // Summary
    const totalLines = stats.reduce((a, b) => a + b.lines, 0);
    const totalCode = stats.reduce((a, b) => a + b.codeLines, 0);
    const totalComments = stats.reduce((a, b) => a + b.comments, 0);
    const avgDensity = (
      stats.reduce((a, b) => a + parseFloat(b.density), 0) / stats.length
    ).toFixed(1);
    const avgComplexity = (
      stats.reduce((a, b) => a + b.complexity, 0) / stats.length
    ).toFixed(1);

    console.log(chalk.bold.green("\n=== Summary ==="));
    console.log(chalk.blue(`Total Lines: ${totalLines}`));
    console.log(chalk.cyan(`Total Code: ${totalCode}`));
    if (options.countComments)
      console.log(chalk.magenta(`Total Comments: ${totalComments}`));
    console.log(chalk.yellow(`Average Density: ${avgDensity}%`));
    console.log(chalk.red(`Average Complexity: ${avgComplexity}`));
  });

program.parse(process.argv);
