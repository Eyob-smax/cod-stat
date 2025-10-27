import fs from "fs";
import path from "path";

export function saveReport(stats, directory) {
  const reportDir = path.join(directory, "code-stats");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const reportPath = path.join(reportDir, "report.json");
  const reportData = {
    timestamp: new Date().toISOString(),
    directory,
    totals: {
      totalLines: stats.reduce((a, f) => a + f.lines, 0),
      totalComments: stats.reduce((a, f) => a + f.comments, 0),
      totalCode: stats.reduce((a, f) => a + f.codeLines, 0),
      avgDensity: (
        stats.reduce((a, f) => a + f.codeLines, 0) /
        Math.max(
          stats.reduce((a, f) => a + f.lines, 0),
          1
        )
      ).toFixed(1),
    },
    files: stats,
  };

  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), "utf8");
  return reportPath;
}
