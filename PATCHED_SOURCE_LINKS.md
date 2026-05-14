# Source link patch

- Blog article rendering now rehydrates plain-text Sources list items into clickable outbound links when they match known authoritative sources.
- Added source fallbacks for IRS IRA pages, Investor.gov Start Investing, and SEC compound interest calculator.
- Source links are now visibly underlined in article content.

This fixes existing posts whose Sources section was stored as plain text like:

- IRS — Types of Individual Retirement Arrangements (IRAs)
- Investor.gov (SEC) — Start Investing

without needing to manually edit every Supabase row.
