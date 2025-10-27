#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import path from "path";
import cliProgress from "cli-progress";
import Table from "cli-table3";
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

    // Handle JSON flag
    if (options.json) {
      saveReport(stats, directory);
      console.log(
        chalk.green(
          `✅ JSON report saved to ${path.join(
            process.cwd(),
            "code-stats",
            "report.json"
          )}`
        )
      );
      return;
    }

    if (stats.length === 0) {
      console.log(chalk.yellow("⚠️ No files found matching criteria."));
      return;
    }

    // 📁 Largest Files Section
    if (options.largest) {
      const largestFiles = [...stats]
        .sort((a, b) => b.codeLines - a.codeLines)
        .slice(0, options.largest);

      console.log(
        chalk.bold.green(`\n📁 Top ${options.largest} Largest Files`)
      );
      const largestTable = new Table({
        head: [chalk.cyan("#"), chalk.cyan("File"), chalk.cyan("Code Lines")],
        style: { head: [], border: [] },
        wordWrap: true,
      });

      largestFiles.forEach((f, i) =>
        largestTable.push([
          chalk.white(i + 1),
          chalk.gray(path.relative(process.cwd(), f.file)),
          chalk.blue(f.codeLines),
        ])
      );

      console.log(largestTable.toString());
    }

    // 📊 Main File Table
    console.log(chalk.bold.green("\n📊 File Analysis Summary"));
    const fileTable = new Table({
      head: [
        chalk.cyan("File"),
        chalk.cyan("Lang"),
        chalk.cyan("Lines"),
        chalk.cyan("Code"),
        chalk.cyan("Comments"),
        chalk.cyan("Complexity"),
        chalk.cyan("Functions"),
        chalk.cyan("Avg Func Len"),
      ],
      style: { head: [], border: [] },
      wordWrap: true,
    });

    stats
      .slice(0, 20)
      .forEach((f) =>
        fileTable.push([
          chalk.gray(path.relative(process.cwd(), f.file)),
          chalk.white(f.lang),
          chalk.white(f.lines),
          chalk.cyan(f.codeLines),
          options.countComments ? chalk.magenta(f.comments) : chalk.gray("off"),
          chalk.yellow(f.complexity),
          f.functions ?? "-",
          f.avgFuncLength ?? "-",
        ])
      );

    console.log(fileTable.toString());

    // 📈 Summary Section
    const totalLines = stats.reduce((a, b) => a + b.lines, 0);
    const totalCode = stats.reduce((a, b) => a + b.codeLines, 0);
    const totalComments = stats.reduce((a, b) => a + b.comments, 0);
    const avgDensity = (
      stats.reduce((a, b) => a + parseFloat(b.density), 0) / stats.length
    ).toFixed(1);
    const avgComplexity = (
      stats.reduce((a, b) => a + b.complexity, 0) / stats.length
    ).toFixed(1);

    console.log(chalk.bold.green("\n📈 Project Summary"));
    const summaryTable = new Table({
      head: [chalk.cyan("Metric"), chalk.cyan("Value")],
      style: { head: [], border: [] },
    });

    summaryTable.push(
      [chalk.white("Total Lines"), chalk.white(totalLines)],
      [chalk.white("Total Code"), chalk.cyan(totalCode)],
      [
        chalk.white("Total Comments"),
        options.countComments
          ? chalk.magenta(totalComments)
          : chalk.gray("off"),
      ],
      [chalk.white("Average Density"), chalk.yellow(`${avgDensity}%`)],
      [chalk.white("Average Complexity"), chalk.red(avgComplexity)]
    );

    console.log(summaryTable.toString());
  });

program.parse(process.argv);
