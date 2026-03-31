# Two-Pass Scoring Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-pass AI evaluation with a two-pass architecture (evidence extraction + scoring judgment) to fix step scoring accuracy, eliminate recency bias, and produce richer coaching narratives.

**Architecture:** Pass 1 extracts structured facts from the transcript (no scoring). Pass 2 scores against full ED/PD/DND criteria using only the extraction (never the transcript). Post-processing v2 uses extraction data for deterministic corrections on all 11 steps. Cloud mode is unaffected.

**Tech Stack:** Vanilla JS in a single HTML file (`scorecard/comcast_call_flow_scorecard_17.html`, ~5100 lines). Ollama local API (OpenAI-compatible endpoint). No build system, no dependencies beyond JSZip.

**Spec:** `docs/superpowers/specs/2026-03-30-two-pass-scoring-redesign.md`

---

## File Map

All changes are in a single file:

- **Modify:** `scorecard/comcast_call_flow_scorecard_17.html`
  - New functions: `buildExtractionPrompt()`, `buildScoringPrompt()`, `validateExtraction()`, `detectVoicemail()`, `buildDiscoveryPillars()`, `ollamaChat()`, `parseAIJSON()`
  - Modified functions: `callAI()`, `postProcessAIResult()`, `applyResult()`, `analyzeTranscript()`, `runBulk()`, `renderQueue()`, `updateQueueItem()`

**Speaker Detection Ownership:** `callAI()` owns speaker normalization. `analyzeTranscript()` is refactored to delegate all AI work to `callAI()` (removing its inline AI pipeline). This eliminates the current double-normalization in single mode.

Since this is a single-file app with no test framework, "testing" means running a real transcript through the tool and verifying output in the browser console + UI. Each task includes a manual verification step.

---

### Task 1: Voicemail / Non-Call Gate

**Files:**
- Modify: `scorecard/comcast_call_flow_scorecard_17.html` — insert new function near line ~1828 (before `analyzeTranscript`), modify `analyzeTranscript()` at line 1828, modify `runBulk()` at line 3555

This is the simplest change and provides immediate value. It also establishes the pattern for gating before AI calls.

- [ ] **Step 1: Add `detectVoicemail()` function**

Insert before `analyzeTranscript()` (line 1828). This is a pure JS function — no AI call.

```javascript
function detectVoicemail(transcript){
  if(!transcript) return null;
  const lines=transcript.split(/\r?\n/).filter(l=>l.trim());
  if(lines.length<20) return 'Transcript too short ('+lines.length+' lines) — may be a voicemail or dropped call.';
  const first30=lines.slice(0,30).join(' ').toLowerCase();
  const last30=lines.slice(-30).join(' ').toLowerCase();
  const scanText=first30+' '+last30;
  const vmPhrases=/leave\s*(a\s*)?message|not\s*available|after\s*the\s*(tone|beep)|mailbox\s*is\s*full|please\s*record\s*your\s*message|no\s*one\s*is\s*available/i;
  if(vmPhrases.test(scanText)) return 'Voicemail detected — transcript contains voicemail/answering machine phrases.';
  const first60=lines.slice(0,60);
  const customerLines=first60.filter(l=>/^Customer:/i.test(l));
  if(customerLines.length===0) return 'No customer responses found in the first 60 lines — may be a voicemail or one-sided call.';
  return null; // not a voicemail
}
```

- [ ] **Step 2: Wire voicemail gate into `analyzeTranscript()`**

In `analyzeTranscript()` at line ~1839, after the empty transcript check and before speaker detection, add:

```javascript
  // Voicemail / non-call gate
  const vmReason=detectVoicemail(transcript);
  if(vmReason){
    analyzeBtn.disabled=false;analyzeBtn.style.opacity='';analyzeBtn.style.pointerEvents='';
    statusEl.style.color='var(--amber-tx)';
    statusEl.innerHTML=esc2(vmReason)+' <button onclick="this.parentElement.textContent=\'\';analyzeTranscript()" style="margin-left:8px;padding:2px 10px;border-radius:4px;border:1px solid var(--amber-bd);background:var(--amber-bg);color:var(--amber-tx);cursor:pointer;font-size:12px;">Analyze anyway</button>';
    return;
  }
```

Note: The "Analyze anyway" button clears the status and re-calls `analyzeTranscript()`. On re-entry, the transcript hasn't changed, so the gate will fire again. To allow bypass, add a flag:

At the top of `analyzeTranscript()`, before the transcript check:
```javascript
  if(window._vmBypass){window._vmBypass=false;}
  else {
    const vmReason=detectVoicemail(transcript);
    if(vmReason){
      // ... show warning with button that sets window._vmBypass=true and re-calls
    }
  }
```

Update the button onclick to: `window._vmBypass=true;this.parentElement.textContent='';analyzeTranscript()`

- [ ] **Step 3: Wire voicemail gate into `runBulk()`**

In the `runBulk()` loop (line ~3623), before the `callAI()` call, add:

```javascript
      const vmReason=detectVoicemail(q.transcriptText);
      if(vmReason){
        q.status='skipped';q.error=vmReason;
        updateQueueItem(i);
        continue;
      }
```

- [ ] **Step 4: Verify manually**

Open the scorecard in a browser. Paste a very short transcript (<20 lines) and verify the warning appears. Paste a normal transcript and verify it proceeds normally. Click "Analyze anyway" and verify it bypasses the gate.

- [ ] **Step 5: Commit**

```bash
git add scorecard/comcast_call_flow_scorecard_17.html
git commit -m "Add voicemail/non-call detection gate before AI analysis"
```

---

### Task 2: Build the Extraction Prompt (Pass 1)

**Files:**
- Modify: `scorecard/comcast_call_flow_scorecard_17.html` — insert new function after `buildLocalPrompt()` (line ~1825)

This is the core of the two-pass architecture. The extraction prompt asks the model to walk the transcript and extract structured facts per call phase. No scoring, no judgment.

- [ ] **Step 1: Add `buildExtractionPrompt()` function**

Insert after `buildLocalPrompt()` (line ~1825). This function takes a transcript string (already speaker-normalized, already numbered) and returns the extraction prompt.

```javascript
function buildExtractionPrompt(transcript){
  const txLines=transcript.split(/\r?\n/);
  const totalLines=txLines.length;
  const numberedTranscript=txLines.map((l,i)=>`[${i+1}] ${l}`).join('\n');

  // Detect primary sale from opening lines (reuse existing pattern)
  const openingAgentLines=txLines.slice(0,60).filter(l=>/^Agent:/i.test(l)).map(l=>l.replace(/^Agent:\s*/i,'').trim());
  const agendaLine=openingAgentLines.find(l=>/reason.*(call|calling)|calling.*(because|you)|eligible|we see that|we.re reaching out/i.test(l))||'';

  return `You are a call transcript analyst. Extract structured facts from this Xfinity outbound telesales call. Report ONLY what you observe — no scores, no judgments, no recommendations.

TRANSCRIPTION NOTE: These are auto-generated transcripts with speech-to-text errors. "required to monitor" = "recorded and monitored", "trust privacy" = "Xfinity.com/privacy". Look for intent, not perfect text.

SPEAKER ROLES: Lines starting with "Agent:" are the sales agent. Lines starting with "Customer:" are the customer.

PHASE BOUNDARIES (approximate):
- Opening: lines 1-60
- Discovery: after opening, before pitch (agent asks questions)
- Pitch: agent presents products
- Close: agent asks customer to commit
- Objection handling: if customer pushes back (may not exist)
- Reaffirm & close: lines ${Math.max(1,totalLines-50)}-${totalLines}

DISCOVERY PILLARS — when the AGENT asks a question, classify which pillar it falls under:
- "users" = who is in the household, who uses services
- "usage" = how they use services/devices day to day
- "devices" = what devices they have or connect
- "cost" = what they currently pay, budget, price sensitivity
IMPORTANT: Only count questions the AGENT asks. The customer volunteering information is NOT agent discovery. The agent explaining products is NOT discovery.

COMPLIANCE PHRASES TO DETECT:
- Recording disclosure: "call is being recorded and monitored" / "privacy" / "Xfinity.com/privacy"
- Broadband labels: "xfinity.com/labels" or "broadband labels"
- Before submitting: "before submitting your order"
- Text consent: "message and data rates may apply"
- Post-approval: "order summary within 6 hours" / "xfinity.com/MyAccount"
- Closing: "1-800-XFINITY" / "934-6489" / "Xfinity.com"

AUTHENTICATION METHODS:
- "code" = 6-digit verification code collected
- "address_phone" = full service address AND phone number collected (including when framed as "contact info")
- "none" = no authentication performed

PRODUCT KNOWLEDGE (for product name matching):
${getProductKnowledge()}

${agendaLine?'PRIMARY SALE CONTEXT: The agent opened with: "'+agendaLine.slice(0,150)+'". This is the primary product being sold.':''}

=== TRANSCRIPT (${totalLines} lines) ===
${numberedTranscript}
=== END TRANSCRIPT ===

Extract the following JSON. Every fact MUST include line numbers. Report only what is observable in the transcript.

{
  "customerType": "existing|new",
  "opening": {
    "greetingLines": [line numbers of greeting/intro],
    "recordingDisclosure": {"present": true/false, "lines": [line numbers if present]},
    "customerNameUsed": true/false,
    "agendaStatement": {"present": true/false, "lines": [line numbers], "salesIntent": true/false, "summary": "brief reason for call"},
    "authentication": {"method": "code|address_phone|none", "lines": [line numbers if applicable]},
    "tone": "warm|neutral|flat|scripted"
  },
  "discovery": {
    "agentQuestions": [{"line": N, "pillar": "users|usage|devices|cost", "openEnded": true/false, "text": "brief paraphrase of question"}],
    "customerVolunteered": [{"line": N, "topic": "what they shared unprompted"}],
    "pillarsAsked": ["list of pillars the AGENT asked about"]
  },
  "pitch": {
    "productsPitched": [{"product": "product name", "lines": [N,N], "tiedToDiscovery": true/false, "tieBack": "what discovery point it referenced, or empty"}],
    "broadbandLabels": {"mentioned": true/false, "line": N or 0},
    "deliveryStyle": "confident|hesitant|rushed|generic",
    "primarySale": "product name from agenda"
  },
  "close": {
    "assumptiveAsk": {"present": true/false, "lines": [N], "confident": true/false},
    "customerResponse": "accepted|objected|hesitated|deferred"
  },
  "objections": [
    {
      "customerObjection": {"line": N, "summary": "what they said"},
      "agentAcknowledged": true/false,
      "agentDiscoveredReason": true/false,
      "rebuttalLines": [N,N],
      "rebuttalApproach": "empathy+value|pressure|gave_up|ignored",
      "reClose": {"present": true/false, "lines": [N], "confident": true/false}
    }
  ],
  "reaffirmAndClose": {
    "reaffirmation": {"present": true/false, "lines": [N], "genuine": true/false},
    "positiveClose": {"present": true/false, "lines": [N,N], "checkedForQuestions": true/false},
    "closingCompliance": {"delivered": true/false, "lines": [N]},
    "orderSummary": {
      "productsRecapped": true/false,
      "pricingStated": true/false,
      "promoTerms": true/false,
      "rollToRate": true/false,
      "installDetails": true/false,
      "nextSteps": true/false,
      "beforeSubmitting": true/false,
      "textConsent": true/false,
      "postApproval": true/false,
      "lines": [N,N]
    }
  },
  "processIssues": [{"line": N, "type": "long_hold|confusion|tech_difficulty|repeated_attempt", "summary": "brief"}],
  "redFlagCandidates": [{"line": N, "type": "rf1|rf2|rf3|rf4|rf5|rf6", "summary": "brief factual description"}],
  "appreciationInstances": [{"line": N, "what": "brief"}],
  "xfinityMembershipMentioned": true/false,
  "personalRapportMoments": [{"line": N, "what": "brief"}],
  "scriptedMoments": [{"line": N, "what": "brief"}],
  "customerRepeatedSelf": [{"line": N, "what": "brief"}]
}

Respond with valid JSON only. Start with {
\n/no_think`;
}
```

- [ ] **Step 2: Verify prompt size**

Add a temporary console.log in `analyzeTranscript()`:
```javascript
console.log('Extraction prompt size:', buildExtractionPrompt(normalizedTranscript).length, 'chars (~' + Math.round(buildExtractionPrompt(normalizedTranscript).length/4) + ' tokens)');
```

Load a transcript and check the console. Should be ~15-20K tokens for a long call. Remove the temp log after verifying.

- [ ] **Step 3: Commit**

```bash
git add scorecard/comcast_call_flow_scorecard_17.html
git commit -m "Add buildExtractionPrompt() for Pass 1 evidence extraction"
```

---

### Task 3: Build the Scoring Prompt (Pass 2)

**Files:**
- Modify: `scorecard/comcast_call_flow_scorecard_17.html` — insert new function after `buildExtractionPrompt()`

Pass 2 receives the extraction JSON (not the transcript) and scores against full ED/PD/DND criteria.

- [ ] **Step 1: Add `buildScoringPrompt()` function**

Insert after `buildExtractionPrompt()`. This function takes the Pass 1 extraction JSON object and returns the scoring prompt.

```javascript
function buildScoringPrompt(extraction){
  const stepsJSON=JSON.stringify(STEPS.map(s=>({id:s.id,name:s.name,type:s.type,catalyst:s.catalyst,desc:s.desc,trending:s.trending})));
  const catalystJSON=JSON.stringify(CATALYST.map(c=>({id:c.id,name:c.name,intent:c.intent,criteria:c.criteria})));
  const rfJSON=JSON.stringify(RED_FLAGS.map(rf=>({id:rf.id,name:rf.name,desc:rf.desc,subs:rf.subs})));
  const complianceJSON=JSON.stringify(COMPLIANCE_ITEMS.map(c=>({id:c.id,name:c.name,desc:c.desc,na:c.na})));

  return `You are an expert Xfinity outbound telesales quality evaluator. Score this call based on the EVIDENCE EXTRACTION below — structured facts extracted from the transcript. You will NOT see the transcript itself.

SCORING PHILOSOPHY:
Grade in a vacuum — evaluate what worked for this specific customer on this specific call. If the agent accomplished the goal of a step even imperfectly, that is at minimum "pd". Reserve "dnd" for steps the agent completely skipped or failed entirely.

SCORING VALUES — strings only:
- "cat" type steps: "ed", "pd", "dnd", "na"
- "yn" type steps: "yes", "no", "na"
- Score "na" only when genuinely not applicable (no objection raised, no sale made, call ended early).

CATALYST BEHAVIORS — score each independently using the criteria below. Each behavior has specific ed/pd/dnd definitions:
${catalystJSON}

COACHING CONTEXT INSTRUCTIONS:
Use the extraction data to produce SPECIFIC, ACTIONABLE coaching:
- Compare discovery.pillarsAsked vs ["users","usage","devices","cost"] — name the missing pillars and suggest specific questions
- For each product in pitch.productsPitched: if tiedToDiscovery is false, call this out as a generic pitch and explain how a tie-back would have worked using what WAS discovered
- For each objection: map the agent's approach against the 4-step framework (understand > empathize > restate > add value) — identify where the breakdown occurred
- Use processIssues, customerRepeatedSelf, and scriptedMoments to assess effortlessness — cite specific line numbers
- Use appreciationInstances, personalRapportMoments, and xfinityMembershipMentioned to assess engagement quality
- OPPORTUNITY PRIORITY: Discovery > Linking/Ambassador > Effortless > Own It > Appreciation > Engagement. If discovery was absent, it MUST be the #1 opportunity.

STEP DEFINITIONS AND CRITERIA (score each step):
${stepsJSON}

RED FLAG DEFINITIONS:
${rfJSON}
IMPORTANT: Only confirm red flags that appear in the extraction's redFlagCandidates. Do NOT flag items not present in the extraction.

COMPLIANCE ITEMS (score each yes/no/na):
${complianceJSON}

PRODUCT KNOWLEDGE:
${getProductKnowledge()}

CAMPAIGNS: "Xfinity Mobile Add A Line" | "XM Likely" | "Add XMC" | "Nonsub BAU" | ""

=== EVIDENCE EXTRACTION ===
${JSON.stringify(extraction, null, 2)}
=== END EXTRACTION ===

Score ALL 11 steps, ALL 6 red flags, ALL 11 compliance items, ALL 6 catalyst behaviors. Produce a complete executiveSummary.

JSON structure:
{
  "customerType": "${extraction.customerType||'existing'}",
  "steps": [
    {"id":1, "score":"ed|pd|dnd|na", "trending":[], "notes":"coaching note referencing (line X)", "evidenceLines":[N,N]},
    ... all 11 steps
  ],
  "redFlags": [
    {"id":"rf1","flagged":false,"subs":[],"notes":""}, ... all 6
  ],
  "compliance": [
    {"id":"c1","score":"yes|no|na","notes":"..."}, ... all 11
  ],
  "catalystBehaviors": [
    {"id":"b1","score":"ed|pd|dnd","notes":"2-3 sentences with (line X) references"}, ... all 6
  ],
  "productFlags": [],
  "suggestedOutcome": "Successful sale | No sale – [reason]",
  "suggestedCampaign": "",
  "primarySale": {"product":"from extraction.pitch.primarySale","outcome":"Sold or Not sold - reason"},
  "upsell": {"product":"secondary product or None","outcome":"..."},
  "executiveSummary": {
    "topPriority": "5-8 word coaching headline from THIS call",
    "summary": "3-5 sentence narrative of the full call. Walk through chronologically: opening, discovery, pitch, close. Call out the pivotal moment. Reference (line X). Write for a manager sharing with the agent.",
    "strengths": ["MINIMUM 2. Reference (line X). Explain WHY through Catalyst behaviors."],
    "opportunities": ["MINIMUM 2. Reference (line X). Prioritize: Discovery > Linking > Effortless > Own It > Appreciation > Engagement."],
    "critical": [],
    "salesCoaching": [{"compassPhase":"Connect|Explore|Consult|Overcome|Review","focus":"label","what":"specific guidance citing transcript evidence","evidenceLines":[N],"example":"concrete script they could use","priority":"high|medium"}],
    "complianceCoaching": [{"compassPhase":"Connect|Review","focus":"label","what":"compliance gap description","evidenceLines":[N],"example":"exact verbatim they should deliver","priority":"high|medium"}]
  }
}

Respond with valid JSON only. Start with {
\n/no_think`;
}
```

- [ ] **Step 2: Verify prompt size with sample extraction**

Create a test extraction object in the console and check size:
```javascript
console.log('Scoring prompt size:', buildScoringPrompt({customerType:'existing',opening:{},discovery:{agentQuestions:[],pillarsAsked:[]},pitch:{productsPitched:[]},close:{},objections:[],reaffirmAndClose:{}}).length, 'chars');
```

Should be ~8-12K tokens. Well within budget.

- [ ] **Step 3: Commit**

```bash
git add scorecard/comcast_call_flow_scorecard_17.html
git commit -m "Add buildScoringPrompt() for Pass 2 scoring judgment"
```

---

### Task 4: Extraction Validation

**Files:**
- Modify: `scorecard/comcast_call_flow_scorecard_17.html` — insert new function after `buildScoringPrompt()`

- [ ] **Step 1: Add `validateExtraction()` function**

```javascript
function validateExtraction(ext, lineCount){
  // Returns {valid:true, extraction:ext} or {valid:false, reason:'...'}
  if(!ext||typeof ext!=='object') return {valid:false,reason:'Extraction is not an object'};

  // Required top-level fields
  const required=['customerType','opening','discovery','pitch','close','reaffirmAndClose'];
  for(const key of required){
    if(!(key in ext)) return {valid:false,reason:'Missing required field: '+key};
  }
  // Required sub-fields
  if(!ext.opening.greetingLines&&!ext.opening.recordingDisclosure) return {valid:false,reason:'Opening missing greetingLines and recordingDisclosure'};
  if(!Array.isArray(ext.discovery.agentQuestions)) return {valid:false,reason:'discovery.agentQuestions must be an array'};
  if(!Array.isArray(ext.discovery.pillarsAsked)) return {valid:false,reason:'discovery.pillarsAsked must be an array'};
  if(!Array.isArray(ext.pitch.productsPitched)) return {valid:false,reason:'pitch.productsPitched must be an array'};

  // Apply defaults for optional fields
  if(!Array.isArray(ext.objections)) ext.objections=[];
  if(!Array.isArray(ext.processIssues)) ext.processIssues=[];
  if(!Array.isArray(ext.redFlagCandidates)) ext.redFlagCandidates=[];
  if(!Array.isArray(ext.appreciationInstances)) ext.appreciationInstances=[];
  if(!Array.isArray(ext.personalRapportMoments)) ext.personalRapportMoments=[];
  if(!Array.isArray(ext.scriptedMoments)) ext.scriptedMoments=[];
  if(!Array.isArray(ext.customerRepeatedSelf)) ext.customerRepeatedSelf=[];
  if(typeof ext.xfinityMembershipMentioned!=='boolean') ext.xfinityMembershipMentioned=false;
  if(!ext.opening.authentication) ext.opening.authentication={method:'none',lines:[]};
  if(!ext.opening.tone) ext.opening.tone='neutral';
  if(!ext.pitch.broadbandLabels) ext.pitch.broadbandLabels={mentioned:false};
  if(!ext.pitch.deliveryStyle) ext.pitch.deliveryStyle='generic';
  if(!ext.reaffirmAndClose.orderSummary){
    ext.reaffirmAndClose.orderSummary={productsRecapped:false,pricingStated:false,promoTerms:false,rollToRate:false,installDetails:false,nextSteps:false,beforeSubmitting:false,textConsent:false,postApproval:false,lines:[]};
  }

  // Clamp line numbers to valid range [1, lineCount]
  function clampLines(obj){
    if(!obj||typeof obj!=='object') return;
    for(const key of Object.keys(obj)){
      const val=obj[key];
      if(key==='line'&&typeof val==='number'){
        obj[key]=Math.max(1,Math.min(val,lineCount));
      } else if(key==='lines'&&Array.isArray(val)){
        obj[key]=val.filter(n=>typeof n==='number').map(n=>Math.max(1,Math.min(n,lineCount)));
      } else if(key==='evidenceLines'&&Array.isArray(val)){
        obj[key]=val.filter(n=>typeof n==='number').map(n=>Math.max(1,Math.min(n,lineCount)));
      } else if(Array.isArray(val)){
        val.forEach(item=>clampLines(item));
      } else if(typeof val==='object'&&val!==null){
        clampLines(val);
      }
    }
  }
  clampLines(ext);

  return {valid:true,extraction:ext};
}
```

- [ ] **Step 2: Commit**

```bash
git add scorecard/comcast_call_flow_scorecard_17.html
git commit -m "Add validateExtraction() for Pass 1 output validation"
```

---

### Task 5: Add `buildDiscoveryPillars()` Helper

**Files:**
- Modify: `scorecard/comcast_call_flow_scorecard_17.html` — insert after `validateExtraction()`

Per the spec, `discoveryPillars` is built deterministically in JS from Pass 1 data, not from Pass 2.

- [ ] **Step 1: Add `buildDiscoveryPillars()` function**

```javascript
function buildDiscoveryPillars(extraction){
  const pillars={
    users:{asked:false,evidenceLine:0,whatWasLearned:'Not asked by agent'},
    usage:{asked:false,evidenceLine:0,whatWasLearned:'Not asked by agent'},
    devices:{asked:false,evidenceLine:0,whatWasLearned:'Not asked by agent'},
    cost:{asked:false,evidenceLine:0,whatWasLearned:'Not asked by agent'}
  };
  if(!extraction||!extraction.discovery) return pillars;
  const asked=extraction.discovery.pillarsAsked||[];
  const questions=extraction.discovery.agentQuestions||[];
  for(const p of ['users','usage','devices','cost']){
    if(asked.includes(p)){
      pillars[p].asked=true;
      const q=questions.find(q=>q.pillar===p);
      if(q){
        pillars[p].evidenceLine=q.line||0;
        pillars[p].whatWasLearned=q.text||'Asked by agent';
      }
    }
  }
  return pillars;
}
```

- [ ] **Step 2: Commit**

```bash
git add scorecard/comcast_call_flow_scorecard_17.html
git commit -m "Add buildDiscoveryPillars() to derive pillars from extraction"
```

---

### Task 6: Rewire `callAI()` for Two-Pass Local Mode

**Files:**
- Modify: `scorecard/comcast_call_flow_scorecard_17.html` — rewrite `callAI()` at line 3713

This is the orchestration heart. For local mode, `callAI()` now runs two Ollama calls instead of one. Cloud mode is unchanged.

- [ ] **Step 1: Add `parseAIJSON()` helper**

Insert near `stripToJSON`/`repairJSON` (line ~1381). This consolidates the repeated parse-repair-extract pattern used throughout:

```javascript
function parseAIJSON(raw){
  const clean=stripToJSON(raw);
  let result;
  try{result=JSON.parse(clean);}catch(e){
    try{result=JSON.parse(repairJSON(clean));}catch(e2){}
    if(!result){const m=clean.match(/\{[\s\S]*\}/);if(m) try{result=JSON.parse(repairJSON(m[0]));}catch(e3){}}
  }
  if(!result) throw new Error('Could not parse AI JSON response');
  return result;
}
```

- [ ] **Step 2: Extract Ollama call into a reusable helper**

The current `callAI()` has the Ollama fetch logic inline. Extract it so both passes can use it. Insert before `callAI()`:

```javascript
async function ollamaChat(systemMsg, userMsg, maxTokens=16384){
  const base=(document.getElementById('ollama-url').value||'http://localhost:11434').trim();
  const model=(document.getElementById('ollama-model').value||document.getElementById('ollama-speaker-model')?.value||'').trim();
  const TIMEOUT_MS=5*60*1000;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
  try{
    const res=await fetch(`${base}/v1/chat/completions`,{
      method:'POST',signal:controller.signal,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model,
        messages:[
          {role:'system',content:systemMsg},
          {role:'user',content:userMsg}
        ],
        max_tokens:maxTokens,
        stream:false,
        temperature:0.1,
        options:{num_ctx:65536,num_predict:maxTokens}
      })
    });
    clearTimeout(timer);
    if(!res.ok){
      const txt=await res.text().catch(()=>'');
      throw new Error(`Ollama ${res.status}${txt?' — '+txt.slice(0,80):''}`);
    }
    const d=await res.json();
    const bmsg=d?.choices?.[0]?.message||{};
    let raw=bmsg.content||'';
    if(!raw||raw.trim().length<10) raw=bmsg.reasoning||'';
    return raw;
  } catch(e){
    clearTimeout(timer);
    if(e.name==='AbortError') throw new Error('Request timed out after 5 minutes — try a faster model or shorter transcript');
    if(e instanceof TypeError&&e.message==='Failed to fetch') throw new Error('Cannot reach Ollama (CORS blocked). Run: set OLLAMA_ORIGINS=* && ollama serve');
    throw e;
  }
}
```

- [ ] **Step 3: Rewrite `callAI()` with two-pass orchestration**

Replace the body of `callAI()` (line 3713-3805). Keep the speaker normalization at the top and the cloud path. Add two-pass for local:

```javascript
async function callAI(transcript, attempt=1){
  // Normalize SPEAKER_XX labels to Agent/Customer before scoring
  let normalizedTranscript=transcript;
  const hasSpeakerIds=/^SPEAKER_\d+:/m.test(transcript);
  if(hasSpeakerIds){
    const spkMap=await detectSpeakersWithAI(transcript);
    if(spkMap&&Object.keys(spkMap).length){
      const lines=transcript.split(/\r?\n/);
      normalizedTranscript=lines.map(line=>{
        const m=line.match(/^(SPEAKER_\d+):\s*/);
        if(!m) return line;
        const role=spkMap[m[1]];
        const label=role==='agent'?'Agent':'Customer';
        return label+': '+line.slice(m[0].length);
      }).join('\n');
    }
  }

  let result;

  if(currentMode==='cloud'){
    // Cloud mode: single pass (unchanged)
    const prompt=buildCloudPrompt(normalizedTranscript);
    const apiKey=(document.getElementById('ai-api-key').value||'').trim();
    const model=document.getElementById('cloud-model').value;
    const TIMEOUT_MS=5*60*1000;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',signal:controller.signal,
        headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({model,max_tokens:8192,messages:[{role:'user',content:prompt}]})
      });
      clearTimeout(timer);
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e?.error?.message||`API ${res.status}`);}
      const d=await res.json();
      const raw=d?.content?.[0]?.text||'';
      result=parseAIJSON(raw);
    } catch(e){
      clearTimeout(timer);
      if(e.name==='AbortError') throw new Error('Request timed out after 5 minutes');
      throw e;
    }
    postProcessAIResult(result, normalizedTranscript);
  } else {
    // Local mode: two-pass architecture
    const lineCount=normalizedTranscript.split(/\r?\n/).length;
    let extraction=null;
    let usedFallback=false;

    // ── Pass 1: Evidence Extraction ──
    try{
      const sysMsg='Respond with only valid JSON. No thinking, no markdown, no explanation.';
      const extractionPrompt=buildExtractionPrompt(normalizedTranscript);
      console.log('Pass 1 (extraction) prompt size:', extractionPrompt.length, 'chars (~'+Math.round(extractionPrompt.length/4)+' tokens)');
      const rawExtraction=await ollamaChat(sysMsg, extractionPrompt, 8192);
      const cleanExt=stripToJSON(rawExtraction);
      let parsed;
      try{parsed=JSON.parse(cleanExt);}catch(e){
        try{parsed=JSON.parse(repairJSON(cleanExt));}catch(e2){}
        if(!parsed){const m=cleanExt.match(/\{[\s\S]*\}/);if(m) try{parsed=JSON.parse(repairJSON(m[0]));}catch(e3){}}
      }
      if(parsed){
        const validation=validateExtraction(parsed, lineCount);
        if(validation.valid) extraction=validation.extraction;
        else console.warn('Extraction validation failed:', validation.reason);
      }
    } catch(e){
      console.warn('Pass 1 extraction failed:', e.message);
    }

    if(extraction){
      // ── Pass 2: Scoring Judgment ──
      try{
        const sysMsg='You are a precise JSON-only responder. Output ONLY valid JSON. All scores MUST be strings: "ed", "pd", "dnd", "na", "yes", or "no".';
        const scoringPrompt=buildScoringPrompt(extraction);
        console.log('Pass 2 (scoring) prompt size:', scoringPrompt.length, 'chars (~'+Math.round(scoringPrompt.length/4)+' tokens)');
        const rawScoring=await ollamaChat(sysMsg, scoringPrompt, 16384);
        const cleanScore=stripToJSON(rawScoring);
        try{result=JSON.parse(cleanScore);}catch(e){
          try{result=JSON.parse(repairJSON(cleanScore));}catch(e2){}
          if(!result){const m=cleanScore.match(/\{[\s\S]*\}/);if(m) try{result=JSON.parse(repairJSON(m[0]));}catch(e3){}}
        }
        if(result){
          // Attach extraction for post-processing and downstream consumers
          result._extraction=extraction;
          // Build discoveryPillars deterministically from extraction
          result.discoveryPillars=buildDiscoveryPillars(extraction);
        }
      } catch(e){
        console.warn('Pass 2 scoring failed:', e.message);
        result=null;
      }
    }

    // ── Fallback: single-pass if either pass failed ──
    if(!result){
      usedFallback=true;
      console.warn('Two-pass failed, falling back to single-pass');
      const prompt=buildLocalPrompt(normalizedTranscript);
      const sysMsg='You are a precise JSON-only responder. After any thinking, output ONLY valid JSON. No markdown fences, no backticks. All scores MUST be strings, NEVER numbers.';
      const raw=await ollamaChat(sysMsg, prompt, 16384);
      const clean=stripToJSON(raw);
      try{result=JSON.parse(clean);}catch(e){
        try{result=JSON.parse(repairJSON(clean));}catch(e2){}
        if(!result){const m=clean.match(/\{[\s\S]*\}/);if(m) try{result=JSON.parse(repairJSON(m[0]));}catch(e3){}}
      }
      if(!result){
        if(attempt<2){await sleep(3000);return callAI(transcript,2);}
        throw new Error('Could not parse AI JSON response after 2 attempts');
      }
    }

    postProcessAIResult(result, normalizedTranscript);
    if(usedFallback) result._fallback=true;
  }

  result._normalizedTranscript=normalizedTranscript;
  return result;
}
```

- [ ] **Step 4: Verify manually**

Run a transcript through local mode. Check the browser console for:
- "Pass 1 (extraction) prompt size: ..."
- "Pass 2 (scoring) prompt size: ..."
- No fallback warning

Verify scores appear in the UI.

- [ ] **Step 5: Commit**

```bash
git add scorecard/comcast_call_flow_scorecard_17.html
git commit -m "Rewire callAI() for two-pass local mode with fallback"
```

---

### Task 7: Rewire `analyzeTranscript()` to Delegate to `callAI()`

**Files:**
- Modify: `scorecard/comcast_call_flow_scorecard_17.html` — rewrite `analyzeTranscript()` at line 1828

**CRITICAL:** The existing `analyzeTranscript()` has its OWN inline AI pipeline (builds prompt, fetches from Ollama/Anthropic, parses JSON, calls `applyResult()`). It does NOT call `callAI()`. If we don't rewire it, the two-pass architecture only works in bulk mode. Single-mode analysis would still use the old single-pass flow.

Additionally, `analyzeTranscript()` currently does its own speaker normalization (lines 1900-1926), which duplicates what `callAI()` already does. After this task, `callAI()` is the single owner of speaker detection + AI orchestration.

- [ ] **Step 1: Rewrite `analyzeTranscript()` to delegate to `callAI()`**

Replace the entire function body. Keep: voicemail gate (from Task 1), progress bar, elapsed timer, chime, error handling. Remove: inline speaker detection, inline prompt building, inline fetch, inline JSON parsing. Add: single `callAI()` call.

The key structural change:

```javascript
async function analyzeTranscript(){
  const analyzeBtn=document.getElementById('analyze-btn');
  if(analyzeBtn.disabled) return;
  analyzeBtn.disabled=true;
  analyzeBtn.style.opacity='0.5';
  analyzeBtn.style.pointerEvents='none';

  const transcript=(document.getElementById('ai-transcript').value||'').trim();
  const statusEl=document.getElementById('ai-status');
  const progress=document.getElementById('ai-progress');

  if(!transcript){analyzeBtn.disabled=false;analyzeBtn.style.opacity='';analyzeBtn.style.pointerEvents='';statusEl.style.color='var(--red-tx)';statusEl.textContent='Please paste a transcript first.';return;}

  // Voicemail gate (from Task 1)
  if(!window._vmBypass){
    const vmReason=detectVoicemail(transcript);
    if(vmReason){
      analyzeBtn.disabled=false;analyzeBtn.style.opacity='';analyzeBtn.style.pointerEvents='';
      statusEl.style.color='var(--amber-tx)';
      statusEl.innerHTML=esc2(vmReason)+' <button onclick="window._vmBypass=true;this.parentElement.textContent=\'\';analyzeTranscript()" style="margin-left:8px;padding:2px 10px;border-radius:4px;border:1px solid var(--amber-bd);background:var(--amber-bg);color:var(--amber-tx);cursor:pointer;font-size:12px;">Analyze anyway</button>';
      return;
    }
  } else { window._vmBypass=false; }

  statusEl.style.color='var(--text2)';
  progress.classList.add('active');
  const progressBar=progress.querySelector('.ai-progress-bar');
  if(progressBar) progressBar.style.width='0%';

  // Progress bar + elapsed timer
  let progressPct=0;
  const startTime=Date.now();
  const elapsedEl=document.getElementById('ai-elapsed');
  if(elapsedEl) elapsedEl.textContent='0s';
  const progressTimer=setInterval(()=>{
    if(progressPct<10) progressPct+=3;          // 0-10%: speaker detection
    else if(progressPct<20) progressPct+=2;      // 10-20%: extraction prompt sent
    else if(progressPct<45) progressPct+=1;      // 20-45%: Pass 1 running
    else if(progressPct<55) progressPct+=1.5;    // 45-55%: scoring prompt sent
    else if(progressPct<80) progressPct+=0.8;    // 55-80%: Pass 2 running
    else if(progressPct<90) progressPct+=0.3;    // 80-90%: post-processing
    else if(progressPct<95) progressPct+=0.1;    // 90-95%: slow crawl
    if(progressBar) progressBar.style.width=Math.min(progressPct,95)+'%';
    if(elapsedEl) elapsedEl.textContent=Math.round((Date.now()-startTime)/1000)+'s';
  },500);

  // Keep existing playChime() and stopProgress() helpers (copy from current code)
  function playChime(success){ /* ... existing chime code unchanged ... */ }
  function stopProgress(success){
    clearInterval(progressTimer);
    if(progressBar) progressBar.style.width=success?'100%':'0%';
    const totalSec=Math.round((Date.now()-startTime)/1000);
    if(elapsedEl) elapsedEl.textContent=success?totalSec+'s':'';
    setTimeout(()=>progress.classList.remove('active'),success?800:0);
    playChime(success);
    const ab=document.getElementById('analyze-btn');
    if(ab){ab.disabled=false;ab.style.opacity='';ab.style.pointerEvents='';}
  }

  statusEl.textContent=currentMode==='cloud'?'Sending to Anthropic…':'Extracting evidence…';

  try{
    // callAI() now owns: speaker detection, two-pass (local), single-pass (cloud), post-processing
    const result=await callAI(transcript);

    // Write normalized transcript back to textarea (for evidence panel)
    if(result._normalizedTranscript){
      document.getElementById('ai-transcript').value=result._normalizedTranscript;
    }

    // Render to DOM
    clearAll();
    applyResult(result);
    stopProgress(true);

    const totalSec=Math.round((Date.now()-startTime)/1000);
    if(result._fallback){
      statusEl.style.color='var(--amber-tx)';
      statusEl.textContent='Evidence extraction failed — used single-pass analysis. Scores may be less accurate. ('+totalSec+'s)';
    } else {
      statusEl.style.color='var(--green-tx)';
      statusEl.textContent='Analysis complete. ('+totalSec+'s)';
    }
  } catch(e){
    stopProgress(false);
    statusEl.style.color='var(--red-tx)';
    statusEl.textContent='Error: '+e.message;
    console.error('Analysis failed:', e);
  }
}
```

**Important:** The existing `playChime()` function body (lines 1860-1887) should be copied as-is into the new version. The `stopProgress()` body (lines 1888-1898) should also be copied. Only the AI pipeline portion is replaced.

- [ ] **Step 2: Remove speaker normalization from `callAI()` for single-mode safety**

Actually, keep speaker normalization in `callAI()` — it's needed for bulk mode where `runBulk()` passes raw transcripts. The old `analyzeTranscript()` normalization is simply gone now (no duplication).

Verify: In `callAI()`, the `speakerSeedMap` cache variable (line 1305) is used by `analyzeTranscript()` to avoid re-detecting speakers. Since `callAI()` does its own detection, this cache is no longer needed in `analyzeTranscript()`. But `callAI()` should also use the cache for efficiency. Add at the top of `callAI()`:

```javascript
  // Use cached speaker map if available (set by prior call in same session)
  if(hasSpeakerIds && speakerSeedMap && Object.keys(speakerSeedMap).length){
    // Use cache instead of re-detecting
  } else if(hasSpeakerIds){
    speakerSeedMap = await detectSpeakersWithAI(transcript);
  }
```

- [ ] **Step 3: Verify manually**

Run a transcript in single mode. Check console for Pass 1/Pass 2 logs. Verify speaker detection happens only once. Verify the fallback warning if extraction fails.

- [ ] **Step 4: Commit**

```bash
git add scorecard/comcast_call_flow_scorecard_17.html
git commit -m "Rewire analyzeTranscript() to delegate to callAI() — two-pass works in single mode"
```

---

### Task 8: Post-Processing v2

**Files:**
- Modify: `scorecard/comcast_call_flow_scorecard_17.html` — rewrite `postProcessAIResult()` at line 3808

This is the biggest logic change. Post-processing now uses extraction data for enhanced rules on all 11 steps.

- [ ] **Step 1: Rewrite `postProcessAIResult()` with extraction-aware rules**

The function signature stays the same: `postProcessAIResult(result, transcript)`. It checks for `result._extraction` and uses it when available; falls back to current regex-based logic when not (for the single-pass fallback path and cloud mode).

Replace the function body (lines 3808-3948). The new version:

```javascript
function postProcessAIResult(result, transcript){
  if(!result||!transcript) return;
  const txLines=transcript.split(/\r?\n/);
  const ext=result._extraction; // null for cloud/fallback

  // ── Normalize alternate key names (unchanged) ──
  if(!result.catalystBehaviors){
    result.catalystBehaviors=result.catalyst||result.behaviors||result.catalyst_behaviors||[];
  }
  if(!result.redFlags) result.redFlags=result.red_flags||result.flags||[];
  if(!result.compliance) result.compliance=result.complianceItems||result.compliance_items||[];
  if(!result.steps) result.steps=[];
  if(!result.executiveSummary) result.executiveSummary=result.executive_summary||{};

  // Ensure steps is an array of 11
  const stepsMap={};
  (result.steps||[]).forEach(s=>{stepsMap[Number(s.id)||s.id]=s;});

  // ── Discovery pillar count ──
  let pillarsAsked=0;
  let hasDiscovery=false;
  if(ext){
    // Two-pass: use extraction data
    pillarsAsked=(ext.discovery.pillarsAsked||[]).length;
    hasDiscovery=pillarsAsked>=2;
  } else {
    // Fallback: regex scan (existing logic)
    const agentLines=txLines.filter(l=>/^Agent:/i.test(l)).map(l=>l.replace(/^Agent:\s*/i,'').trim().toLowerCase());
    const agentQs=agentLines.filter(l=>l.includes('?'));
    const costAsked=agentQs.some(l=>/how much|what.*(pay|spend|cost|bill|budget|current.*plan|monthly)|price|afford/i.test(l));
    const devicesAsked=agentQs.some(l=>/what.*(device|phone|tablet|watch|laptop|computer|smart)|how many.*(device|phone)|which.*(phone|device)|do you have.*(iphone|android|samsung|pixel|apple)/i.test(l));
    const usersAsked=agentQs.some(l=>/who.*(use|live|house|home|family)|how many.*(people|line|user|member|person)|anyone.*else|household|family/i.test(l));
    const usageAsked=agentQs.some(l=>/how.*(use|stream|watch|game|browse|work)|what.*(use.*for|do.*with|stream|watch)|do you.*(stream|game|work|browse)/i.test(l));
    pillarsAsked=(costAsked?1:0)+(devicesAsked?1:0)+(usersAsked?1:0)+(usageAsked?1:0);
    hasDiscovery=pillarsAsked>=2;
  }

  // ── Process friction detection ──
  let hasProcessFriction=false;
  if(ext){
    hasProcessFriction=(ext.processIssues||[]).length>=2;
  } else {
    const frictionRx=/please enter a valid|can't use|try.*again|here we go again|i'm lost|what is saying|let me resend/gi;
    const frictionHits=(transcript.match(frictionRx)||[]).length;
    hasProcessFriction=frictionHits>=2;
  }

  // ── Recording disclosure ──
  let hasRecordingDisclosure=false;
  if(ext){
    hasRecordingDisclosure=ext.opening?.recordingDisclosure?.present===true;
  } else {
    const openingText=txLines.slice(0,60).join(' ');
    hasRecordingDisclosure=/record|monitor|quality.*standard|privacy/i.test(openingText);
  }

  // ── Catalyst behavior corrections ──
  const cb=result.catalystBehaviors||[];
  const b3=cb.find(c=>c.id==='b3')||{};
  const b4=cb.find(c=>c.id==='b4')||{};
  const b5=cb.find(c=>c.id==='b5')||{};

  // B4 (Discover Needs): pillar-based cap
  if(b4.score){
    const s=b4.score.toLowerCase();
    if(pillarsAsked<=1&&(s==='ed'||s==='pd')){b4.score='dnd';}
    else if(pillarsAsked<=3&&s==='ed'){b4.score='pd';}
  }
  // B5 (Be an Ambassador): capped by B4
  if(b5.score&&b4.score){
    if((b4.score==='dnd'||b4.score==='pd')&&b5.score==='ed') b5.score='pd';
  }
  // B3 (Make It Effortless): friction cap
  if(b3.score&&hasProcessFriction&&b3.score==='ed') b3.score='pd';

  // ── Catalyst notes enrichment with criteria (unchanged logic) ──
  cb.forEach(c=>{
    const def=CATALYST.find(cat=>cat.id===c.id);
    if(!def||!def.criteria) return;
    const sc=(c.score||'').toLowerCase();
    const criteriaText=def.criteria[sc]||'';
    if(criteriaText){
      const first3=criteriaText.split(/\.\s+/).slice(0,3).join('. ')+'.';
      const aiNote=(c.notes||'').trim();
      const isGeneric=!aiNote||aiNote.length<30||/no linking|no engagement|generic|not applicable/i.test(aiNote);
      c.notes=isGeneric?first3:(aiNote+' '+first3);
    }
  });

  // ── Step corrections ──
  // Step 1: Recording disclosure
  const s1=stepsMap[1];
  if(s1&&!hasRecordingDisclosure){
    if(s1.score==='ed') s1.score='pd';
    s1.notes=(s1.notes||'')+' Recording/monitoring disclosure was not delivered in the opening.';
    if(!s1.trending) s1.trending=[];
    if(!s1.trending.includes('Recording/monitoring disclosure was not delivered'))
      s1.trending.push('Recording/monitoring disclosure was not delivered');
  }

  // Step 2: Agenda / sales intent (NEW — extraction-only)
  if(ext){
    const s2=stepsMap[2];
    if(s2&&ext.opening?.agendaStatement?.salesIntent===false){
      if(s2.score==='ed') s2.score='pd';
      s2.notes=(s2.notes||'')+' Agenda lacked clear sales intent — came across as a service check.';
    }
  }

  // Step 3: Discovery — DND when pillars absent
  const s3=stepsMap[3];
  if(s3&&!hasDiscovery){
    if(s3.score==='ed'||s3.score==='pd') s3.score='dnd';
    s3.notes='No meaningful discovery — agent did not ask about enough pillars before pitching.';
    if(!s3.trending) s3.trending=[];
    const dndTrends=['No meaningful discovery — moved to pitch without asking questions','Did not uncover how the customer uses their services or devices'];
    dndTrends.forEach(t=>{if(!s3.trending.includes(t)) s3.trending.push(t);});
  }

  // Step 4: Pitch capped when no discovery
  const s4=stepsMap[4];
  if(s4&&!hasDiscovery){
    if(s4.score==='ed') s4.score='pd';
    s4.notes=(s4.notes||'')+' Pitch capped at PD — discovery was absent, so linking to needs was not possible.';
    if(!s4.trending) s4.trending=[];
    const pdTrends=['Skipped directly to pitch without completing discovery first','Never tied offer to a specific customer need','Pitch was generic — not personalized to this customer'];
    pdTrends.forEach(t=>{if(!s4.trending.includes(t)) s4.trending.push(t);});
  }

  // Step 5: Assume the sale — DND if never asked (NEW — extraction-only)
  if(ext){
    const s5=stepsMap[5];
    if(s5&&ext.close?.assumptiveAsk?.present===false){
      s5.score='dnd';
      s5.notes=(s5.notes||'')+' Agent never asked for the sale.';
      if(!s5.trending) s5.trending=[];
      if(!s5.trending.includes('Never asked for the sale')) s5.trending.push('Never asked for the sale');
    }
  }

  // Steps 6-8: Objection handling — NA if no objections (NEW — extraction-only)
  if(ext){
    const noObjections=!ext.objections||ext.objections.length===0;
    [6,7,8].forEach(id=>{
      const s=stepsMap[id];
      if(s&&noObjections) s.score='na';
    });
    // Step 6: cap at PD if objection exists but not acknowledged
    if(!noObjections){
      const s6=stepsMap[6];
      const firstObj=ext.objections[0];
      if(s6&&firstObj&&!firstObj.agentAcknowledged&&s6.score==='ed') s6.score='pd';
    }
  }

  // Step 9: Reaffirm — DND if not present (NEW — extraction-only)
  if(ext){
    const s9=stepsMap[9];
    if(s9&&ext.reaffirmAndClose?.reaffirmation?.present===false){
      s9.score='dnd';
      s9.notes=(s9.notes||'')+' Agent did not reaffirm the sale after customer accepted.';
    }
  }

  // Step 10: Positive close — cap at PD if closing compliance missing (NEW — extraction-only)
  if(ext){
    const s10=stepsMap[10];
    if(s10&&ext.reaffirmAndClose?.closingCompliance?.delivered===false){
      if(s10.score==='ed') s10.score='pd';
      s10.notes=(s10.notes||'')+' Closing compliance statement (1-800-XFINITY) not delivered.';
    }
  }

  // Step 11: Summarize the sale — type is "yn" (yes/no/na), NOT "cat"
  // "yes" = comprehensive summary delivered, "no" = incomplete or missing, "na" = no sale made
  if(ext){
    const s11=stepsMap[11];
    const os=ext.reaffirmAndClose?.orderSummary||{};
    if(s11&&s11.score!=='na'){
      const fields=['productsRecapped','pricingStated','promoTerms','rollToRate','installDetails','nextSteps'];
      const covered=fields.filter(f=>os[f]===true).length;
      if(covered<=3){
        s11.score='no';
        s11.notes=(s11.notes||'')+' Order summary was '+(covered===0?'not delivered':'incomplete — only '+covered+' of '+fields.length+' items covered')+'.';
      }
      // "yes" is preserved when covered > 3 (model got it right)
      // Check compliance sub-items
      const compFields=['beforeSubmitting','textConsent','postApproval'];
      const compMissing=compFields.filter(f=>os[f]===false);
      if(compMissing.length){
        s11.notes=(s11.notes||'')+' Missing: '+compMissing.join(', ')+'.';
      }
    }
  }

  // ── Red flag dual-confirmation (NEW — extraction-only) ──
  if(ext){
    const candidates=ext.redFlagCandidates||[];
    const candidateTypes=new Set(candidates.map(c=>c.type));
    (result.redFlags||[]).forEach(rf=>{
      if(rf.flagged&&!candidateTypes.has(rf.id)){
        rf.flagged=false;
        rf.notes='';
        rf.subs=[];
      }
    });
  } else {
    // Fallback: existing aggressive unflagging
    (result.redFlags||[]).forEach(rf=>{
      if(rf.flagged){
        const n=(rf.notes||'').toLowerCase();
        if(/no.*flag|no.*issue|customer.*raised|no.*discovery|no.*question|technical|process/i.test(n)){
          rf.flagged=false;rf.notes='';
        }
      }
    });
  }

  // ── Auto-check coaching indicators for corrected steps ──
  (result.steps||[]).forEach(s=>{
    const sid=Number(s.id)||s.id;
    const step=STEPS.find(st=>st.id===sid);
    if(!step) return;
    if(s.trending&&s.trending.length){
      s.trending.forEach(t=>{
        const idx=step.trending.indexOf(t);
        if(idx>=0){
          if(!trendChecked[sid]) trendChecked[sid]=[];
          if(!trendChecked[sid].includes(idx)) trendChecked[sid].push(idx);
        }
      });
    }
  });
}
```

- [ ] **Step 2: Verify behavioral parity on fallback path**

The fallback path (when `ext` is null) must produce the same corrections as the current code. Compare the regex patterns in the new function against the current function at lines 3808-3948 to ensure nothing was dropped. Key checks:
- Discovery pillar regex patterns match
- Friction regex matches
- Recording disclosure regex matches
- Red flag unflagging regex matches
- Catalyst B3/B4/B5 cap logic matches
- Step 1/3/4 correction logic matches

- [ ] **Step 3: Commit**

```bash
git add scorecard/comcast_call_flow_scorecard_17.html
git commit -m "Rewrite postProcessAIResult() with extraction-aware rules for all 11 steps"
```

---

### Task 9: Consolidate Inline Post-Processing in `applyResult()`

**Files:**
- Modify: `scorecard/comcast_call_flow_scorecard_17.html` — modify `applyResult()` at line 2103

The spec calls for removing duplicate post-processing logic from `applyResult()` since it now lives entirely in `postProcessAIResult()`. Also fix the `updateSummary()` timing bug.

**IMPORTANT:** The fallback path (cloud mode, single-pass fallback) must still produce correct corrections. Since `postProcessAIResult()` runs before `applyResult()` in ALL paths (Task 6 ensures this), the data corrections are already applied by the time `applyResult()` receives the result. `applyResult()` only needs to render to the DOM.

- [ ] **Step 1: Remove data correction blocks from `applyResult()`**

The following blocks in `applyResult()` perform DATA CORRECTIONS that now live in `postProcessAIResult()`. They must be removed:

1. **Lines 2175-2209:** Discovery pillar validation (re-scanning transcript, checking agent questions, JS backup scan). REMOVE. `postProcessAIResult()` now does this. The `discoveryPillars` object on `result` is already corrected.

2. **Lines 2210-2212:** Process friction detection (`frictionSignals`). REMOVE. Now in `postProcessAIResult()`.

3. **Lines 2214-2232:** Sales agenda check for Step 2 (service check detection, step2 score downgrade). REMOVE. Now in `postProcessAIResult()`.

4. **Lines 2234-2258:** Recording disclosure check and Step 1 downgrade. REMOVE. Now in `postProcessAIResult()`.

5. **Lines 2262-2290:** Catalyst B3/B4/B5 corrections (the `.forEach` over `catalystBehaviors` that changes scores). REMOVE. Now in `postProcessAIResult()`.

6. **Lines 2292-2346:** Step 3/4 corrections and auto-checking coaching indicators. REMOVE. Now in `postProcessAIResult()`.

**KEEP** the following blocks — these are DOM RENDERING, not data corrections:

- Lines 2108-2174: Step score rendering (`setScore`, trending checkboxes, notes, evidence quotes, feedback panels)
- Lines 2348-2374+: Catalyst behavior card rendering (`el.className`, `el.textContent`, notes enrichment for display)
- Everything after line 2374: Executive summary rendering, coaching cards, compliance rendering, red flags rendering

After removing the data correction blocks, the `applyResult()` function flows: normalize arrays → render step scores/notes/evidence to DOM → render catalyst cards → render discovery pillars grid → render exec summary → render coaching → render compliance → render red flags.

- [ ] **Step 2: Re-call `setScore()` for steps corrected by post-processing**

Since `postProcessAIResult()` may have changed step scores AFTER the model returned them, `applyResult()` needs to render the corrected scores. The existing loop at lines 2108-2174 already calls `setScore(s.id, s.score, true)` using whatever `s.score` currently is — which will be the post-processed value. So this already works correctly. No change needed.

However, for catalyst behaviors, the DOM rendering at line 2348-2374 also reads `b.score` which will be post-processed. This also works correctly.

- [ ] **Step 3: Ensure `updateSummary()` is called once at the end**

At the very end of `applyResult()`, after ALL DOM rendering is complete, add:

```javascript
  // Final summary recomputation after all scores are rendered to DOM
  updateCatalystRollup();
  updateSummary();
```

Search for any existing calls to `updateSummary()` or `updateCatalystRollup()` inside `applyResult()` and remove them — they should only run once, at the end, after all scores are in the DOM. Note: `setScore()` (line 3256) internally calls `updateSummary()` — this is fine for individual manual score changes, but during `applyResult()` it causes 11 intermediate `updateSummary()` calls. To fix: add a flag `window._batchApply=true` at the top of `applyResult()`, check it in `setScore()` to skip `updateSummary()`, and clear it before the final call.

- [ ] **Step 4: Verify manually**

Run a transcript. Check:
- Summary header ("X/6 ED") matches the actual catalyst behavior scores
- Post-processing corrections (e.g., B4 DND when no discovery) are reflected in the UI
- No console errors from removed code

- [ ] **Step 5: Commit**

```bash
git add scorecard/comcast_call_flow_scorecard_17.html
git commit -m "Consolidate post-processing in postProcessAIResult(), fix summary header timing"
```

---

### Task 10: Update Bulk Processing for Two-Pass

**Files:**
- Modify: `scorecard/comcast_call_flow_scorecard_17.html` — modify `runBulk()` at line 3555, `renderQueue()` at line 3527, `updateQueueItem()` at line 3544

- [ ] **Step 1: Add fallback tracking to `runBulk()`**

At the top of `runBulk()` (after `let done=0,errors=0,afs=0;`), add:

```javascript
  let fallbacks=0;
```

In the per-file loop, after `const aiResult=await callAI(q.transcriptText);`, add:

```javascript
      if(aiResult._fallback) fallbacks++;
```

After the loop completes, before showing the results grid, add:

```javascript
  if(fallbacks>0){
    const pct=Math.round(fallbacks/total*100);
    const msg=fallbacks+' of '+total+' calls used single-pass fallback (scores may be less accurate).';
    document.getElementById('bulk-footer-status').style.color=pct>25?'var(--red-tx)':'var(--amber-tx)';
    document.getElementById('bulk-footer-status').textContent=msg;
    if(pct>25) document.getElementById('bulk-footer-status').textContent+=(' Consider checking Ollama model availability.');
  }
```

- [ ] **Step 2: Update bulk progress UI to show pass status**

In the `runBulk()` timer interval (line ~3615), the subtitle already shows "Analyzing... Xs". This comes from the timer, so we can't easily show "Extracting..." vs "Scoring..." without callbacks from `callAI()`. For now, keep the existing timer behavior — the two-pass detail is visible in the console logs. This can be enhanced later if needed.

- [ ] **Step 3: Commit**

```bash
git add scorecard/comcast_call_flow_scorecard_17.html
git commit -m "Add fallback tracking and voicemail gate to bulk processing"
```

---

### Task 11: End-to-End Verification

This is not a code task — it's a manual testing checklist.

- [ ] **Step 1: Single mode — normal transcript**

Drop a normal sales call transcript. Verify:
- Console shows "Pass 1 (extraction) prompt size: ..." and "Pass 2 (scoring) prompt size: ..."
- No fallback warning
- Scores appear and are NOT all ED
- Executive summary has specific coaching with line references
- Discovery pillars grid reflects what was actually asked
- Summary header matches catalyst card scores

- [ ] **Step 2: Single mode — voicemail transcript**

Drop a short or voicemail transcript. Verify:
- Warning banner appears
- "Analyze anyway" button works

- [ ] **Step 3: Single mode — cloud mode**

Switch to cloud mode. Drop a transcript. Verify:
- Cloud mode still works (single pass, no extraction)
- No regressions

- [ ] **Step 4: Bulk mode — mixed batch**

Queue 3-5 files including one voicemail. Run bulk. Verify:
- Voicemail is skipped in queue
- Other files process with two-pass
- Fallback count shown if any fell back
- Export (CSV/ZIP) works

- [ ] **Step 5: Commit final state**

```bash
git add scorecard/comcast_call_flow_scorecard_17.html
git commit -m "Two-pass scoring redesign: end-to-end verified"
```
