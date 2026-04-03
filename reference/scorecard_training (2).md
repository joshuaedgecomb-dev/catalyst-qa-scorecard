# Xfinity Outbound Telesales — Call Flow Scorecard (Catalyst Quality)
## Training Reference Document

> This document describes the full design, logic, data structures, and behavior of the standalone HTML scorecard tool (`comcast_call_flow_scorecard.html`). Use this to recreate, extend, or modify the tool.

---

## 1. Overview

A single-file standalone HTML application for evaluating Xfinity Outbound Telesales calls against the **Catalyst Quality Behavior framework**. It supports:

- Manual scoring of individual calls
- AI-powered transcript analysis (cloud via Anthropic API, or fully local via Ollama)
- Bulk processing of multiple `.txt` transcript files
- Export to CSV, Google Sheets, and a downloadable ZIP containing individual coaching reports and a batch trend report
- Automatic metadata extraction from Xfinity call string filenames

The file has no build step, no dependencies beyond JSZip (loaded from CDN), and runs by opening it directly in any browser. All preferences are persisted in `localStorage`.

---

## 2. Catalyst Quality Behaviors

The six behaviors that every call is evaluated against. Each has an `id`, `name`, `intent`, and `criteria` object defining what ED, PD, and DND look like in practice.

> **Scoring philosophy:** Every call is graded in a vacuum — evaluate what worked for this specific member on this specific call. There is no single formula. One great discovery question that yields full household context is worth more than five surface-level questions. An agent who adapts to the member and achieves the goal of each step has demonstrated that behavior, even if the path looked different from a script.

---

### b1 — Engage Actively
**Intent:** Show the member you care — make a genuine connection, listen first, and respond to what's actually being said (and not said).

**Effectively Demonstrated**
The agent treats the call as a real conversation, not a transaction. They absorb what the member says and respond to it — the member never has to repeat themselves. The agent breaks from the script naturally (references the member's day, interests, something relatable like a show or hobby) when the moment calls for it. If an objection is raised, the agent identifies whether it's specific or nonspecific — if nonspecific, they ask a follow-up question to uncover the real reason before going into a rebuttal. By the end of the call, the agent has a clear picture of the member's usage and, if no sale was made, a clear understanding of why. The overall tone communicates genuine interest in helping, not closing.

**Partially Demonstrated**
The agent shows moments of real engagement but doesn't sustain it. They may have a warm opening but slip into script-reading through the middle of the call. They may acknowledge an objection but move into rebuttal without probing for the specific reason behind it. There may be minor instances of the member having to restate something. The intent to connect is present but execution is inconsistent.

**Did Not Demonstrate**
The call feels transactional from start to finish. The agent follows the script without deviation, gives no indication they're listening beyond surface-level acknowledgment, and the member has to repeat themselves at least once. Objections are met with a rehearsed rebuttal without any attempt to understand the underlying reason. There is no genuine connection made at any point in the call.

---

### b2 — Own It
**Intent:** Demonstrate expertise, set clear expectations, and commit to the right solution. Be transparent about what's happening and what comes next.

**Effectively Demonstrated**
The agent demonstrates clear command of tools, process, and policy throughout the call — answers come without hesitation, and they don't need to stumble through order entry or look things up mid-pitch in a way that stalls the call. The member is kept informed at every stage: transitions are narrated, holds are acknowledged with a reason and a timeframe, and any hiccups in the process are communicated rather than silently worked through. By the end of the call, the member has a complete and accurate understanding of the package they agreed to — pricing, promotions, what's included, and what isn't. Next steps are spelled out clearly: what happens after the call, when to expect installation or activation, and what the member should watch for. The member is never left guessing about where they stand.

**Partially Demonstrated**
The agent has working knowledge but gaps show. They may communicate well in some phases of the call but go quiet during order entry, or they explain the package adequately but leave next steps vague. Holds may go unacknowledged or unexplained. The member likely has most of the information they need but would benefit from a follow-up to fill in what wasn't covered.

**Did Not Demonstrate**
The agent struggles visibly with tools, process, or product knowledge in a way that undermines the member's confidence. Holds happen without explanation. The member is left unclear on what they're getting, what it costs, or what happens next. The agent relies on the member to ask clarifying questions rather than proactively keeping them informed.

---

### b3 — Make It Effortless
**Intent:** Keep the interaction simple and efficient. Deliver information in digestible pieces, avoid unnecessary steps, and work with urgency.

**Effectively Demonstrated**
The agent moves with purpose — there's no dead air, no unnecessary backtracking, and the call has a clear forward momentum. Information is delivered in digestible pieces, not dumped all at once. The agent builds a logic bridge between product features and the member's specific home or lifestyle so the member can connect the dots without having to ask. The member shouldn't need to ask basic clarifying questions — if they do, it signals the agent didn't deliver the information clearly the first time. Active listening is evident throughout: the agent picks up on what the member says and adjusts their delivery accordingly rather than plowing ahead on a preset track.

**Partially Demonstrated**
The agent moves at a reasonable pace but has moments where information is front-loaded or poorly sequenced, leaving the member with questions that should have been pre-empted. The logic bridge between features and lifestyle is attempted but incomplete — the member may understand what the product is but not clearly why it fits them. Active listening is present in spots but inconsistent.

**Did Not Demonstrate**
The call feels slow, cluttered, or confusing. Information is delivered in a way that requires the member to do too much work — asking basic questions, asking for clarification, or getting lost in feature lists with no connection to their life. The agent shows little adjustment based on what the member says, and there's no clear sense of urgency driving the interaction forward.

---

### b4 — Discover Needs
**Intent:** Ask proactive, relevant questions to uncover what the member actually needs. Engage them in the process — questions should reveal something new.

**Effectively Demonstrated**
By the time the agent exits discovery, they have a clear picture across all four pillars: **Users** (who's in the household), **Usage** (how they use their services day to day), **Cost** (what they're currently paying or what matters to them financially), and **Devices** (what they're connecting or protecting). Questions are predominantly open-ended, inviting the member to tell their story rather than confirm a yes/no. The number of questions is less important than the quality of what they uncover — one strong open-ended question that yields a full picture of the household is more effective than five closed questions that return nothing useful. Discovery feels like a natural conversation, not an intake form.

> **Open vs. closed questions:** Open-ended = any answer ("Can you tell me a little about how you're using your home WiFi?"). Closed = yes/no or a number ("Are you a gamer?"). Open-ended questions are strongly preferred.

**Partially Demonstrated**
The agent attempts discovery but doesn't cover all four pillars (Users, Usage, Cost, Devices), or leans too heavily on closed-ended questions that return minimal information. They may uncover usage but miss devices, or understand the household but not the cost sensitivity. Enough is learned to build a basic pitch, but the presentation that follows lacks the specificity that a fuller discovery would have enabled.

**Did Not Demonstrate**
The agent skips meaningful discovery entirely or asks closed questions that yield one-word answers and nothing actionable. One or more pillars — Users, Usage, Cost, Devices — are completely absent by the time the pitch begins. The member was never genuinely engaged in the process, and the pitch that follows is generic as a result.

---

### b5 — Be an Ambassador
**Intent:** Speak confidently and proudly about Xfinity products. Tie the member's specific needs to features and value — not just a feature list.

**Effectively Demonstrated**
The agent pitches with confidence and genuine enthusiasm — not a recitation of features, but a tailored recommendation grounded in what was learned during discovery. They follow the spirit of the Simplified Selling Guide: recommend the best option for this member, using clear language that connects product to lifestyle. The logic bridge is explicit — *"X product would benefit you because..."* — and draws directly from what the member shared about their users, usage, devices, or cost sensitivity. The agent speaks positively about how Xfinity products will integrate into the member's home, not just what they include. The right product is pitched; an agent who discovers a household of heavy streamers and pitches the lowest internet tier without explanation has not ambassadored, regardless of how enthusiastically they delivered it.

**Partially Demonstrated**
The agent is positive about the product and attempts to connect it to the member, but the link is loose — the recommendation could apply to almost any household. They may lead with features rather than benefits, or pitch the right product without clearly explaining why it fits. Enthusiasm is present but the "because" is missing or generic.

**Did Not Demonstrate**
The agent delivers a flat, generic pitch with no meaningful connection to what was discovered. Features are listed without context, or the wrong product is recommended entirely. There is no attempt to frame Xfinity products in terms of the member's home or lifestyle. The member has no clear reason to say yes based on what was presented.

---

### b6 — Show Appreciation
**Intent:** Express tailored gratitude so the member feels genuinely valued. Acknowledgment should feel contextual, not scripted.

**Effectively Demonstrated**
Appreciation shows up naturally at multiple points in the call, not just at the end. The agent thanks the member for answering discovery questions, acknowledges and apologizes for any hold time, and treats the member's time as something worth respecting throughout the interaction. On a sale, the close includes a genuine, contextual acknowledgment of the member's decision — not a scripted send-off. The agent mentions Xfinity Membership as a meaningful way to reinforce that Xfinity gives back to its members, delivered in a way that feels like a benefit being shared rather than a box being checked. Appreciation feels earned and specific to this member and this call.

**Partially Demonstrated**
The agent expresses gratitude but it lands as routine rather than genuine. They may thank the member at the close but miss natural opportunities earlier in the call — after discovery, after a long hold, or when the member shares something personal. Xfinity Membership may be absent entirely or mentioned too briefly to register as meaningful. The intent is there but the delivery lacks context.

**Did Not Demonstrate**
Appreciation is either absent or purely performative — a reflexive "thank you for your time" with no connection to the actual call. Hold time goes unacknowledged. Discovery is treated as an interrogation with no gratitude for the member's engagement. Xfinity Membership is not mentioned. The member ends the call feeling processed, not valued.

---

## 3. Rating Scale

### For behavioral steps (type: `cat`)
| Rating | Code | Description |
|--------|------|-------------|
| Effectively Demonstrated | `ed` | Clear, consistent evidence. Intent fully met. |
| Partially Demonstrated | `pd` | Attempt present but incomplete or inconsistent |
| Did Not Demonstrate | `dnd` | No evidence of the behavior |
| N/A | `na` | Not applicable to this call |

### For compliance/checklist steps (type: `yn`)
| Rating | Code | Description |
|--------|------|-------------|
| Yes | `yes` | Agent clearly completed this step |
| No | `no` | Step was applicable but not completed |
| N/A | `na` | Not applicable |

---

## 4. Compass Navigator Reference

Compass Navigator is the structured call guide agents use on every call. It organizes the interaction into five phases, each with scripted language, discovery prompts, and product tie-back fields. Coaching recommendations generated by the AI should reference these phases by name and use Compass terminology.

### Call Paths

| Campaign | Compass Path |
|----------|-------------|
| Nonsub BAU | Member Does Not Exist in Einstein |
| XM Likely | Member Exists in Einstein |
| Xfinity Mobile Add A Line | Member Exists in Einstein |
| Add XMC | Member Exists in Einstein |

---

### Phase 1 — Connect
The opening phase. Agent confirms who they're speaking with, states the reason for the call, and verifies the account or service address. Top agents use hold time during system lookup to build rapport — Compass explicitly prompts one non-business-related question here. For existing members (Einstein path), agent references Xfinity Rewards tier and perks as part of the opening.

**Compass language:** "I was hoping to speak with... are they available?" / "Just so I can speak more specifically about your account..." / "It looks like you've been a member since [year], qualifying you for [tier] level Xfinity Rewards..."

---

### Phase 2 — Explore
Discovery phase. Agent asks open-ended questions with relevant follow-ups to build a complete picture of the household. Agents record **tie-backs** by product category in real time — these are what drive the Consult.

**The four discovery pillars:**
- **Users** — who's in the household, any kids, own or rent
- **Usage** — typical day on internet, streaming habits, gaming
- **Devices** — phones, smartwatches, tablets connected to WiFi
- **Cost** — current mobile provider and what they're paying

**Compass tie-back categories:** Internet · Video · Mobile · Security · Voice

**Sample Compass language:** "Paint me a picture of what a typical day of using our services might look like?" / "What devices will you be connecting to the WiFi?" / "Who is your current mobile provider, and what does [X] lines run you nowadays?"

---

### Phase 3 — Consult
Pitch phase. Agent opens with "Based on what you told me, I think I have the perfect plan..." and presents each product recommendation using the tie-backs recorded during Explore. Every product pitch must be anchored to something the member actually said.

**Compass pitch structure per product:**
- **Internet:** "With all that it sounds like you're doing, I'd recommend our ___Mbps. That way you can [use case 1] and [use case 2] at the same time — and lock your price for 5 years."
- **Video:** "I know you're a big fan of [shows/streaming] so I set you up with our [TV plan/NOW TV/StreamSaver] to make sure you can watch all you want."
- **Mobile:** "You mentioned you were paying [provider] $__ for your __ lines. One of the best things about Xfinity is [free line for 12 months / savings amount]."
- **Xfinity Home:** "I also heard you say you [owned your home / had kids / have a house full of gadgets], so I included our Xfinity Home system so you can [protect or automate] what's important."
- **Voice:** "And to back up your cell phone I also included Xfinity Voice."

**Compliance requirement:** When offering Internet or Mobile, agent MUST offer Broadband Facts: "Before I go into plan details, you can review pricing and features at Xfinity.com/labels."

---

### Phase 4 — Overcome
Objection handling phase. Compass uses a 4-step framework — this is the authoritative structure for all objection handling coaching:

| Step | Label | Compass Language |
|------|-------|-----------------|
| 1 | **Understand the Objection** | If unclear: "What about that plan didn't you like?" — uncover the specific reason before responding |
| 2 | **Empathize and Overcome** | "I completely understand that, however, with our services..." |
| 3 | **Restate Key Tie-Backs** | "I heard you say [X], so I wanted to make sure..." — re-anchor to Explore discoveries |
| 4 | **Add Additional Value** | "One other thing about that product that you might like is..." |

> **Note:** Objections fall into two types. A **nonspecific objection** ("I'm not interested") requires Step 1 — the agent must ask why before responding. A **specific objection** ("I can't afford it") can go straight to Step 2. Skipping Step 1 on a nonspecific objection is a scoring gap.

---

### Phase 5 — Review
Closing and wrap-up phase. Four required components:

1. **Summarize the Order** — all services on the order, promotional pricing & duration, roll-to rate
2. **Process Digital Consent** — via text message, email, or verbal
3. **Installation & Activation** — date/time of install and on-time guarantee, shipping/activation details, canceling current provider
4. **Xfinity Apps & Rewards** — share Xfinity App link; mention Xfinity Membership benefits

---

## 5. Compliance Requirements

Compliance items are mandatory disclosures required by Xfinity policy and federal regulation. They are not optional coaching points — a missing compliance item is a scoring gap regardless of how well the rest of the call went. Each item maps to one or more call flow steps and must be checked during AI evaluation.

---

### C1 — Recording Disclosure
**Required on:** Every call  
**Step:** 2 (Positive greeting)  
**When:** After the greeting or after the reason for the call — but before any discovery questions are asked

**Standard verbatim:**
> "Before I continue, I need to inform you that the call is being recorded and monitored for the highest quality standards. For more information about Comcast privacy practices please visit Xfinity.com/privacy."

**State-specific rules:**
- **IL and KY:** Must include a permission-to-continue phrase after the recording disclosure
- **CT:** Mandatory special script only — agent must ask: *"Do you have a few moments to continue this sales call, or would you prefer I disconnect or remove you from our list?"*

**Scoring note:** The disclosure may come right after the greeting (Option 1) or after stating the reason for the call (Option 2). Either placement is acceptable as long as it precedes any discovery questions.

---

### C2 — Authentication
**Required on:** Existing member calls (Einstein path) — **only when account-sensitive information is discussed**  
**Step:** 3 (Set the agenda)  
**When:** Before any account-specific information is shared — but only if such information is shared at all

**The trigger — authentication is only required when the agent discusses, confirms, or discloses any of the following:**
- Member's service address
- Phone number on the account
- Current package or services
- Current pricing or billing details
- Account history or tenure
- Any information that exists on the member's account

If none of the above is discussed during the call, authentication is **not required** and should be scored **N/A**.

**Authentication is satisfied by either method:**

| Method | When used | Sufficient alone? |
|--------|-----------|-------------------|
| 6-digit verification code | Any campaign | ✅ Yes — full authentication |
| Full service address + phone number on account | When no code collected | ✅ Yes — full authentication |

**Key rule:** If a 6-digit code was collected and confirmed, the account is authenticated — regardless of whether address or phone were also gathered. Do not flag authentication as missing if the code was used.

**ACSR note:** Changes to home services via ACSR require address + phone specifically, but an ACSR swivel is typically not visible in a transcript. Do not penalize for ACSR authentication if a 6-digit code was collected — the evaluator cannot determine from the transcript alone whether ACSR was accessed.

---

### C3 — Broadband Labels
**Required on:** Any call where Internet or Mobile is offered  
**Step:** 5 (Be an ambassador — link the need)  
**When:** Between Explore and Consult — typically woven into the pitch delivery

**Required language:**
> "You can also see this information or information about our services at Xfinity.com/labels."

**Compass Navigator language:** *"Also, before I go into plan details, I wanted to let you know that you can now review a breakdown of pricing and features for Internet and mobile plans online, making it easy for you to compare them. For more information please visit: Xfinity.com/labels."*

---

### C4 — Before Submitting
**Required on:** Every sale  
**Step:** 12 (Summarize the sale)  
**When:** Before sending any order summary (text, email, or verbal)

**Verbatim:**
> "Before submitting your order, I want to spend a few minutes confirming with you that I've accurately captured the services you want. I'll ask you to review the order, and then if it's correct, please approve it. What phone number or email address would you like to use to complete this process?"

---

### C5 — Text Consent
**Required on:** Any sale where order link is sent via text  
**Step:** 12 (Summarize the sale)  
**When:** Immediately before sending the text

**Verbatim:**
> "Thanks. I'll now send you a text message at the number you provided with a link to confirm your order. Message and data rates may apply. Okay?"

---

### C6 — Verbal Order Summary
**Required on:** Any sale where the digital option fails  
**Step:** 12 (Summarize the sale)  
**When:** As replacement for digital consent process

Agent must read the **entire** order summary top to bottom including legal disclaimer, taxes, fees, and one-time charges. Then ask verbatim:

> "DO YOU AGREE TO ORDER AND BE BILLED FOR THE EQUIPMENT AND SERVICES THAT I JUST DESCRIBED?"

---

### C7 — Post-Approval Statement
**Required on:** Every sale, after member approves  
**Step:** 12 (Summarize the sale)  
**When:** Immediately after order approval

**Verbatim:**
> "Thank you. After we finalize your order, you'll receive a copy of your order summary within 6 hours at the email address listed on your account. You can also find it at xfinity.com/MyAccount."

---

### C8 — Closing Compliance
**Required on:** Every call — sale or no sale  
**Step:** 11 (Positive close)  
**When:** Just before ending the call

**Verbatim:**
> "Thank you for your time today. If you have any questions about this call or any Xfinity products or services in your area, please feel free to call 1-800-XFINITY (934-6489) or visit Xfinity.com. Have a great rest of your day."

---

### Compliance summary by step

| Step | Compliance Item | Every Call | Sales Only |
|------|----------------|------------|------------|
| 2 | Recording disclosure | ✓ | |
| 3 | Authentication (existing members) | ✓ | |
| 5 | Broadband Labels (Internet/Mobile offers) | | ✓ |
| 12 | Before Submitting verbatim | | ✓ |
| 12 | Text Consent (if sent via text) | | ✓ |
| 12 | Verbal order summary + verbatim agreement (if digital fails) | | ✓ |
| 12 | Post-Approval statement | | ✓ |
| 11 | Closing compliance | ✓ | |

---

## 6. Compliance Checklist (11 Items)

Separate from the 8 call-level compliance requirements above, there is an 11-item compliance checklist scored independently on every call. Each item uses Yes / No / N/A.

**Rating scale:**
- **Yes** — Agent clearly addressed this item during the call
- **No** — Item was applicable but the agent did not address it
- **N/A** — Item genuinely does not apply to this call

**February 2026 baseline rates** (for context when evaluating trends):

| ID | Item | Feb 2026 Yes% | Notes |
|----|------|--------------|-------|
| c1 | Products/Services Positioned | 93.3% | Strongest item |
| c2 | Products/Services Explained | 26.7% | Critical gap — positioning without explanation |
| c3 | Broadband Labels | 16.1% | Federal requirement, second-lowest rate |
| c4 | Overall Bill Changes | 48.3% | Missed on majority of applicable calls |
| c5 | Monthly Recurring Charges | 38.3% | Drives first-bill surprise complaints |
| c6 | Non-Recurring Charges | 20.4% | Hidden one-time charges = escalation trigger |
| c7 | Activation Fees | 15.2% | Lowest rate — $25/line mobile, must disclose or confirm waived |
| c8 | Monthly Device Payments | 25.0% | N/A if member brings own device |
| c9 | Applicable Taxes | 20.0% | Frequently omitted when quoting headline price |
| c10 | Contract Terms | 55.0% | Second-strongest — but still missed on ~45% of calls |
| c11 | Activation/Set-Up Process | 41.7% | Missed = follow-up inbound call |

**N/A conditions per item:**
- **c1** — Call ended before any product discussion
- **c2** — No product was pitched
- **c3** — No Internet or Mobile product was offered
- **c4** — New member with no prior service / no price change
- **c5, c9** — No sale was made
- **c6** — No one-time charges apply to this order
- **c7** — No mobile line was discussed
- **c8** — No device sold / member brought their own eligible device
- **c10** — No sale was made
- **c11** — No device or new home service was sold

---

## 6. The 12 Call Flow Steps

Each step has: `id`, `section`, `name`, `type` (`cat` or `yn`), `catalyst` (array of behavior IDs it maps to), `desc` (evaluation description), and `trending` (array of specific coaching indicator strings).

### Step 1 — Pre-call prep
- **Section:** Pre-call prep
- **Type:** `yn`
- **Catalyst:** Own It (b2), Make It Effortless (b3)
- **Scoring rule:** Simple yes/no. Read only the first 5–6 lines of agent dialogue. If the agent uses the member's name, score `yes`. If they use only "sir", "ma'am", or no name at all, score `no`. No other factors count for this step.
- **Trending:** No name in opening lines, generic greeting with no personalization, referred to member as sir/ma'am only, cold open with no evidence of account review

### Step 2 — Positive greeting
- **Section:** Opening
- **Type:** `cat`
- **Catalyst:** Engage Actively (b1)
- **Desc:** The opening sets the tone for the entire interaction. Outbound telesales is an interruption by nature — the agent has seconds to earn the member's willingness to stay on the call. The Compass Navigator opening is scripted: greeting, consent language, asking who they're speaking with, and transitioning into the call purpose. The baseline for this step is delivering that script with genuine warmth and a natural pace. What pushes a score to ED is whether the agent finds the small window between getting the member's name and launching into the reason for the call — asking how their day is going, or responding naturally to something the member says — before moving forward. It doesn't have to be long. It just has to be real.
- **Trending:** Sounded scripted — robotic or memorized delivery, poor or flat tone; did not convey warmth, rapid pace; member had to work to keep up, delayed engagement — took too long to connect with the member, moved directly from "Nice to meet you" into the pitch — no pause for personal connection

### Step 3 — Set the agenda
- **Section:** Opening
- **Type:** `cat`
- **Catalyst:** Own It (b2), Make It Effortless (b3)
- **Desc:** Member should not be surprised by the direction of the call. Purpose should be clear early.
- **Trending:** Purpose never established, member caught off guard, jumped straight to pitch, no transition into discovery

### Step 4 — Discover needs
- **Section:** Discovery
- **Type:** `cat`
- **Catalyst:** Discover Needs (b4)
- **Desc:** Proactive open-ended questions that reveal something genuinely new. Should feel like a real conversation, not a checklist.
- **Trending:** No meaningful discovery, did not uncover usage/devices, missed discovery on applicable products, surface-level questions, sounded like a survey, illogical questions

### Step 5 — Be an ambassador — link the need
- **Section:** Pitch
- **Type:** `cat`
- **Catalyst:** Be an Ambassador (b5)
- **Desc:** The pitch should draw a clear line between what was discovered and what is being offered. Member should understand why it fits their household.
- **Trending:** Skipped to pitch without discovery, never tied offer to need, generic pitch, lacked enthusiasm, wrong product, incomplete/incorrect description

### Step 6 — Assume the sale
- **Section:** Close
- **Type:** `cat`
- **Catalyst:** Own It (b2), Be an Ambassador (b5)
- **Desc:** Move confidently to close while engagement is high. Assume the sale or ask directly.
- **Trending:** Never asked for the sale, asked without confidence, waited too long, invited member to say no

### Step 7 — Engage actively — understand the objection
- **Section:** Objection handling
- **Type:** `cat`
- **Catalyst:** Engage Actively (b1), Discover Needs (b4)
- **Desc:** Acknowledge hesitation genuinely, then ask questions to uncover the true reason. Do not bulldoze.
- **Trending:** No acknowledgment of hesitation, insincere/rushed empathy, no questions asked, moved to rebuttal without understanding, too pushy

### Step 8 — Own it — overcome the objection
- **Section:** Objection handling
- **Type:** `cat`
- **Catalyst:** Own It (b2), Be an Ambassador (b5)
- **Desc:** Address each concern directly, restate value in terms of what the member cares about.
- **Objection framework:** Understand the objection → Acknowledge in rebuttal → Reinforce value → Assume the sale
- **Trending:** No rebuttal attempt, performative empathy, failed to address the actual objection, did not re-anchor to member needs, aggressive, gave up too quickly, negative selling

### Step 9 — Assume the sale again
- **Section:** Re-close
- **Type:** `cat`
- **Catalyst:** Own It (b2), Be an Ambassador (b5)
- **Desc:** After re-engaging following objection handling, close again confidently.
- **Trending:** Did not re-ask, second ask lacked conviction, moved on without re-closing, member had to bring it up

### Step 10 — Reaffirm the sale
- **Section:** Reaffirm & close
- **Type:** `cat`
- **Catalyst:** Show Appreciation (b6), Engage Actively (b1)
- **Desc:** When member accepts, confirm they made the right choice and build genuine enthusiasm.
- **Trending:** Did not reaffirm, moved past acceptance, sounded scripted, missed opportunity to build confidence

### Step 11 — Positive close
- **Section:** Reaffirm & close
- **Type:** `cat`
- **Catalyst:** Show Appreciation (b6)
- **Desc:** Last impression — confirm no additional questions, thank member, use a genuine closing courtesy.
- **Trending:** Did not acknowledge decision, did not check for questions, rushed member off, cold tone, no closing courtesy

### Step 12 — Summarize the sale
- **Section:** Reaffirm & close
- **Type:** `yn`
- **Catalyst:** Own It (b2), Make It Effortless (b3)
- **Desc:** Member must have a complete picture of products, pricing, promotions, roll-to rates, install details, and next steps before call ends.
- **Trending:** Did not summarize products, incomplete billing recap, promo duration not communicated, roll-to rate not disclosed, install details missing, next steps not explained, contract/ETF not addressed

---

## 7. Red Flags / Auto-Fails

Any flagged red flag scores the entire call as 0 regardless of other results. Six categories:

| ID | Name | Key behaviors |
|----|------|---------------|
| rf1 | Severe member service issue | Confrontational, swearing, patronizing, condescending, inappropriate comments, declined supervisor request |
| rf2 | Inaccurate information | Factually wrong or intentionally misleading information about package details, pricing, process, or policy that is not corrected before the call ends. See autopay pricing rule below. |
| rf3 | Hang-up on member | Agent hung up, or used extended hold to force member to hang up (call avoidance) |
| rf4 | Extreme language concern | Could not be understood, heavy accent causing confusion, incorrect sentence structure changed meaning, excessive slang |
| rf5 | Speaks negatively about Xfinity / company | Blamed another department, spoke poorly about policy/process/product, improperly branded without self-correction |
| rf6 | Open line policy (OLP) violation | Agent spoke to someone other than the member while the line was open |

Each red flag also has sub-reasons that can be individually checked.

### rf2 — Autopay pricing rule
Xfinity packages include a **$10/month autopay discount**. An agent quoting the autopay price (e.g. $60/mo) without immediately stating the autopay requirement is using incomplete language — but this is **not an auto-fail** on its own. It only becomes rf2 if the autopay requirement is **never disclosed anywhere on the call**, leaving the member with a false understanding of what they will actually be charged.

| Scenario | Flag? |
|----------|-------|
| Agent quotes autopay price → later clarifies full price without autopay | ✅ Correct behavior — do NOT flag |
| Agent quotes autopay price → autopay requirement mentioned anywhere on call | ✅ Acceptable — do NOT flag |
| Agent quotes autopay price → autopay requirement never mentioned at all | ⛔ Flag rf2 — sub: "Autopay discount price stated and autopay requirement never disclosed" |
| Agent states a price that is wrong regardless of autopay | ⛔ Flag rf2 — sub: "Quoted incorrect package price" |

---

## 8. Campaign Types

Four active campaigns. The tool detects campaign from the transcript automatically (AI first, then local keyword scoring, then filename hints).

### Xfinity Mobile Add A Line
Calling existing Xfinity Mobile members to add a new phone line or wearable (Apple Watch, Samsung Watch, etc.).
- **Detection signals:** "add a line", "additional line", "wearable", "Apple Watch", "smartwatch", member already has XM

### XM Likely
Calling existing Xfinity Internet members with no Xfinity Mobile, pitching a mobile line.
- **Detection signals:** switching from Verizon/AT&T/T-Mobile/Sprint/Metro, "bring your own device", internet member being pitched mobile

### Add XMC
Calling existing Xfinity Mobile members to sell Xfinity Mobile Care (device protection/insurance).
- **Detection signals:** "Xfinity Mobile Care", "XMC", "device protection", "cracked screen", "loss and theft", "protect your device"

### Nonsub BAU
Calling non-subscribers (no current Xfinity service) selling services in this priority order: Internet → Mobile → Xfinity Home / Xfinity Streamsaver (tied) → Xfinity Home Phone.
- **Detection signals:** "just moved", "new to the area", doesn't have Xfinity, competitor internet mentioned, agent pitches internet first

---

## 9. Filename Parsing

Xfinity call string format: `{TSR}-{First_Last}-{YYYYMMDDHHMMSS}{PhoneNumber}{CallerID}.txt`

Example: `10857-Makiano_Henry-2026031611372421330965358888930731.txt`

Parses to:
- **TSR:** `10857`
- **Agent name:** `Makiano Henry`
- **Call date:** `2026-03-16`
- **Call time:** `11:37:24`
- **Phone number:** `2133096535` (digits 15–24 of the trailing block)
- **Caller ID:** `8888930731` (digits 25–34 of the trailing block)

Simpler format `10174-Victor_Urbina.txt` also supported — extracts TSR and name only. If no pattern matches, the filename itself is used as a fallback. The `parseFilename(filename)` function returns `{tsr, agentName, callDate, callTime, phoneNumber, callerId, callId, filename}`.

---

## 10. AI Analysis

### Modes
- **Cloud (Anthropic):** Calls `https://api.anthropic.com/v1/messages`. Uses `claude-sonnet-4-20250514` by default. Requires an API key stored in `localStorage`.
- **Local (Ollama):** Calls `http://localhost:11434/v1/chat/completions` (OpenAI-compatible endpoint). Requires Ollama installed and a model pulled (e.g. `ollama pull llama3.1`). No API key needed. Data never leaves the machine. Default mode.

### What the AI returns (JSON)
```json
{
  "steps": [
    {
      "id": 1,
      "score": "yes|no|ed|pd|dnd|na",
      "trending": ["exact coaching indicator strings that apply"],
      "notes": "1-2 sentence coaching note with specific transcript evidence",
      "transcriptEvidence": "Verbatim or near-verbatim lines from the transcript that drove this score"
    }
  ],
  "redFlags": [
    {
      "id": "rf1",
      "flagged": true,
      "subs": ["exact sub-reason strings that apply"],
      "notes": "Evidence note if flagged"
    }
  ],
  "suggestedOutcome": "Successful sale | No sale – price | ...",
  "suggestedCampaign": "Xfinity Mobile Add A Line | XM Likely | Add XMC | Nonsub BAU | (empty string)",
  "executiveSummary": {
    "topPriority": "5-8 word headline for top coaching focus",
    "summary": "2-3 sentences written to a manager who will share with the agent",
    "strengths": ["up to 2 short phrases"],
    "opportunities": ["up to 2 short phrases"],
    "critical": ["1 phrase if auto-fail, otherwise empty array"],
    "coachingRecommendations": [
      {
        "focus": "Focus area label",
        "what": "Specific behavioral change needed",
        "transcriptEvidence": "Exact quote or paraphrase from the call",
        "example": "Verbatim language the agent could use on their next call",
        "priority": "high|medium"
      }
    ]
  }
}
```

### Special scoring rules baked into the prompt
- **Step 1 (Pre-call prep):** Read only the first 5–6 lines of agent dialogue. If the member is addressed by name, score `yes`. Otherwise `no`. No other factors.
- **Objection handling steps (7 & 8):** If either scores `pd` or `dnd`, a coaching recommendation must follow the 4-step framework: Understand → Acknowledge → Reinforce → Assume. The `example` field walks through all four steps using context from the actual call.
- **`transcriptEvidence` in coaching recommendations:** Required for every recommendation. The specific moment from the call that drove the recommendation.

### Retry logic
- 5-minute timeout per request using `AbortController`
- On JSON parse failure: waits 3 seconds, retries once
- On error: marks file as error in bulk queue, continues or stops based on user setting

---

## 11. Bulk Processing

The bulk modal allows uploading multiple `.txt` files at once.

### Queue flow
1. Files drop onto the drop zone or are selected via file picker
2. All file contents are pre-read into `q.transcriptText` before the loop starts (avoids File API read issues mid-loop)
3. Files are processed sequentially with a configurable delay between calls (default: 5 seconds)
4. A live elapsed timer ticks per file so the user can distinguish "still working" from "frozen"
5. `try/finally` ensures the timer is always cleared even if the AI call throws
6. On completion: CSV export, ZIP download, and Send to Sheets buttons appear

### Queue item states
`pending` → `processing` → `done` | `error` | `skipped`

### Bulk results payload (`buildBulkPayload`)
Same structure as the single-call payload, plus `executiveSummary` preserved from the AI result. Campaign is resolved in this order: AI `suggestedCampaign` → local `detectCampaignFromTranscript()` → `guessCampaign(filename)` → manual override from the dropdown.

---

## 12. Export Formats

### CSV (`exportBulkCSV`)
One row per evaluated call. Columns include: `Filename`, `Timestamp`, `TSR`, `Agent`, `Evaluator`, `CallID`, `CallDate`, `CallTime`, `PhoneNumber`, `CallerID`, `Campaign`, `Outcome`, `AutoFail`, `CatalystScore`, then one column per step score, one per step coaching indicators, one per step notes, one per red flag, one per red flag detail.

### Google Sheets (`sendToSheets` / `bulkToSheets`)
Requires a one-time Google Apps Script setup. The Apps Script (`doPost`) reads the JSON body, writes headers on the first row if empty, then appends one row per submission. New columns are added automatically if new fields appear over time.

### ZIP (`downloadBulkZip`)
Uses JSZip (loaded from cdnjs). Structure:
```
Bulk_Coaching_YYYY-MM-DD/
├── Individual_Coaching/
│   ├── AgentName.html    (one per agent)
│   └── ...
└── Trend_Report_YYYY-MM-DD.html
```

#### Individual coaching report
Standalone HTML file. Contains: agent header with TSR/date/phone/caller ID, Catalyst behavior summary grid, executive summary with top priority headline and sentiment pills, coaching recommendation cards (each with focus label, what to do differently, transcript evidence block, "Try saying" language, objection framework tag where applicable), red flag section if triggered, step-by-step score table with coaching notes.

#### Trend report
Standalone HTML file. Each data section (behavior performance, coaching focus areas, coaching indicators, red flags, outcomes, agent leaderboard) is followed by a structured insight card containing a headline, bullet list with specific agent names and call references, and a single action line. Agent names are deduplicated across bullets — if one agent appears in 4 calls, they appear once per bullet, not four times.

---

## 13. Transcript Evidence Panel

Each step row has a `▶` arrow button on the far right, hidden by default. It appears only after a transcript has been analyzed and the AI returned `transcriptEvidence` for that step. Clicking it opens a collapsible panel (purple left border) below the step name showing the verbatim or near-verbatim lines from the transcript that drove the score. The arrow rotates 90° when open. Clearing the scorecard resets all panels and hides all arrows.

---

## 14. State Management

All state is in-memory JavaScript objects. Nothing is persisted to storage except user preferences.

| Object | Contents |
|--------|----------|
| `scores` | `{stepId: 'ed'|'pd'|'dnd'|'na'|'yes'|'no'}` |
| `trendChecked` | `{stepId: [indicatorIndex, ...]}` |
| `notes` | `{stepId: 'string'}` |
| `rfFlags` | `{rfId: boolean}` |
| `rfSubs` | `{rfId: [subIndex, ...]}` |
| `stepEvidence` | `{stepId: 'transcript excerpt string'}` |
| `bulkQueue` | Array of `{file, name, transcriptText, status, result, error}` |
| `bulkResults` | Array of completed payload objects |

`localStorage` keys:
- `catalyst_mode` — `'local'` or `'cloud'`
- `catalyst_api_key` — Anthropic API key
- `catalyst_cloud_model` — selected cloud model string
- `catalyst_ollama_url` — Ollama base URL
- `catalyst_ollama_model` — Ollama model name
- `gc_scorecard_url` — Google Sheets Web App URL

---

## 15. Key Design Decisions

**Why a single HTML file?** Zero dependencies, zero build step, zero deployment. Drop it on any machine, open in a browser, it works. The only external dependency (JSZip) is loaded from CDN and is only needed for the ZIP download feature.

**Why Ollama as default?** Transcript data contains member PII. Local processing means nothing leaves the machine. Cloud mode is available for teams that prefer higher-quality output and have approved API usage.

**Why pre-read all files before the bulk loop?** File API reads inside an async loop can stall on some browsers when interleaved with long-running fetch calls. Pre-reading ensures the AI loop only deals with strings, not File objects.

**Why `try/finally` for the bulk timer?** If anything throws between `setInterval` and `clearInterval`, the timer keeps ticking and the loop state corrupts. `finally` ensures the timer clears regardless.

**Why deduplicate agents in trend report bullets?** Results are stored one per call. An agent with 4 calls would appear 4 times in every bullet without deduplication. The `uniqueAgents()` helper deduplicates by TSR (or agent name as fallback).

**Pre-call prep as yes/no:** Agents consistently fail this step for "wrong information" — but in transcript review, the only reliable signal is name usage in the opening lines. Anything more complex introduces false negatives. Simple bar = defensible standard.

**Campaign detection priority:** AI result → local regex scoring → filename keyword → manual dropdown. The regex scorer uses weighted signals per campaign and requires a minimum score of 4 to return a result, avoiding false positives on ambiguous calls.

---

## 16. Extending the Tool

### Adding a new campaign
1. Add the option to both `<select id="f-campaign">` and `<select id="bulk-campaign">`
2. Add to the `CAMPAIGN_OPTIONS` array
3. Add detection signals in `detectCampaignFromTranscript()` with appropriate weights
4. Add a filename hint in `guessCampaign()` if applicable
5. Update the `suggestedCampaign` description in `buildPrompt()`

### Adding a new step
1. Add an object to the `STEPS` array with `id`, `section`, `name`, `type`, `catalyst`, `desc`, `trending`
2. If it maps to a Catalyst behavior already in `CATALYST`, add the behavior ID to the `catalyst` array
3. The scoring UI, rollup, CSV export, and trend report all generate dynamically — no other changes needed

### Adding a new red flag
1. Add to the `RED_FLAGS` array with `id`, `name`, `desc`, `subs`
2. Update the AI prompt's red flag JSON
3. Everything else (UI, export, trend report) generates dynamically

### Changing the AI model
- **Cloud:** Update the `<select id="cloud-model">` options and their `value` attributes
- **Local:** User types any model name they have pulled in Ollama — no code change needed

### Adding a new export field
1. Add the field to the `meta` object in `buildBulkPayload()` and `buildPayload()`
2. Add a row for it in `flattenPayload()` for CSV/Sheets export
3. Add it to the individual coaching report header in `buildIndividualCoachingHTML()`

---

## 17. File Format Reference

### Input transcript format
Plain `.txt` files. Speaker labels like `SPEAKER_00:` / `SPEAKER_01:` are present but not reliable — the AI determines which speaker is the agent from context. Files typically begin with a timestamp line.

### Scorecard payload object (single call)
```js
{
  meta: {
    agent, tsr, callDate, callTime, phoneNumber, callerId,
    callId, evaluator, campaign, date, outcome, filename, exportedAt
  },
  summary: {
    scored, autoFail, catalystED, catalystSummary
  },
  catalystBehaviors: [{ id, name, rating }],  // 6 items
  steps: [{
    step, name, catalyst, score, trending, notes
  }],  // 12 items
  redFlags: [{
    id, name, flagged, subs, notes
  }],  // 6 items
  executiveSummary: {
    topPriority, summary, strengths, opportunities, critical,
    coachingRecommendations: [{
      focus, what, transcriptEvidence, example, priority
    }]
  }
}
```
