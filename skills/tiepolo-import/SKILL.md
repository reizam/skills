---
name: tiepolo-import
description: Import Tiepolo clients from SSH server transcripts into stndrds CRM. Dispatches tiepolo-client-importer agents per client. Resumes automatically from result.json files. Usage: /tiepolo-import [--batch N] [--auto] [--client "NAME"] [--limit N]
---

# Tiepolo Import Orchestrator

<role>
You are a long-running import orchestrator for the Financière Tiepolo CRM migration.
You manage a queue of ~6 689 clients stored in /home/ubuntu/clients/ on the SSH server.
Each client folder contains a manifest.json and index.md already prepared.
You dispatch one `tiepolo-client-importer` agent per client via CLI.
You run until the queue is empty or the user stops you.
</role>

## Configuration

Parse CLI args from the invocation:
- `--batch N` → clients per batch (default: 5)
- `--auto` → skip confirmation prompt, start immediately
- `--client "NAME"` → process only this specific client folder name (for testing)
- `--limit N` → process only N clients then stop

```
CLIENTS_DIR = "/home/ubuntu/clients"
UPLOAD_DIR  = "/home/upload/files"
BATCH_SIZE  = 5 (default, overridden by --batch)
```

## MCP Tool Signatures

⚠️ Values go in `values` parameter (NOT `data`):

```
search_records({ query: string })
  → Returns hits[{ id, label, objectName }]

get_record({ objectName: string, recordId: string })

create_record({ objectName: string, values: { field: value } })
  → Returns { recordId }

update_record({ objectName: string, recordId: string, values: { field: value } })

upload_document_to_record({ objectName, recordId, attributeName, title, filePath, mimeType })
  → filePath = absolute local path (NOT base64), all params required
```

## Known API Constraints — Read before every update

**1. `fundsOrigin: ["other_exceptional"]` → always 500**
This enum value is rejected by the API. Never set it. Use the closest valid value or omit the field and log an ambiguity.

**2. Never mix relation fields in a single update_record call**
Sending two or more relation fields (e.g. `financialAssets` + `relationships`, or `relationships` + `companies`) in the same payload causes intermittent 500 errors.
Rule: **one relation field per update_record call**. Split into separate calls.

**3. `piece_identite` does not exist on `companies`**
Only valid on `contacts`. For company documents that would map to `piece_identite`, use `attachments` instead.

**4. fetch failed → immediate retry with smaller payload**
A `fetch failed` (no HTTP code) means a network timeout. Retry once immediately. If it fails again, split the payload.

## Phase 1: INIT

### Step 1 — Load client list

```bash
ls /home/ubuntu/clients/
```

This returns one folder name per line. Each folder is one client.

### Step 2 — Load already-processed clients

```bash
find /home/ubuntu/clients -name 'result.json' -printf '%h\n' | xargs -I{} basename {} | sort
```

This returns the folder names of clients that already have a result.json → Set of done clients.

### Step 3 — Build pending queue

```
pending = allFolders.filter(folder => !done.has(folder))
```

If `--client "NAME"` was passed: `pending = pending.filter(f => f === NAME)`
If `--limit N` was passed: `pending = pending.slice(0, N)`

### Step 4 — Display summary and confirm

```
═══════════════════════════════════════════
  TIEPOLO IMPORT
  Total clients   : N
  Already done    : Y
  Pending         : X
  Batch size      : N clients per batch
═══════════════════════════════════════════
Start? [y/N]
```

If `--auto` was passed, skip this prompt and proceed.

## Phase 2: LOOP

Repeat until `pending` queue is empty:

### Step A — Take next batch

```
batch = pending.splice(0, BATCH_SIZE)
```

### Step B — Dispatch agent for each client in batch

For each folder in batch, dispatch the `tiepolo-client-importer` agent via CLI:

```bash
echo "Process client folder: [FOLDER]

Read /home/ubuntu/clients/[FOLDER]/manifest.json and /home/ubuntu/clients/[FOLDER]/index.md via SSH, then execute all 11 import steps and write result.json." \
  | claude --agent tiepolo-client-importer --dangerously-skip-permissions --output-format json
```

The agent handles all 11 import steps autonomously (SSH reads, CRM operations, PDF uploads, result.json write).

Parse the JSON output to extract the result log for Step D.

⚠️ Run clients **sequentially within a batch** (not in parallel) to avoid CRM rate limits.

### Step D — Show batch progress

```
[Batch N/M complete]
  created  : X
  updated  : Y
  partial  : Z
  errors   : W
─────────────────────────────
[Total: A/B clients processed | ETA: ~C min]
```

ETA: `remainingClients / (processedClients / elapsedMinutes)`

Loop back to Step A.

## Phase 3: REPORT

When queue is empty, aggregate all result.json files:

```bash
find /home/ubuntu/clients -name 'result.json' | xargs cat | python3 -c "
import sys, json
lines = [json.loads(l) for l in sys.stdin if l.strip()]
print(json.dumps(lines))
"
```

Parse all entries and print:

```
════════════════════════════════════════
  TIEPOLO IMPORT — FINAL REPORT
════════════════════════════════════════

Total processed  : N
  created        : X
  updated        : Y
  partial        : Z
  skipped        : W
  error          : V

Contacts created/updated : N
Assets created           : N (financial: X, realEstate: Y, professional: Z, debts: W, cashFlows: V)
PDFs uploaded            : N
Ambiguities              : N
Errors                   : N

── Clients with errors ──
  DUPONT Jean: upload_pdf — file not found
  ...

════════════════════════════════════════
```

After the report, ask: "Run again for failed clients? [y/N]"
If yes, re-run Phase 1 INIT — delete result.json for failed clients to re-process them:
```bash
find /home/ubuntu/clients -name 'result.json' | xargs grep -l '"status":"error"' | xargs rm
```
