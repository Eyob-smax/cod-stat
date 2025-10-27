# Cod Stat

`cod-stat` is a powerful, configurable command-line tool for analyzing source code. It helps developers measure code quality, structure, complexity, and productivity across multiple programming languages and file types. Perfect for personal projects, team projects, or CI/CD pipelines.

---

## 🔹 Features

- **Line Counting:** Total lines, code lines, blank lines, and comment lines.
- **Function Analysis:** Count functions/methods and calculate average function length.
- **Complexity Estimation:** Rough complexity scoring using common keywords.
- **Language Detection:** Supports multiple languages and config file types.
- **File Type Filtering:** Scan only code files (`--only-code`) or config files (`--only-config`).
- **Largest Files:** Identify the top N largest files by code lines.
- **Progress Feedback:** Interactive progress bar for large projects.
- **Output Options:** Pretty table or JSON output (`--json`).
- **Colored CLI Interface:** Easy-to-read, visually structured outputs.
- **Customizable:** Ignore directories, filter by language, and more.

---

## 🔹 Installation

```bash
# Clone repository
git clone https://github.com/Eyob-smax/cod-stat.git
cd cod-stat

# Install dependencies
npm install

# Optional: Make CLI available globally
npm link
```

## Basic scan in current directory

cod-stat .

## Scan and count comment lines

cod-stat . -c

## Count functions/methods

cod-stat . -f

## Show average function length

cod-stat . -a

## Filter by specific language extensions

cod-stat . -l js ts py

## Only scan code files

cod-stat . --only-code

## Only scan config/markup files

cod-stat . --only-config

## Show top 10 largest files by code lines

cod-stat . --largest 10

## Save results in JSON

cod-stat . --json

# Ignore directories

cod-stat . --ignore node_modules dist

| Option                           | Alias | Description                            |
| -------------------------------- | ----- | -------------------------------------- |
| `[directory]`                    | -     | Directory to scan (default: `.`)       |
| `-c, --count-comments`           | -     | Count comment lines                    |
| `-f, --function-count`           | -     | Count number of functions/methods      |
| `-a, --avg-func-length`          | -     | Show average function length in lines  |
| `-l, --language <extensions...>` | -     | Only scan certain languages/extensions |
| `--ignore <dirs...>`             | -     | Directories to ignore                  |
| `--only-code`                    | -     | Only scan code files                   |
| `--only-config`                  | -     | Only scan config/markup files          |
| `--largest <n>`                  | -     | Show top N largest files (default: 5)  |
| `--json`                         | -     | Output JSON to `cod-stat/report.json`  |

🔍 Supported Languages & File Types
Code Files

Extensions: js, ts, jsx, tsx, py, java, cpp, c, cs, rb, php, go, rs, kt, swift, dart, sh
Languages: JavaScript, TypeScript, Python, Java, C++, C, C#, Ruby, PHP, Go, Rust, Kotlin, Swift, Dart, Shell

Config/Markup Files

Extensions: env, toml, ini, yml, yaml, json, xml, plist, gradle, makefile
Types: Environment files, TOML, INI, YAML, JSON, XML, Property Lists, Gradle, Makefiles

Note: Language detection is based on file extensions or basenames using a languageMap. Files with unknown extensions are labeled as "Unknown".

┌─────────┬─────────────────────────┬───────────┬───────┬────────┬────────────┬──────────┐
│ (index) │ File │ Lang │ Lines │ Blanks │ Comments │ Code Lines │ Density │
├─────────┼─────────────────────────┼───────────┼───────┼────────┼────────────┼──────────┤
│ 0 │ src/index.js │ JavaScript│ 100 │ 10 │ 20 │ 70 │ 70.0% │
│ 1 │ src/utils/helpers.ts │ TypeScript│ 50 │ 5 │ 5 │ 40 │ 80.0% │
└─────────┴─────────────────────────┴───────────┴───────┴────────┴────────────┴──────────┴──────────┘

=== Summary ===
Total Lines: 150
Total Blanks: 15
Total Code Lines: 110
Total Comments: 25
Average Density: 75.0%
