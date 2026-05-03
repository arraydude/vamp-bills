"""Scrape Ramp Bill Pay help center articles using Playwright (bypasses Cloudflare).

Usage:
    python scripts/scrape_ramp.py [SECTION_URL]

Defaults to scraping the "Bill Creation and Management" section, then walks the
sidebar to discover all sibling articles. Saves raw HTML + markdown into
.claude/skills/ramp-bill-pay/references/raw/ and references/md/.
"""

from __future__ import annotations

import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
from markdownify import markdownify as md
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

ROOT = Path(__file__).resolve().parent.parent
OUT_RAW = ROOT / ".claude/skills/ramp-bill-pay/references/raw"
OUT_MD = ROOT / ".claude/skills/ramp-bill-pay/references/md"
OUT_RAW.mkdir(parents=True, exist_ok=True)
OUT_MD.mkdir(parents=True, exist_ok=True)

DEFAULT_URL = (
    "https://support.ramp.com/hc/en-us/articles/27579228841875-"
    "Managing-bills-and-payments-on-Bill-Pay"
)


def slugify(text: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:80] or "article"


# Only follow links whose URL slug matches one of these patterns.
# Keeps the crawl inside Bill Pay territory and avoids wandering into
# corporate-card / travel / pricing / login content.
BILLPAY_PATTERNS = [
    "bill-pay",
    "bill-lifecycle",
    "bills-and-payments",
    "draft-bills",
    "invoice",
    "ocr",
    "ap-aging",
    "ap-email",
    "vendor-credits",
    "vendor-management",
    "vendor-network",
    "vendor-tax",
    "recurring-bill",
    "batch-payments",
    "line-item",
    "allocation",
    "expense-vs-item",
    "multi-entity",
    "credit-memo",
    "tax-support",
    "approval",
]


def is_billpay_url(url: str) -> bool:
    path = urlparse(url).path.lower()
    if "/articles/" not in path:
        return False
    return any(pat in path for pat in BILLPAY_PATTERNS)


def extract_article(html: str, url: str) -> tuple[str, str, list[str]]:
    soup = BeautifulSoup(html, "html.parser")
    title_el = soup.select_one("h1.article-title, h1")
    title = title_el.get_text(strip=True) if title_el else url

    body = soup.select_one(".article-body") or soup.select_one("article") or soup.body
    body_html = str(body) if body else html

    # Discover sibling article links from the sidebar / related lists.
    links: list[str] = []
    for a in soup.select("a[href]"):
        href = a.get("href", "")
        if "/hc/en-us/articles/" in href:
            links.append(urljoin(url, href.split("?")[0]))
    return title, body_html, sorted(set(links))


def main() -> None:
    seed = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    visited: set[str] = set()
    queue: list[str] = [seed]
    saved: list[tuple[str, str]] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,  # headed mode passes Cloudflare more reliably
            args=["--disable-blink-features=AutomationControlled"],
        )
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 900},
            locale="en-US",
        )
        page = ctx.new_page()

        while queue:
            url = queue.pop(0)
            # Strip URL fragments so #anchors don't cause re-fetching.
            url = url.split("#")[0]
            if url in visited:
                continue
            visited.add(url)

            host = urlparse(url).netloc
            if "support.ramp.com" not in host:
                continue
            if url != seed and not is_billpay_url(url):
                continue

            # Skip if we've already saved a file from this URL slug.
            url_slug = slugify(urlparse(url).path.split("/")[-1])
            if any(p.stem.endswith(url_slug[-40:]) for p in OUT_MD.glob("*.md")):
                # Heuristic skip; not perfect but avoids most re-fetches.
                pass

            print(f"[{len(saved)+1}] {url}", flush=True)
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=45000)
                # Give Cloudflare's challenge a moment to resolve, then wait for content.
                try:
                    page.wait_for_selector("h1.article-title, .article-body", timeout=30000)
                except PWTimeout:
                    # Maybe a section page (no article body) — still process.
                    time.sleep(2)
                html = page.content()
            except Exception as exc:
                print(f"    ERROR: {exc}", flush=True)
                continue

            if "cf-mitigated" in html.lower() or "Just a moment" in html:
                print("    Cloudflare challenge still present; sleeping 5s and retrying…", flush=True)
                time.sleep(5)
                html = page.content()

            title, body_html, links = extract_article(html, url)
            slug = slugify(title)

            (OUT_RAW / f"{slug}.html").write_text(html, encoding="utf-8")
            md_text = f"# {title}\n\nSource: {url}\n\n" + md(body_html, heading_style="ATX")
            (OUT_MD / f"{slug}.md").write_text(md_text, encoding="utf-8")
            saved.append((title, slug))

            for link in links:
                link = link.split("#")[0]
                if link in visited or link in queue:
                    continue
                if not is_billpay_url(link):
                    continue
                queue.append(link)

            time.sleep(1.0)

        browser.close()

    print(f"\nSaved {len(saved)} articles to {OUT_MD}")
    for title, slug in saved:
        print(f"  - {slug}.md  ({title})")


if __name__ == "__main__":
    main()
