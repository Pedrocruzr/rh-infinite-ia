import fs from "node:fs";
import path from "node:path";

export function loadParecerKnowledge(relativePath: string): string {
  const filePath = path.join(
    process.cwd(),
    "src",
    "knowledge",
    "parecer-tecnico-entrevistas",
    relativePath
  );

  return fs.readFileSync(filePath, "utf-8");
}

export function safeLoadParecerKnowledge(relativePath: string): string {
  try {
    return loadParecerKnowledge(relativePath);
  } catch {
    return "";
  }
}
