import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Load config from .codestatsrc JSON/YAML file
export function loadConfig(directory) {
  const configFiles = [
    ".codestatsrc",
    ".codestatsrc.json",
    ".codestatsrc.yaml",
    ".codestatsrc.yml",
  ];

  for (const file of configFiles) {
    const fullPath = path.join(directory, file);
    if (fs.existsSync(fullPath)) {
      if (file.endsWith(".yaml") || file.endsWith(".yml")) {
        return yaml.load(fs.readFileSync(fullPath, "utf8"));
      } else {
        return JSON.parse(fs.readFileSync(fullPath, "utf8"));
      }
    }
  }

  return {};
}
