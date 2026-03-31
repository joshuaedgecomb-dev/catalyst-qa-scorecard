# Two-Pass Scoring Redesign

**Date:** 2026-03-30
**Status:** Design approved
**Scope:** Scorecard AI evaluation pipeline (`scorecard/comcast_call_flow_scorecard_17.html`)

## Problem

The local model (qwen3:14b, 65K context, 12GB GPU) scores nearly all steps as ED regardless of call quality. Root causes:

1. **Missing criteria** — the local prompt strips step `desc` fields (ED/PD/DND definitions), sending only abbreviated "LOOK FOR" summaries. The model doesn't know what differentiates good from bad.
2. **Recency bias** — on a 450-line transcript, the model overweights the closing phase (naturally the most positive part of the call), inflating scores.
3. **Cognitive overload** — one prompt asks the model to simultaneously find evidence in 450 lines AND judge that evidence against complex criteria. Small models can't do both well.
4. **Limited post-processing** — only 4 of 11 steps have deterministic corrections (steps 1, 3, 4 + B3/B4/B5 caps). The other 7 steps pass through unchecked.

Additionally:
- Executive summary narratives are shallow and generic because the model produces them from the same overloaded single pass.
- Voicemail/answering machine transcripts get scored as real calls.
- Summary header sometimes shows "6/6 ED" after post-processing has corrected scores (timing bug).

## Solution: Two-Pass Architecture

Split the single AI call into two specialized passes:

- **Pass 1 (Evidence Extraction):** Walk the transcript chronologically, extract structured facts per call phase. No scoring. No judgment.
- **Pass 2 (Scoring Judgment):** Receive the extraction (not the transcript), apply ED/PD/DND criteria to structured evidence.

This separates two cognitive tasks that small models struggle to combine: finding evidence and judging evidence.

### Token Budget

| Pass | Instructions | Input | Output generation | Total | Headroom |
|------|-------------|-------|-------------------|-------|----------|
| Pass 1 (Extraction) | ~5-6K | ~12-13K (transcript) | ~3-4K (extraction JSON) | ~20-23K | ~42-45K |
| Pass 2 (Scoring) | ~6-8K | ~2-3K (extraction) | ~4-6K (scores + exec summary) | ~12-17K | ~48-53K |

Base measurement: 15.5K tokens for current single-pass prompt + long transcript (450 lines, ~40 min call). 20% headroom applied → 19K reserved for transcript + base instructions. Both passes fit comfortably within the 65K context window.

### `/no_think` Mode

Both Pass 1 and Pass 2 use the `/no_think` flag appended to the user message. Qwen3's thinking mode consumes output tokens from `num_predict`, leaving less room for the actual response. Since both passes require structured JSON output (not reasoning), thinking mode is counterproductive.

## Pass 1: Evidence Extraction

### Purpose

Walk the transcript top-to-bottom and extract what happened in each phase. Every fact includes line numbers. **Strictly factual extraction only** — no scores, no judgments, no recommendations, no assessments of what was "missed." The model reports what it observes; all interpretation happens in Pass 2.

### Input

- Numbered transcript (existing `[1] Agent: ...` format)
- Phase boundary hints (opening = lines 1-60, close = last 50 lines)

### Output Schema

```json
{
  "customerType": "existing|new",
  "opening": {
    "greetingLines": [1,2,3],
    "recordingDisclosure": { "present": true, "lines": [5,6] },
    "customerNameUsed": true,
    "agendaStatement": {
      "present": true,
      "lines": [8,9],
      "salesIntent": true,
      "summary": "calling because customer is eligible for Xfinity Mobile"
    },
    "authentication": { "method": "code|address_phone|none", "lines": [12,13] },
    "tone": "warm|neutral|flat|scripted"
  },
  "discovery": {
    "agentQuestions": [
      { "line": 25, "pillar": "users|usage|devices|cost", "openEnded": true, "text": "brief paraphrase" }
    ],
    "customerVolunteered": [
      { "line": 30, "topic": "mentioned they have 3 kids who stream" }
    ],
    "pillarsAsked": ["users", "cost"]
  },
  "pitch": {
    "productsPitched": [
      { "product": "Xfinity Internet 1 Gig", "lines": [45,46,47], "tiedToDiscovery": true, "tieBack": "referenced streaming from discovery" }
    ],
    "broadbandLabels": { "mentioned": true, "line": 52 },
    "deliveryStyle": "confident|hesitant|rushed|generic",
    "primarySale": "product name from agenda"
  },
  "close": {
    "assumptiveAsk": { "present": true, "lines": [60], "confident": true },
    "customerResponse": "accepted|objected|hesitated|deferred"
  },
  "objections": [
    {
      "customerObjection": { "line": 65, "summary": "needs to think about it" },
      "agentAcknowledged": true,
      "agentDiscoveredReason": false,
      "rebuttalLines": [68, 69],
      "rebuttalApproach": "empathy+value|pressure|gave_up|ignored",
      "reClose": { "present": true, "lines": [72], "confident": true }
    }
  ],
  "reaffirmAndClose": {
    "reaffirmation": { "present": true, "lines": [80], "genuine": true },
    "positiveClose": { "present": true, "lines": [85,86], "checkedForQuestions": true },
    "closingCompliance": { "delivered": true, "lines": [88] },
    "orderSummary": {
      "productsRecapped": true,
      "pricingStated": true,
      "promoTerms": true,
      "rollToRate": false,
      "installDetails": true,
      "nextSteps": true,
      "beforeSubmitting": true,
      "textConsent": true,
      "postApproval": false,
      "lines": [90,91,92]
    }
  },
  "processIssues": [
    { "line": 40, "type": "long_hold|confusion|tech_difficulty|repeated_attempt", "summary": "customer waited 2 minutes" }
  ],
  "redFlagCandidates": [
    { "line": 55, "type": "rf1|rf2|rf3|rf4|rf5|rf6", "summary": "brief factual description" }
  ],
  "appreciationInstances": [
    { "line": 30, "what": "thanked customer for answering questions" }
  ],
  "xfinityMembershipMentioned": false,
  "personalRapportMoments": [
    { "line": 15, "what": "asked about customer's weekend plans" }
  ],
  "scriptedMoments": [
    { "line": 50, "what": "read pitch verbatim without adapting to customer responses" }
  ],
  "customerRepeatedSelf": [
    { "line": 70, "what": "restated address a second time" }
  ]
}
```

### Prompt Design

- Instruction tokens: ~5-6K (extraction rules, phase definitions, schema, compliance verbatim, product knowledge)
- No ED/PD/DND criteria in this prompt — extraction only
- No recommendations, assessments, or coaching language — facts and observations only
- Include product knowledge for product name matching
- Include compliance verbatim so the model knows what phrases to detect
- Transcript is numbered lines (existing format)
- `/no_think` appended to user message

### What This Gives Us

- Chronological extraction eliminates recency bias — every phase gets equal attention
- Line numbers on every fact enable post-processing verification
- Discovery pillars tagged per question — deterministic counting downstream
- Process issues surfaced explicitly — B3 friction validation without regex
- Factual observations (rapport moments, scripted moments, appreciation instances) give Pass 2 the raw material to produce rich coaching context
- Small models excel at extraction tasks (factual, not judgmental)

## Pass 2: Scoring Judgment

### Purpose

Score all steps, catalyst behaviors, red flags, compliance, and produce executive summary. Input is structured evidence from Pass 1, not the raw transcript.

### Input

- Pass 1 extraction JSON (~2-3K tokens)
- Full ED/PD/DND criteria for all 11 steps (from STEPS[].desc)
- Full ED/PD/DND criteria for all 6 catalyst behaviors (from CATALYST[].criteria)
- Red flag definitions
- Compliance item definitions
- Product knowledge (for productFlags)

### Output

Same JSON structure the current system produces:

```json
{
  "customerType": "existing|new",
  "steps": [{ "id": 1, "score": "ed|pd|dnd|na", "trending": [], "notes": "...", "evidenceLines": [2,3] }],
  "redFlags": [{ "id": "rf1", "flagged": false, "subs": [], "notes": "" }],
  "compliance": [{ "id": "c1", "score": "yes|no|na", "notes": "..." }],
  "catalystBehaviors": [{ "id": "b1", "score": "ed|pd|dnd", "notes": "..." }],
  "productFlags": [],
  "suggestedOutcome": "...",
  "suggestedCampaign": "...",
  "primarySale": { "product": "...", "outcome": "..." },
  "upsell": { "product": "...", "outcome": "..." },
  "executiveSummary": {
    "topPriority": "...",
    "summary": "...",
    "strengths": [],
    "opportunities": [],
    "critical": [],
    "salesCoaching": [],
    "complianceCoaching": []
  }
}
```

### Coaching Context Generation

Pass 2 is responsible for all interpretive coaching content. It receives Pass 1's factual observations and synthesizes them into actionable coaching. The prompt instructs the model to:

- Compare `discovery.pillarsAsked` vs. `["users","usage","devices","cost"]` to identify gaps and recommend specific questions
- Compare `pitch.productsPitched[].tiedToDiscovery` to identify generic vs. personalized pitches
- Analyze `objections[]` entries against the 4-step framework (understand, empathize, restate, add value) to identify where the agent's approach broke down
- Use `processIssues[]`, `customerRepeatedSelf[]`, and `scriptedMoments[]` to assess effortlessness
- Use `appreciationInstances[]`, `personalRapportMoments[]`, and `xfinityMembershipMentioned` to assess engagement and appreciation

This coaching analysis feeds directly into the `executiveSummary` fields: `strengths`, `opportunities`, `salesCoaching`, and `complianceCoaching`.

### Data Flow: Assembling the Final Result

The final result object consumed by `applyResult()` is assembled in JS after both passes:

1. Pass 2 output becomes the primary result (steps, catalystBehaviors, redFlags, compliance, executiveSummary, etc.)
2. Pass 1 extraction is attached as `result._extraction` for post-processing to reference
3. `discoveryPillars` is built deterministically in JS from Pass 1's `discovery.agentQuestions` and `discovery.pillarsAsked` — not from Pass 2. Pass 2 does not output `discoveryPillars`; this avoids contradiction between passes. Post-processing always uses Pass 1 as the source of truth for pillar counts.
4. Post-processing v2 runs on the assembled result, using `result._extraction` for its enhanced rules
5. `result._extraction` is available to `buildBulkPayload()` and coaching HTML reports for richer downstream content

### Prompt Design

- Instruction tokens: ~6-8K (full step criteria, catalyst criteria, scoring rules, coaching format)
- Evidence input: ~2-3K (Pass 1 extraction)
- Total: ~8-11K tokens — well within budget
- The model sees rich criteria AND structured evidence but never the raw transcript
- Coaching instructions reference specific extraction fields by name for targeted analysis
- `/no_think` appended to user message

### What This Gives Us

- Model focuses entirely on judgment, not evidence hunting
- Full ED/PD/DND criteria for every step (currently stripped from local prompt)
- Exec summary built from structured extraction data, not raw transcript recall
- Coaching recommendations cite specific lines, specific gaps, specific verbatim
- Recency bias impossible — model never sees the transcript

## Pass 1 Validation

After Pass 1 returns, JS validates the extraction before sending it to Pass 2.

### Required Fields

These top-level keys must be present. If any is missing, the extraction is invalid:

- `customerType`
- `opening` (with at least `greetingLines` and `recordingDisclosure`)
- `discovery` (with at least `agentQuestions` array and `pillarsAsked` array)
- `pitch` (with at least `productsPitched` array)
- `close`
- `reaffirmAndClose`

### Optional Fields (Defaults Applied)

| Field | Default if missing |
|-------|-------------------|
| `objections` | `[]` (no objections detected) |
| `processIssues` | `[]` |
| `redFlagCandidates` | `[]` |
| `appreciationInstances` | `[]` |
| `personalRapportMoments` | `[]` |
| `scriptedMoments` | `[]` |
| `customerRepeatedSelf` | `[]` |
| `xfinityMembershipMentioned` | `false` |
| `opening.authentication` | `{ "method": "none", "lines": [] }` |
| `opening.tone` | `"neutral"` |
| `pitch.broadbandLabels` | `{ "mentioned": false }` |
| `pitch.deliveryStyle` | `"generic"` |
| `reaffirmAndClose.orderSummary` | all fields `false` |

### Line Number Bounds Check

All line number values are validated against `[1, transcriptLineCount]`. Out-of-range line numbers are clamped or removed.

### Failure Behavior

- If required fields are missing → fall back to single-pass (see Fallback section)
- If optional fields are missing → apply defaults, proceed to Pass 2
- If JSON parse fails entirely → fall back to single-pass

## Post-Processing v2

Post-processing remains the deterministic safety net. Now works with richer data from Pass 1.

### Existing Rules (Enhanced)

| Rule | Current Source | New Source |
|------|---------------|------------|
| Discovery pillar count | Regex scan of transcript | `extraction.discovery.pillarsAsked` array |
| B4 scoring (0-1=DND, 2-3=PD, 4=ED) | Regex pillar count | Extraction pillar count |
| B5 cap (<=B4) | B4 score | B4 score (unchanged) |
| B3 cap (friction) | Regex friction signals | `extraction.processIssues.length` |
| Recording disclosure | Regex first 60 lines | `extraction.opening.recordingDisclosure.present` |
| Step 3 DND when no discovery | Regex pillar count | Extraction pillar count |
| Step 4 PD cap when no discovery | Regex pillar count | Extraction pillar count |

### New Rules

| Step | Rule | Source |
|------|------|--------|
| Step 2 (Agenda) | Cap at PD if `agendaStatement.salesIntent` is false | `extraction.opening.agendaStatement` |
| Step 5 (Assume the sale) | Force DND if `close.assumptiveAsk.present` is false | `extraction.close` |
| Steps 6-8 (Objection) | Force NA if `objections` array is empty | `extraction.objections` |
| Step 6 | Cap at PD if objection exists but `agentAcknowledged` is false | `extraction.objections[].agentAcknowledged` |
| Step 9 (Reaffirm) | Force DND if `reaffirmation.present` is false | `extraction.reaffirmAndClose` |
| Step 10 (Positive close) | Cap at PD if `closingCompliance.delivered` is false | `extraction.reaffirmAndClose` |
| Step 11 (Summarize) | Count true fields in `orderSummary`. All false=DND, partial=PD | `extraction.reaffirmAndClose.orderSummary` |
| Red flags | Dual-confirmation replaces current aggressive unflagging: only confirm where both Pass 1 extraction AND Pass 2 judgment agree. The existing regex-based unflagging logic is removed since dual-confirmation serves the same purpose more reliably. Pass 2 cannot flag items not present in Pass 1's `redFlagCandidates`; any Pass 2 red flag without a matching Pass 1 candidate is discarded (Pass 2 never sees the transcript, so it cannot discover new evidence). | `extraction.redFlagCandidates` + Pass 2 `redFlags` |

### Unchanged

- Catalyst rollup from step scores (`updateCatalystRollup()`)
- Summary header recomputation (`updateSummary()`)
- Trending auto-population from STEPS definitions
- Notes enrichment with criteria snippets from CATALYST definitions
- Coaching indicator auto-check on corrections

## Voicemail / Non-Call Gate

A lightweight JS pre-check before Pass 1 runs. No AI call needed.

### Detection Signals

Scan first 30 lines + last 30 lines + overall transcript metrics:

- **Voicemail phrases:** "leave a message", "not available", "after the tone", "beep", "mailbox is full", "please record your message"
- **No customer engagement:** Zero `Customer:` lines in first 60 lines
- **Answering machine:** Heavy repetition of the same phrases, no back-and-forth
- **Too short:** Transcript under 20 lines total

### Behavior

- If detected: show warning banner ("This appears to be a voicemail or non-call. Scoring skipped.")
- Do not run Pass 1 or Pass 2
- In bulk mode: mark as "skipped" with reason in queue, exclude from trend reports

## Summary Header Timing Fix

### Root Cause

`updateSummary()` reads CSS classes from DOM elements to count ED/PD. Post-processing updates the `result` object, but if `updateSummary()` runs before `applyResult()` finishes rendering corrected scores to the DOM, the header shows stale counts.

### Fix

Ensure `updateSummary()` is called once, after `applyResult()` has fully rendered all corrected scores to the DOM. Move the call to the end of `applyResult()`.

## Orchestration Flow

```
User drops transcript
       |
       v
[Voicemail Gate] -- detected --> Show warning, stop
       |
       | (not voicemail)
       v
[Speaker Detection] -- existing call, unchanged
       |
       v
[Pass 1: Evidence Extraction] -- Ollama call #1
       |
       v
[JS: Validate extraction] -- sanity checks (required fields present, line numbers in range)
       |
       v
[Pass 2: Scoring Judgment] -- Ollama call #2
       |
       v
[Post-Processing v2] -- deterministic corrections using extraction + scores
       |
       v
[applyResult()] -- render to DOM
       |
       v
[updateSummary()] -- recompute header from final DOM state
```

### Bulk Path

Same pipeline per file. `runBulk()` calls extraction + scoring for each transcript sequentially (same as today's single `callAI()` per file, now two calls per file). The bulk progress UI should indicate which pass is running ("Extracting evidence..." / "Scoring...") in the queue item subtitle.

### Timing Impact

- Current: 1 AI call (~15-30s on local)
- New: 2 AI calls (~25-50s on local, extraction is faster since output is smaller)
- Speaker detection call unchanged
- Net impact: ~60-80% longer per evaluation. Acceptable given the quality improvement.

### Fallback

If Pass 1 fails (malformed JSON, timeout, missing required fields), fall back to the current single-pass `buildLocalPrompt()`. The warning message is explicit about quality implications:

> "Evidence extraction failed — using single-pass analysis. Scores may be less accurate."

The warning is shown in the AI status bar (single mode) or the queue item subtitle (bulk mode). The current single-pass prompt and post-processing are preserved as-is for this fallback path — they are not removed.

**Fallback tracking:** In bulk mode, a counter tracks how many calls fell back to single-pass. If >25% of a batch falls back, a summary warning is shown at the end: "X of Y calls used single-pass fallback. Consider checking Ollama model availability." This helps distinguish isolated failures from systemic extraction prompt issues.

### Per-Call Timeouts

Each AI call (Pass 1 and Pass 2) gets its own 5-minute timeout, matching the current per-call timeout. A Pass 1 timeout triggers fallback. A Pass 2 timeout (after successful Pass 1) also triggers fallback to single-pass for that call.

## Cloud Mode

Cloud mode (`buildCloudPrompt()`) is unaffected. The two-pass architecture applies only to local/Ollama evaluation. Cloud models (Claude) handle the combined task well in a single pass.

## Files Changed

- `scorecard/comcast_call_flow_scorecard_17.html` — all changes in this single file:
  - New function: `buildExtractionPrompt(transcript)` — Pass 1 prompt
  - New function: `buildScoringPrompt(extraction)` — Pass 2 prompt
  - New function: `validateExtraction(extraction, lineCount)` — Pass 1 validation
  - Modified function: `callAI()` — orchestrate two passes for local mode
  - Modified function: `postProcessAIResult()` — use extraction data for enhanced rules; consolidate duplicate post-processing logic currently split between `postProcessAIResult()` and inline in `applyResult()` (discovery pillar re-validation, step corrections, coaching indicator auto-checks) into a single pass through `postProcessAIResult()`
  - New function: `detectVoicemail(transcript)` — pre-analysis gate
  - Modified function: `applyResult()` — remove inline post-processing (moved to `postProcessAIResult()`), ensure `updateSummary()` called once at end
  - Modified function: `analyzeTranscript()` — add voicemail gate before AI call
  - Modified function: `runBulk()` — add voicemail gate, handle two-pass per file, show pass progress in queue UI

### Voicemail Gate Tuning

The 20-line minimum transcript threshold may need adjustment after testing with real data. Short but legitimate calls exist (e.g., customer immediately interested). Consider making the threshold configurable via the settings panel, defaulting to 20. The voicemail gate should also support a manual override — if the user drops a transcript and the gate fires, they can click "Analyze anyway" to bypass it.
