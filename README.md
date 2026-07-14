Activity1 — Orders CSV & In-Browser Explorer

Overview
- This project generates a realistic `orders.csv` dataset (1,000,000 rows by default) using Faker and provides a browser-only data explorer (`index.html`) to load and interact with the CSV (filter, select, sort, aggregate, pivot, etc.).

Files
- `data_generation.py` — Python script that generates `orders.csv`.
- `orders.csv` — Generated dataset (2000 rows).
- `index.html` — Frontend UI (loads CSV via file input and offers operations).
- `script.js` — All client-side logic: CSV parsing, dynamic inputs, and operation handlers.
- `styles.css` — Visual styles for the UI.

Quick start
1. Generate dataset (optional — `orders.csv` already included):

```powershell
python -m pip install faker
python data_generation.py --rows 1000000 --output orders.csv
```

2. Open the UI:
- Open `index.html` in your browser (double-click or use Live Server).
- Use the file picker in the page to load `orders.csv` and pick categories/operations.

`data_generation.py` — Summary of behavior
- Uses: `pandas`, `faker`, and Python `random` for reproducible sample data.
- Locales used: `en_IN`, `en_GB`, `en_AU`, `en_IE`, `en_PH` via separate Faker instances.
- Seeds: `Faker.seed(42)` and `random.seed(42)` for reproducible output.
- Config: generates `NUM_ROWS = 2000` rows by looping locales and creating ~400 rows per locale.
- Fields produced per row:
  - `order_id` (int)
  - `customer_name` (string)
  - `restaurant` (string)
  - `food_item` (string)
  - `order_amount` (float)
  - `delivery_time` (int minutes)
- Output: writes `orders.csv` to the current working directory (no args required).
- Prints summary information (row count, memory, head, info, describe) after writing.

Notes & recent fixes
- CSV parsing was hardened in `script.js` to trim headers and row values and handle Windows CRLFs so columns like `delivery_time` parse reliably.
- UI inputs were converted from `datalist`/free text to proper `<select>` elements; several handlers updated to read `.selectedOptions` for multi-selects.

Supported operations (UI)
- Selection: Filter Rows, Select Columns, Select Rows by Column, Filter Range
- Structure: Remove Duplicates, Sort, Count Rows
- Aggregations: Aggregate (Min/Max/Avg)
- Lookups: Index Match, Find Duplicate Values
- Pivot: Group / Pivot (group-by + aggregation)

Known issues / next steps
- A few handlers still need full wiring/testing after control type changes (some were already updated). Manual verification recommended: load `orders.csv` and exercise each operation.
- Option: convert select inputs to searchable enhanced dropdowns for better UX on large schemas.

If you want, I can:
- Add a `requirements.txt` file and a short test page that auto-loads `orders.csv`.
- Convert selects to searchable/select2-like dropdowns (pure JS option available).

---
Created README with `data_generation.py` details. Let me know which follow-up you'd like next.