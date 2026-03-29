# Speaker Detection Logic

## How the Scorecard Determines Agent vs. Customer

*Updated March 29, 2026*

---

## Overview

The scorecard uses a multi-path architecture to assign Agent or Customer labels to every line of a transcript. The primary path uses AI (Ollama native API or Claude). The fallback path uses content signals when AI is unavailable. A fourth path handles transcripts already normalized with Agent/Customer labels.

```
Transcript loaded
        |
        v
Does transcript have Agent:/Customer: labels already?
        |
   YES  |                         NO
        |                          |
        v                          v
  PATH D: Direct map        Does transcript have SPEAKER_XX labels?
  (already normalized)             |
                              YES  |                    NO
                                   |                     |
                                   v                     v
                          Run AI speaker detection   PATH C: Heuristic only
                          (full transcript, native    (no SPEAKER IDs to
                           /api/chat endpoint)         work with)
                                   |
                             AI succeeds?
                                   |
                              YES  |               NO
                                   v                v
                             PATH A: Speaker    All lines marked
                             ID map applied     'unknown'
                             + normalize        (hard stop - scoring
                             textarea           will NOT proceed)
```

---

## Path A: AI Speaker Detection (Primary)

### What happens

When a transcript is loaded, `detectSpeakersWithAI()` sends the **full transcript** to the configured speaker detection model.

**API endpoint:** Ollama native `/api/chat` (NOT the OpenAI-compatible `/v1/chat/completions`)

This is critical because qwen3 models on the OpenAI-compatible endpoint split output into `content` and `reasoning` fields, causing empty responses. The native endpoint returns everything in `message.content`.

**Configuration:**
- Model: configurable via "Speaker detection model" field in UI (default: qwen3:8b)
- Temperature: 0 (deterministic)
- Context window: 32,768 tokens
- Max output: 2,048 tokens
- System prompt: "Respond with only valid JSON. No thinking, no markdown, no explanation."

The model reads the entire call and returns a JSON map:

```json
{"speakers": {"SPEAKER_00": "agent", "SPEAKER_01": "customer", "SPEAKER_02": "customer"}}
```

### Prompt instructs the model to look for

**Agent signals:**
- Introduces themselves by full name ("My name is First Last")
- Mentions Xfinity or Comcast
- Describes internet/mobile packages, speeds in Mbps, pricing
- Asks questions about the customer household, usage, devices, current provider
- Handles objections and closes the sale
- Has the most lines and longest turns in the transcript

**Customer signals:**
- Answers questions in short responses
- Provides personal info when asked (name, address, letter-spelling like A-B-C)
- Asks questions about offer price, contract, features
- Raises objections ("too expensive", "not interested", "under contract")
- Often has brief, reactive turns

**Key instructions given to the model:**
- There is exactly ONE agent on every call
- Multiple SPEAKER_XX IDs may belong to the same customer (transcription splitting)
- Any SPEAKER_XX not explicitly mapped defaults to customer

### How the result is used

Once the AI returns the map, two things happen:

**1. Textarea normalization (`analyzeTranscript`):**
Before scoring, the transcript in the textarea is rewritten:
```
SPEAKER_00: Hello.     -->     Agent: Hello.
SPEAKER_01: Hi there.  -->     Customer: Hi there.
```
This ensures all downstream code (evidence validation, transcript panel, step 3 agent-line filtering) uses Agent/Customer labels consistently.

**2. Role assignment (`assignRolesBySpkId`):**
For the transcript reference panel, every line gets a role:
```
For each line:
  Extract SPEAKER_XX label
  Look up in AI map
    -> "agent"    = label as Agent
    -> "customer" = label as Customer
    -> Not in map = label as Customer (agent already accounted for)
    -> No label   = label as Unknown
```

### Hard stop on failure

If speaker detection fails (returns null), **scoring does NOT proceed**. The UI shows:

> "Speaker detection failed - could not identify Agent vs Customer. Check that your speaker detection model is running and try again."

This prevents the scoring model from receiving raw SPEAKER_XX labels, which would make all transcript evidence, discovery validation, and step filtering unreliable.

### Caching

The result is cached in `speakerSeedMap` for the duration of the session. The cache is cleared when:
- The scorecard is cleared (`clearAll()`)
- A new transcript file is dropped (`loadTranscriptFile()` sets `speakerSeedMap=null`)

Re-renders (e.g., after running full analysis) reuse the cached map without re-firing the AI call.

### Status bar indicators

| Status | Meaning |
|--------|---------|
| "Identifying speakers..." | AI call in progress |
| "Agent: SPEAKER_00 - Cust: SPEAKER_01, SPEAKER_02" | AI succeeded |
| "Speaker detection failed..." | AI failed, scoring blocked |
| "AI unavailable - signal-based labels only" | No model configured |

---

## Path B: AI Failed / No Model Configured

If the transcript has SPEAKER_XX labels but the AI call failed, scoring is **blocked entirely**. The analyze button re-enables and the user must fix the issue (start Ollama, set the speaker model) before trying again.

In the transcript reference panel, all lines are marked 'unknown' and the status shows "AI unavailable."

---

## Path C: No SPEAKER_XX Labels (Heuristic)

Used when the transcript uses no speaker labels at all (raw text without any SPEAKER_XX or Agent/Customer markers).

`assignRolesByHeuristic()` processes each line using a small set of high-confidence signals only. Anything ambiguous stays `unknown`.

### Agent signals (definite match = Agent)

| Pattern | Reasoning |
|---------|-----------|
| `on behalf of (xfinity\|comcast)` | Standard agent intro phrase |
| `calling (from\|with\|on behalf of) (xfinity\|comcast)` | Standard agent intro phrase |
| `my name is [First] [Last]` | Agent introduces themselves |
| `the reason i'm calling` | Agent stating call purpose |
| `i have your account` | Agent doing account lookup |
| `based on what you told me` | Agent doing Consult tie-back |
| `\d+ mbps` | Agent describing internet speed |
| `price (is) guaranteed` | Agent presenting package |
| `no (down) payment` | Agent presenting package |
| `xfinity rewards` | Agent mentioning Membership |
| `digital consent` | Agent running consent process |
| `i completely understand` | Agent empathy response |
| Explicit `Agent:` / `REP:` label | Pre-labeled transcript |

### Customer signals (definite match = Customer)

| Pattern | Reasoning |
|---------|-----------|
| `i'm not interested` | Customer objection |
| `too expensive` | Customer objection |
| `under contract` | Customer objection |
| `already have (internet\|service)` | Customer explaining current service |
| `call me back` | Customer objection |
| `A-B-C-D` letter-spelling pattern | Customer providing name/info when asked |
| Explicit `Customer:` / `CUST:` label | Pre-labeled transcript |

If no signal matches, the line stays `unknown`.

---

## Path D: Pre-Normalized Labels

Added March 2026. Used when the transcript already has `Agent:` / `Customer:` labels (either from prior normalization or from a transcript source that pre-labels speakers).

`renderTranscriptRef` checks for `Agent:` / `Customer:` patterns FIRST, before checking for SPEAKER_XX. If found, it maps directly:
```
Agent:    -> 'agent'
Customer: -> 'customer'
anything else -> 'unknown'
```

This path is hit after `analyzeTranscript` normalizes the textarea. The transcript panel re-renders after scoring completes, and by that point the textarea has Agent/Customer labels, so Path D applies.

---

## Two-Model Architecture

The scorecard uses **two separate Ollama models** for different tasks:

| Task | Model | Endpoint | Context | Max Output |
|------|-------|----------|---------|------------|
| Speaker detection | qwen3:8b (configurable) | Native `/api/chat` | 32,768 | 2,048 |
| Call scoring | qwen3:14b (configurable) | OpenAI `/v1/chat/completions` | 65,536 | 16,384 |

**Why different endpoints:**
- qwen3 on the OpenAI-compatible endpoint splits output into `content` (empty) and `reasoning` (thinking). Speaker detection returned empty responses.
- The native `/api/chat` endpoint returns everything in `message.content`, avoiding this issue.
- The scoring model uses the OpenAI endpoint because `max_tokens` is needed for long JSON output and the `reasoning` field fallback is handled in JS (`msg.content || msg.reasoning`).

**Fallback:** If the scoring model field is empty, it falls back to the speaker detection model. If both are empty, scoring is blocked.

---

## Why This Architecture

### Why AI-first instead of pattern-matching-first

Transcription software (Whisper, AWS Transcribe, etc.) frequently misattributes lines. A pattern-based classifier that looks at one line at a time will misclassify lines like:
- "It's $60, which you're allowed to pay." - agent presenting price, but looks like customer confirming
- "I understand you." - agent empathy, but reads like customer talking
- "So the package is one gig." - agent pitching, but customer-sounding sentence structure

The AI reads the full transcript holistically and makes a single judgment about which SPEAKER_XX is the agent based on the entire call arc.

### Why one agent, everything-else-is-customer

There is always exactly one outbound sales agent on these calls. Once the AI identifies that SPEAKER_XX, every other ID is by definition the customer (or background noise/third party, which is treated as customer for labeling purposes). This avoids the "tied score" problem.

### Why cache the result

Speaker identification is a one-time judgment about a fixed transcript. Re-running it on every render would add latency without adding accuracy.

### Why hard stop on failure

If speaker detection fails, the scoring model receives raw SPEAKER_XX labels. This makes:
- Step 3 (discovery) agent-line filtering useless
- Transcript evidence validation broken
- The transcript panel unreadable (all dashes)
- All downstream analysis unreliable

It's better to block and show an error than to produce silently wrong results.

### Why normalize the textarea

After speaker detection, the textarea is updated with Agent/Customer labels. This means:
- The scoring model prompt receives clean labels (not SPEAKER_XX)
- Evidence line validation (`/^Agent:/i`) works correctly
- The transcript panel re-render (after scoring) picks up Path D
- Everything reads from one consistent source

---

## Edge Cases

| Scenario | How it's handled |
|----------|------------------|
| Agent uses an alias not matching the filename | AI reads call content, not filename |
| Transcription splits one person across two SPEAKER_IDs | AI is told this can happen, maps both to same role |
| Customer asks agent-like questions | AI resolves from full call context |
| AI returns partial map (some IDs missing) | Missing IDs default to Customer |
| Ollama not running | Speaker detection fails, scoring blocked |
| No SPEAKER_XX labels at all | Path C heuristic on explicit role labels |
| AI returns malformed JSON | `repairJSON()` attempts fix, then fails gracefully |
| qwen3 thinking mode consumes all tokens | Native `/api/chat` avoids reasoning/content split |
| Transcript already normalized | Path D maps Agent/Customer directly |
| Scoring model field empty | Falls back to speaker detection model |

---

## Accuracy

From the Veronica Abreu transcript (428 lines, 7 SPEAKER_IDs, February 2026):

| Speaker | Lines | Assigned Role |
|---------|-------|---------------|
| SPEAKER_02 | 192 | Agent |
| SPEAKER_04 | 168 | Customer |
| SPEAKER_03 | 22 | Customer (alias "Verna Cabrero") |
| SPEAKER_00 | 15 | Customer |
| SPEAKER_01 | 11 | Customer |
| SPEAKER_05 | 13 | Customer |
| SPEAKER_06 | 8 | Customer |

100% accuracy. SPEAKER_03's name-intro line was correctly outweighed by customer-like turns in the overall tally.

From Mariano Holland transcript (445 lines, 3 SPEAKER_IDs, March 2026):

| Speaker | Lines | Assigned Role |
|---------|-------|---------------|
| SPEAKER_00 | ~350 | Agent |
| SPEAKER_01 | ~80 | Customer |
| SPEAKER_02 | ~15 | Customer |

100% accuracy. Consistent across multiple runs (temperature 0).
