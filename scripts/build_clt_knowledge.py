from pathlib import Path
from pypdf import PdfReader
import json
import re
import sys

repo = Path.cwd()
filename = "consolidacao_leis_trabalho_4ed-atualizada.pdf"

candidates = [
    repo / "src" / "knowledge" / "clt-ia" / filename,
    repo / filename,
]

found = None
for candidate in candidates:
    if candidate.exists():
        found = candidate
        break

if not found:
    matches = list(repo.rglob(filename))
    if matches:
        found = matches[0]

if not found:
    print(f"[ERRO] PDF não encontrado: {filename}")
    sys.exit(1)

reader = PdfReader(str(found))
pages = []
for page in reader.pages:
    text = page.extract_text() or ""
    if text.strip():
        pages.append(text)

full_text = "\n".join(pages)
full_text = full_text.replace("\x00", "")
full_text = re.sub(r"[ \t]+\n", "\n", full_text)
full_text = re.sub(r"\n{3,}", "\n\n", full_text)

parts = re.split(r"(?=Art\.\s*\d+[A-Zº\-]*)", full_text)

articles = []
for part in parts:
    part = part.strip()
    if not re.match(r"^Art\.\s*\d+", part):
        continue

    lines = [line.strip() for line in part.splitlines() if line.strip()]
    if not lines:
        continue

    raw = "\n".join(lines)
    raw = re.sub(r"[ \t]{2,}", " ", raw)
    raw = re.sub(r"\n{2,}", "\n", raw)

    match = re.match(r"^(Art\.\s*[0-9A-Zº\-\.]+)", raw)
    article = match.group(1).replace("..", ".") if match else "Artigo não identificado"

    if len(raw) < 60:
        continue

    articles.append({
        "article": article,
        "text": raw
    })

dedup = {}
for item in articles:
    article = item["article"]
    if article not in dedup or len(item["text"]) > len(dedup[article]["text"]):
        dedup[article] = item

def article_sort_key(article: str):
    match = re.search(r"Art\.\s*(\d+)", article)
    num = int(match.group(1)) if match else 999999
    return (num, article)

final_articles = [dedup[key] for key in sorted(dedup.keys(), key=article_sort_key)]

out_path = repo / "src" / "lib" / "agents" / "clt-ia" / "knowledge.json"
out_path.write_text(
    json.dumps(final_articles, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print(f"[OK] PDF lido: {found}")
print(f"[OK] knowledge.json gerado com {len(final_articles)} artigos em {out_path}")
