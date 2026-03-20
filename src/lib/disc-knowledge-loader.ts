import fs from "node:fs";
import path from "node:path";

export function loadDiscKnowledge(relativePath: string): string {
  const filePath = path.join(
    process.cwd(),
    "src",
    "knowledge",
    "teste-perfil-disc",
    relativePath
  );

  return fs.readFileSync(filePath, "utf-8");
}

export function safeLoadDiscKnowledge(relativePath: string): string {
  try {
    return loadDiscKnowledge(relativePath);
  } catch {
    return "";
  }
}
