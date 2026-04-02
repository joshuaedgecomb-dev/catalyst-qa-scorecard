# FCKeditor Dialer Campaign Scripts — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 5 standalone HTML call scripts for the FCKeditor-based dialer — one per campaign — following the Compass Navigator 5-phase call flow with full verbatim talk tracks, compliance callouts, pricing tables, and objection handling.

**Architecture:** Each script is a self-contained HTML file using only table-based layout with inline styles (no `<style>` blocks, no flexbox/grid, no gradients, no JS). Color-coded phases (Connect=purple, Explore=green, Consult=blue, Overcome=orange, Review=teal) with badge-labeled content blocks. Files go in `scripts/` at project root.

**Tech Stack:** Pure HTML with inline CSS. No dependencies. No build step.

**Spec:** `docs/superpowers/specs/2026-04-02-dialer-scripts-design.md`

**Reference files:**
- Pricing/deals: `cheatsheet/index.html`
- Product knowledge: `reference/xfinity_product_knowledge_base.md`
- Compliance verbatims + Compass Navigator: `reference/scorecard_training (2).md`

**Content rules (GLOBAL — apply to ALL scripts):**
- Never use the word "free" — use "included" or "on us"
- Never use cancellation or risk-free as a selling point
- All dynamic values use `[Bracket Placeholders]` (e.g., `[Customer Name]`, `[Your Name]`, `[Provider]`)
- APPD = Automatic Payment + Paperless Discount ($10/mo savings)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `scripts/script-nonsub.html` | Create | NonSub full script — establishes HTML table structure template |
| `scripts/script-localizers.html` | Create | Localizers script — NonSub variant with warm opening |
| `scripts/script-xm-likely.html` | Create | XM Likely script — existing customer, Mobile pitch |
| `scripts/script-add-a-line.html` | Create | Add a Line script — existing XM, add line/wearable |
| `scripts/script-xmc.html` | Create | XMC script — existing XM, device protection |

Tasks 2-5 can execute in parallel after Task 1 completes (they all use the same HTML structure pattern established in Task 1).

---

### Task 1: Build NonSub script (template + full content)

**Files:**
- Create: `scripts/script-nonsub.html`

This is the largest and most complex script. It establishes the HTML table structure that all other scripts will follow. Read the spec before starting.

**HTML Structure Pattern (used by all 5 scripts):**

The outermost element is a single `<table>` with `width="100%"`. Inside it:
- **Header row:** Campaign name + subtitle in white text on a colored background
- **Phase rows:** Each Compass phase gets a colored phase-header row followed by content rows
- **Content rows** contain nested tables for badges, talk track, compliance callouts, pricing tables, tips, and objections

Phase header row pattern:
```html
<tr>
  <td style="background:#[phase-bg-light]; padding:8px 16px; font-size:12px; color:#[phase-color]; font-weight:bold; border-bottom:2px solid #[phase-color]; letter-spacing:0.5px;">
    &#9654; PHASE [N] — [NAME]
  </td>
</tr>
```

Phase background light colors:
- Connect: `#f3eeff` (light purple)
- Explore: `#e8f8f5` (light green)
- Consult: `#e8f4fd` (light blue)
- Overcome: `#fef5e7` (light orange)
- Review: `#e8fffe` (light teal)

Content block badge pattern:
```html
<span style="background:#[color]; color:#fff; padding:2px 8px; font-size:11px; font-weight:bold;">
  [BADGE LABEL]
</span>
```

Badge colors by type:
- GREETING/SCRIPT: same as phase color
- COMPLIANCE: `#e67e22` (orange)
- TIP: `#95a5a6` (gray)
- PRICING: `#2d3436` (dark)
- OBJECTION: same as phase color (orange `#e67e22`)

Compliance callout pattern:
```html
<td style="background:#fef9e7; border-left:3px solid #f39c12; padding:8px 12px; font-size:13px; line-height:1.5;">
  [Verbatim text]
</td>
```

Tip pattern:
```html
<td style="padding:8px 16px; font-size:12px; color:#777; font-style:italic; background:#f9f9f9;">
  [Tip text]
</td>
```

Pricing table pattern (nested inside a content row):
```html
<table width="100%" cellpadding="5" cellspacing="0" style="font-size:11px; border-collapse:collapse; margin-top:6px;">
  <tr style="background:#f5f5f5;">
    <th style="text-align:left; padding:5px 8px; border-bottom:1.5px solid #ddd;">[Header]</th>
    ...
  </tr>
  <tr>
    <td style="padding:5px 8px; border-bottom:1px solid #f0f0f0;">[Data]</td>
    ...
  </tr>
</table>
```

Objection block pattern (4-step framework):
```html
<tr>
  <td style="padding:12px 16px; border-top:1px solid #eee;">
    <div style="margin-bottom:8px;">
      <span style="background:#e67e22; color:#fff; padding:2px 8px; font-size:11px; font-weight:bold;">OBJECTION</span>
      <span style="font-size:14px; font-weight:bold; color:#2d3436; margin-left:8px;">"[Objection text]"</span>
    </div>
    <table width="100%" cellpadding="4" cellspacing="0" style="font-size:13px; border-collapse:collapse;">
      <tr>
        <td style="width:24px; vertical-align:top; font-weight:bold; color:#e67e22;">1.</td>
        <td><strong>Understand:</strong> "[text]"</td>
      </tr>
      <tr>
        <td style="width:24px; vertical-align:top; font-weight:bold; color:#e67e22;">2.</td>
        <td><strong>Empathize &amp; Overcome:</strong> "[text]"</td>
      </tr>
      <tr>
        <td style="width:24px; vertical-align:top; font-weight:bold; color:#e67e22;">3.</td>
        <td><strong>Restate Tie-backs:</strong> "[text]"</td>
      </tr>
      <tr>
        <td style="width:24px; vertical-align:top; font-weight:bold; color:#e67e22;">4.</td>
        <td><strong>Add Value:</strong> "[text]"</td>
      </tr>
    </table>
  </td>
</tr>
```

- [ ] **Step 1: Create scripts/ directory**

```bash
mkdir -p scripts
```

- [ ] **Step 2: Write complete NonSub script**

Write `scripts/script-nonsub.html` with the full content. Use the HTML structure patterns above. The file structure is:

```
Outer table (width=100%, font-family: Segoe UI, Arial, sans-serif)
├── Header row: "NonSub — New Customer Acquisition"
│   Subtitle: "Internet → Mobile → StreamSaver → Home → Voice"
│   Background: #6138f5 (purple)
│
├── PHASE 1 — CONNECT (#6138f5 purple)
│   ├── GREETING badge: Opening lines
│   │   Main: "Hi, my name is [Your Name], calling from Xfinity. How's your day going?"
│   │   Alt: "Hi, I'm [Your Name], calling on behalf of Xfinity."
│   ├── COMPLIANCE badge (C1 Recording Disclosure):
│   │   "Before I continue, I need to inform you that the call is being recorded
│   │    and monitored for the highest quality standards. For more information about
│   │    Comcast privacy practices please visit xfinity.com/privacy."
│   ├── SCRIPT badge: Reason for Call
│   │   "The reason for my call today is that Xfinity just launched some really
│   │    exciting new deals in your area, and I wanted to make sure you had a chance
│   │    to hear about them before they're gone. I'll be quick — is now an okay time?"
│   └── TIP: Rapport during lookup
│       "While the system loads, ask a non-business question: 'So what part of
│        [City] are you in?' or 'How long have you been in the area?'"
│
├── PHASE 2 — EXPLORE (#00b894 green)
│   ├── SCRIPT badge: Transition
│   │   "Awesome — before I put anything together, I want to make sure I'm
│   │    recommending something that actually fits your household. Mind if I ask
│   │    a few quick questions?"
│   ├── SCRIPT badge: Users
│   │   "Can you paint me a picture of your household? Who all is going to be
│   │    using the internet?"
│   │   Follow-up: "Any kids? Do you work from home at all?"
│   ├── SCRIPT badge: Usage
│   │   "Walk me through what a typical day looks like — are you streaming,
│   │    gaming, video chatting for work? What does everybody get into?"
│   │   Follow-up: "What about streaming — Netflix, Hulu, Disney+? What apps
│   │    do you use now?"
│   ├── SCRIPT badge: Devices
│   │   "How many devices do you think you're connecting to WiFi on a given day?
│   │    Phones, tablets, laptops, smart TVs, gaming consoles..."
│   │   Follow-up: "Who's your current mobile provider?"
│   ├── SCRIPT badge: Cost
│   │   "And what does [Provider] run you right now for your [X] lines?"
│   │   Follow-up: "Are you on a contract with them currently?"
│   └── TIP: Tie-back listening
│       "Listen for tie-backs as they answer. Every detail they share becomes ammo
│        for your pitch. Gaming → speed. Kids → multiple devices. Streaming apps →
│        StreamSaver. Travel → Premium Unlimited."
│
├── PHASE 3 — CONSULT (#0984e3 blue)
│   ├── COMPLIANCE badge (C3 Broadband Labels):
│   │   "Before I go into plan details, I wanted to let you know that you can now
│   │    review a breakdown of pricing and features for Internet and mobile plans
│   │    online, making it easy for you to compare them. For more information please
│   │    visit xfinity.com/labels."
│   ├── SCRIPT badge: Internet Pitch
│   │   "Based on everything you told me, I think I have the perfect plan for you.
│   │    With [X people] in the household and all the streaming and [use case] you
│   │    mentioned, I'd recommend our [Tier] Mbps plan. That way you can [use case 1]
│   │    and [use case 2] at the same time without anyone fighting over bandwidth —
│   │    and you lock that price in for 5 years."
│   ├── PRICING badge: WiFi Deals (April 2026)
│   │   Table: Speed | 5-Year (w/ APPD) | 1-Year (w/ APPD) | Included
│   │   300 Mbps: $45/mo ($55 w/o) | $40/mo ($50 w/o) | Gateway, unlimited data, Advanced Security
│   │   500 Mbps: $60/mo ($70 w/o) | $50/mo ($60 w/o) | Gateway, unlimited data, Advanced Security
│   │   1 Gig: $70/mo ($80 w/o) | $60/mo ($70 w/o) | + Disney+, Hulu, Peacock (36 mo)
│   │   1.2 Gig: $100/mo ($110 w/o) | $90/mo ($100 w/o) | + Disney+, Hulu, Peacock (36 mo)
│   │   Note: APPD = $10/mo discount with bank account + paperless billing
│   │   Note: All deals include Gateway, unlimited data, Advanced Security, and an
│   │         Xfinity Mobile line included at $0/mo for 12 months
│   ├── SCRIPT badge: Mobile Cross-sell
│   │   "Now here's the best part — with your Internet plan, you get an Xfinity Mobile
│   │    line included at no extra cost for 12 months. That's a $480 value. You
│   │    mentioned you're paying [Provider] $[X] for your [X] lines — with Xfinity
│   │    Mobile you could be looking at [Unlimited $40/line or Premium Unlimited
│   │    $50/line] and keep using the same network. Who's your current provider?
│   │    [If Verizon:] You'd be on the exact same network — Xfinity Mobile runs on
│   │    Verizon's towers — but at a fraction of the cost."
│   ├── PRICING badge: Xfinity Mobile Plans
│   │   Table: Lines | Unlimited | Premium Unlimited
│   │   1: $40/mo | $50/mo
│   │   2: $60/mo | $80/mo
│   │   3: $80/mo | $110/mo
│   │   4: $100/mo | $140/mo
│   │   Note: Included line = $0/mo for 12 months on 300 Mbps+
│   │   Note: Trade-in deals: iPhone 17e on us w/ trade-in (Premium), up to $1,100
│   │         off Samsung. Activation fee waived through 4/21.
│   ├── SCRIPT badge: StreamSaver Cross-sell
│   │   "You mentioned you're using [Netflix/Disney+/Hulu/etc.] — instead of paying
│   │    for those separately, I can bundle them together with StreamSaver and save
│   │    you over 25%. Xfinity is the only provider that offers this."
│   ├── PRICING badge: StreamSaver Bundles
│   │   Table: Bundle | Price
│   │   Peacock + Disney+ + Hulu: $15/mo
│   │   Peacock + Netflix + Apple TV: $18/mo
│   │   Peacock + Netflix + HBO Max: $22/mo
│   │   Peacock + Apple TV + HBO Max: $22/mo
│   │   Peacock + Netflix + Disney+ + Hulu: $22/mo
│   │   Peacock + Netflix + Apple TV + HBO Max: $30/mo
│   │   Peacock + Netflix + Disney+ + Hulu + HBO Max: $30/mo
│   │   Peacock + Netflix + Apple TV + Disney+ + Hulu: $30/mo
│   ├── SCRIPT badge: Home Cross-sell
│   │   "I also heard you say you [own your home / have kids / travel for work] — I
│   │    set you up with Xfinity Smart Home so you can keep an eye on things from your
│   │    phone. It's just $10/mo for 24/7 recording, AI detection, and Urgent Response."
│   │   Alt: "We also have professionally monitored Home Security starting at $55/mo."
│   └── SCRIPT badge: Voice Cross-sell
│       "And to back up your cell phone, I also included Xfinity Voice — unlimited
│        local and international calling to 90+ countries for $30/mo with autopay."
│
├── PHASE 4 — OVERCOME (#e67e22 orange)
│   ├── OBJECTION 1: "I'm not interested." (nonspecific — probe first)
│   │   1. Understand: "I totally get that — and I appreciate your honesty. Just out
│   │      of curiosity, is it the timing, or was there something specific about what
│   │      I mentioned that didn't seem like a fit?"
│   │   2. Empathize & Overcome: (Respond based on what they reveal — pivot to the
│   │      relevant rebuttal below)
│   │   3. Restate Tie-backs: "I only ask because you mentioned [tie-back from
│   │      discovery] — and that's exactly where this plan would make a real difference."
│   │   4. Add Value: "One other thing — with this deal, your Xfinity Mobile line is
│   │      included at no cost for 12 months. That's $480 in savings on top of the
│   │      internet price."
│   ├── OBJECTION 2: "It's too expensive."
│   │   1. Understand: "Totally fair — budget matters. When you say too expensive, is
│   │      it the monthly cost, or more the idea of switching right now?"
│   │   2. Empathize & Overcome: "I completely understand that. Here's what a lot of
│   │      people don't realize though — when you add up what you're paying for
│   │      internet, your mobile plan, and streaming subscriptions separately, you're
│   │      probably spending more than what I'm putting together for you here. Let me
│   │      show you the math."
│   │   3. Restate Tie-backs: "You told me you're paying [Provider] $[X] for mobile
│   │      and $[X] for internet — that's $[Total]. With this package you'd be at
│   │      $[X] and getting more."
│   │   4. Add Value: "And the autopay discount saves you another $10/mo. Plus you're
│   │      locking this price in so it doesn't creep up on you."
│   ├── OBJECTION 3: "I'm happy with my current provider."
│   │   1. Understand: "That's great to hear — what is it about them that you like most?"
│   │   2. Empathize & Overcome: "I respect that. The reason I bring this up is that
│   │      a lot of customers who were happy with [Provider] ended up switching because
│   │      they realized they could get the same or better speeds, plus mobile savings
│   │      and streaming bundles that [Provider] just doesn't offer. Xfinity is the
│   │      only provider that bundles Netflix, Disney+, Hulu, and more at a discount."
│   │   3. Restate Tie-backs: "And with [X] people in your house doing [use case], the
│   │      [Tier] plan would give you more headroom than what you've got now."
│   │   4. Add Value: "Plus there's no contract — you're locking in the price, not
│   │      locking yourself in."
│   ├── OBJECTION 4: "I need to think about it."
│   │   1. Understand: "Absolutely — I want you to feel 100% good about this. Is there
│   │      a specific piece you want to think over, or is it more of an overall decision?"
│   │   2. Empathize & Overcome: "I get it — it's a big decision. The thing I wouldn't
│   │      want is for you to miss this pricing though. These 5-year locked rates are
│   │      some of the best we've ever offered, and they won't last forever."
│   │   3. Restate Tie-backs: "And based on what you told me about [tie-backs], this
│   │      really is set up exactly for your household."
│   │   4. Add Value: "Tell you what — let me get it set up now so you can lock in
│   │      the pricing. You'll have time to review everything before it finalizes."
│   ├── OBJECTION 5: "I'm in a contract with my current provider."
│   │   1. Understand: "Got it — do you know when that contract is up, roughly?"
│   │   2. Empathize & Overcome: "Here's what I'd suggest — a lot of our customers
│   │      find that even with an early termination fee, the savings they get by
│   │      switching actually cover that cost within the first few months. Especially
│   │      with the mobile line included at no cost for 12 months."
│   │   3. Restate Tie-backs: "With what you're paying [Provider] right now versus
│   │      what I'm putting together, you'd be saving $[X]/mo — that adds up fast."
│   │   4. Add Value: "And keep in mind, there's no contract on our end. You're
│   │      locking in the price, not locking yourself in."
│   └── OBJECTION 6: "Just send me the information."
│       1. Understand: "Absolutely, I can do that. Before I do — what specific
│          information would be most helpful for you to see?"
│       2. Empathize & Overcome: "I want to make sure what I send you covers
│          everything. The reason I like going over it together is that these
│          promotions are time-sensitive, and I can get you the best price right
│          now versus what you'd see online."
│       3. Restate Tie-backs: "Plus I've already put together something tailored to
│          your household based on what you told me — that's not something you'd get
│          from a brochure."
│       4. Add Value: "How about this — let me walk you through the highlights real
│          quick, and then I'll send you a full summary so you have it in writing.
│          Sound fair?"
│
├── PHASE 5 — REVIEW (#00cec9 teal)
│   ├── SCRIPT badge: Assume the Sale
│   │   "Alright [Customer Name], I've got the perfect setup for you — let me get
│   │    this locked in so you don't miss these prices. Sound good?"
│   ├── TIP: "Don't ask 'Would you like to move forward?' — assume. 'Let me get
│   │    this set up for you' is the move."
│   ├── SCRIPT badge: Reaffirm the Decision
│   │   "You're making a great choice — you're getting [speed tier] locked in at
│   │    $[X]/mo for 5 years, an Xfinity Mobile line included for 12 months,
│   │    [StreamSaver/Home if added]. This is honestly one of the best packages
│   │    I've put together."
│   ├── COMPLIANCE badge (C4 Before Submitting):
│   │   "Before submitting your order, I want to spend a few minutes confirming
│   │    with you that I've accurately captured the services you want. I'll ask
│   │    you to review the order, and then if it's correct, please approve it.
│   │    What phone number or email address would you like to use to complete
│   │    this process?"
│   ├── SCRIPT badge: Order Summary
│   │   "Read through all of the following:"
│   │   - Services on the order and monthly price for each
│   │   - Promotional pricing and how long it lasts
│   │   - Roll-to rate after promo ends
│   │   - One-time charges (activation fees, equipment)
│   │   - Applicable taxes and fees
│   │   - APPD discount if enrolled ($10/mo savings)
│   ├── COMPLIANCE badge (C5 Text Consent — if sending via text):
│   │   "Thanks. I'll now send you a text message at the number you provided with
│   │    a link to confirm your order. Message and data rates may apply. Okay?"
│   ├── COMPLIANCE badge (C6 Verbal Summary — if digital fails):
│   │   "Read the entire order summary top to bottom including legal disclaimer,
│   │    taxes, fees, and one-time charges. Then say:"
│   │   "DO YOU AGREE TO ORDER AND BE BILLED FOR THE EQUIPMENT AND SERVICES THAT
│   │    I JUST DESCRIBED?"
│   ├── COMPLIANCE badge (C7 Post-Approval):
│   │   "Thank you. After we finalize your order, you'll receive a copy of your
│   │    order summary within 6 hours at the email address listed on your account.
│   │    You can also find it at xfinity.com/MyAccount."
│   ├── SCRIPT badge: Installation & Activation
│   │   Internet: "For your internet, let's get your installation scheduled. What
│   │    day and time works best for you? [Schedule]. Our technician will be there
│   │    during that window, and we guarantee the on-time appointment — if they're
│   │    late, we'll credit your account $20."
│   │   Mobile: "Your SIM [or eSIM] will be activated [today/when device arrives].
│   │    Once it's active, your number will port over from [Provider] — usually takes
│   │    a couple hours. You don't need to call [Provider] to cancel — we handle that
│   │    automatically when the number transfers."
│   ├── SCRIPT badge: Xfinity App & Rewards
│   │   "One last thing — download the Xfinity App if you haven't already. You can
│   │    manage your account, check your bill, troubleshoot your WiFi, all from your
│   │    phone. And as an Xfinity customer, you've got Xfinity Membership — that
│   │    means exclusive access to rewards, experiences, and perks just for being
│   │    with us."
│   ├── COMPLIANCE badge (C8 Closing):
│   │   "Thank you for your time today, [Customer Name]. If you have any questions
│   │    about this call or any Xfinity products or services in your area, please
│   │    feel free to call 1-800-XFINITY (934-6489) or visit xfinity.com. Have a
│   │    great rest of your day!"
│   └── SCRIPT badge: No-Sale Close
│       "I appreciate you taking the time to chat with me today, [Customer Name].
│        If anything changes or you want to revisit this down the road, don't
│        hesitate to call us at 1-800-XFINITY or visit xfinity.com. Have a great
│        rest of your day!"
│       TIP: "Even on a no-sale, leave the door open and leave a good impression.
│        This person might call back, get another outbound call, or walk into a
│        store. How you end the call matters."
```

- [ ] **Step 3: Validate NonSub constraints**

Run these checks:
```bash
# No "free" in sales language (ignore "feel free" in compliance verbatim)
grep -i "\bfree\b" scripts/script-nonsub.html | grep -v "feel free"
# Expected: no output (0 matches)

# No cancel/risk-free selling language
grep -i "cancel\|risk.free" scripts/script-nonsub.html
# Expected: no output

# Compliance verbatims present
grep -i "xfinity.com/privacy" scripts/script-nonsub.html
grep -i "xfinity.com/labels" scripts/script-nonsub.html
grep -i "before submitting your order" scripts/script-nonsub.html
grep -i "message and data rates" scripts/script-nonsub.html
grep -i "DO YOU AGREE TO ORDER" scripts/script-nonsub.html
grep -i "within 6 hours" scripts/script-nonsub.html
grep -i "1-800-XFINITY" scripts/script-nonsub.html
# Expected: at least 1 match per line
```

- [ ] **Step 4: Open in browser and visually verify**

```bash
# Open in default browser to check rendering
start scripts/script-nonsub.html
```

Verify: all 5 phases render with correct colors, pricing tables are readable, compliance callouts are yellow, badges are visible, no broken layout.

- [ ] **Step 5: Commit**

```bash
git add scripts/script-nonsub.html
git commit -m "Add NonSub dialer script with full Compass Navigator talk track"
```

---

### Task 2: Build Localizers script

**Files:**
- Create: `scripts/script-localizers.html`

**Depends on:** Task 1 (uses same HTML structure)

Copy `scripts/script-nonsub.html` as starting point, then make these changes:

- [ ] **Step 1: Copy NonSub and modify**

Copy `scripts/script-nonsub.html` to `scripts/script-localizers.html`, then apply these changes:

1. **Header:** Change title to "Localizers — Website Visitor Follow-up" and subtitle to "Warm Lead: Internet → Mobile → StreamSaver → Home → Voice"

2. **Phase 1 — Connect:** Replace the Reason for Call block with:
   > "I noticed you were recently checking out some of our plans on xfinity.com — looks like you were interested in getting set up. I wanted to reach out personally to see if I could answer any questions and help you get the best deal available right now."

3. **Phase 2 — Explore:** After the Cost discovery question, add one more SCRIPT block:
   > **SCRIPT badge: Website Interest**
   > "What was it about the plans you were looking at online that caught your eye? Was there something specific you were hoping to get?"

4. **Phase 3 — Consult:** Replace the Internet Pitch transition with:
   > "Based on what you were already looking at online, plus what you just told me, here's what I'd put together for you..."
   
   Rest of Consult (pricing tables, cross-sells) stays identical to NonSub.

5. **Phase 4 — Overcome:** Keep all 6 NonSub objections. Add a 7th objection at the end:
   > **OBJECTION 7: "I already looked online and decided not to."**
   > 1. Understand: "I appreciate you giving us a look — what was it that made you hold off?"
   > 2. Empathize & Overcome: "That makes sense. One thing I will say is that the deals I have access to on this call are actually different from what you see on the website. I can offer [specific deal] that isn't available through the online checkout."
   > 3. Restate Tie-backs: "And now that I know more about your household — [tie-backs] — I can put together something more tailored than what the website would have shown you."
   > 4. Add Value: "Plus I'll handle everything from start to finish so you don't have to figure it out yourself. Let me show you what I've got."

6. **Phase 5 — Review:** Identical to NonSub. No changes.

- [ ] **Step 2: Validate constraints**

```bash
grep -i "\bfree\b" scripts/script-localizers.html | grep -v "feel free"
grep -i "cancel\|risk.free" scripts/script-localizers.html
# Expected: no output for both
```

- [ ] **Step 3: Open in browser and visually verify**

```bash
start scripts/script-localizers.html
```

- [ ] **Step 4: Commit**

```bash
git add scripts/script-localizers.html
git commit -m "Add Localizers dialer script (warm NonSub variant with website follow-up)"
```

---

### Task 3: Build XM Likely script

**Files:**
- Create: `scripts/script-xm-likely.html`

**Depends on:** Task 1 (uses same HTML structure)

Build from scratch using the Task 1 HTML structure pattern. This is an existing-customer script — shorter than NonSub, focused on Mobile pitch.

- [ ] **Step 1: Write complete XM Likely script**

Use the same outer table structure from Task 1 with these changes:

**Header:** "XM Likely — Xfinity Mobile for Internet Customers", subtitle: "Existing Customer: Mobile → StreamSaver → Home"

**Phase 1 — Connect (purple #6138f5):**
- GREETING: "Hi [Customer Name], my name is [Your Name] calling from Xfinity. How's your day going?"
- COMPLIANCE (C1 Recording Disclosure): exact verbatim from spec
- SCRIPT badge (Authentication): "Just so I can speak more specifically about your account, could you verify your service address and the phone number on the account?" Alt: "I'll send a 6-digit verification code to confirm your identity."
- SCRIPT badge (Reason + Rewards): "I see you've been a customer since [Year], which qualifies you for [Tier] level Xfinity Rewards — that's awesome. The reason I'm calling is we have an incredible offer right now exclusively for customers like you that I think you're going to love."
- TIP: Rapport during authentication lookup

**Phase 2 — Explore (green #00b894):**
- SCRIPT: Transition — "I want to make sure what I show you actually makes sense for you. Mind if I ask a couple quick questions about your mobile setup?"
- SCRIPT: Devices — "How many phone lines do you have right now with [Provider]? Any smartwatches or tablets on the plan too?"
- SCRIPT: Usage — "How do you typically use your phone day to day — are you a big data user, streaming on the go, using hotspot? Or mostly on WiFi at home?" Follow-up: "Do you travel much — internationally or even just to Mexico or Canada?"
- SCRIPT: Cost — "And what's [Provider] running you right now for those [X] lines?" Follow-up: "Are you in a contract or are you month to month?"
- TIP: "Heavy data/4K/travel/hotspot → pitch Premium Unlimited. Regular use/Mexico calls → Unlimited. Mostly on WiFi/basics → Unlimited is still the play because of the included line deal."

**Phase 3 — Consult (blue #0984e3):**
- COMPLIANCE (C3 Broadband Labels): exact verbatim from spec
- SCRIPT: Mobile Pitch — "So here's why I'm so excited to tell you about this — you mentioned you're paying [Provider] $[X] for [X] lines. With Xfinity Mobile, because you already have Internet with us, you get your first line included at $0 a month for 12 months. That's a $480 savings right there. And after that, Unlimited is just $40 a month. You'd be on the same Verizon network [if applicable], plus everywhere you go where there's an Xfinity WiFi hotspot — and there are millions of them — your phone automatically connects, which saves your data and speeds things up."
- SCRIPT: Plan Recommendation — Heavy data path: "Based on what you told me about [streaming on the go / traveling / needing hotspot], I'd go with Premium Unlimited at $50 a line. You get 100 GB of prioritized data, 30 GB hotspot, 4K streaming, and Global Travel Pass included." Regular use path: "Unlimited at $40 a line is perfect for what you're describing — 30 GB of prioritized data, and you're on WiFi at home most of the time anyway so you'll barely touch it."
- PRICING: Xfinity Mobile Plans table (same as NonSub)
- SCRIPT: Device Promos — "And if anyone's looking at a new phone — right now we've got the iPhone 17e on us with a trade-in on Premium Unlimited. Or up to $1,100 off the latest Samsung. Plus we'll waive the $25 activation fee."
- SCRIPT: StreamSaver Cross-sell (same pitch as NonSub)
- PRICING: StreamSaver Bundles table (same as NonSub)
- SCRIPT: Home Cross-sell (same pitch as NonSub)

**Phase 4 — Overcome (orange #e67e22):**
- OBJECTION 1: "I'm happy with my carrier."
  1. Understand: "That's great — what do you like most about [Provider]?"
  2. Empathize & Overcome: "I hear that a lot, and I respect it. Here's what usually surprises people — Xfinity Mobile actually runs on the same Verizon network [if applicable], so the coverage and reliability is identical. The difference is the price. You're paying [Provider] $[X] — I can get you the same experience for significantly less, especially with that included line."
  3. Restate Tie-backs: "You mentioned you're paying $[X] for [X] lines — with Xfinity Mobile that'd be $[X], and your first line is included for 12 months."
  4. Add Value: "And right now we're waiving the $25 activation fee, plus we've got [device promo] if anyone's looking at an upgrade."
- OBJECTION 2: "I don't want to switch my number."
  1. Understand: "Totally get that — your number is your number."
  2. Empathize & Overcome: "Good news — you keep your exact same number. We port it right over from [Provider]. You won't miss a single call or text, and it usually happens within a couple hours."
  3. Restate Tie-backs: "So nothing changes on your end except the bill gets smaller."
  4. Add Value: "And if you're bringing your own device, there's no device payment at all — just the plan cost."
- OBJECTION 3: "I don't want to deal with the hassle of switching."
  1. Understand: "I hear you — switching anything feels like a headache."
  2. Empathize & Overcome: "Here's the thing — I handle everything right here on this call. You don't have to go to a store, you don't have to call your old provider. We port your number, ship your SIM if needed, and you're up and running."
  3. Restate Tie-backs: "For the savings you'd be getting — $[X]/mo less than what you're paying now — it's worth the 20 minutes."
  4. Add Value: "And remember, there's no contract. If for any reason it's not what you expected, you're not stuck."

**Phase 5 — Review (teal #00cec9):**
- SCRIPT: Assume the Sale — "Alright [Customer Name], let's get you set up and start saving. I'll get this mobile line added to your account right now."
- SCRIPT: Reaffirm — "This is going to save you a ton — you're going from $[X]/mo with [Provider] down to $[X]/mo, same great coverage, and your first line is on us for 12 months."
- COMPLIANCE (C4): Before Submitting verbatim
- SCRIPT: Order Summary checklist
- COMPLIANCE (C5): Text Consent verbatim
- COMPLIANCE (C6): Verbal Summary verbatim
- COMPLIANCE (C7): Post-Approval verbatim
- SCRIPT: Activation — "Your SIM will ship out [today/tomorrow] — once it arrives, just pop it in and your number will port over automatically. Usually takes a couple hours. You don't need to contact [Provider] — the port handles that." BYOD path: "Since you're bringing your own device, we'll ship you a SIM card or set up eSIM — either way it's quick and painless." New device path: "Your new [Device] will ship to your door. Once it arrives, power it on and follow the setup — your number and everything will be ready to go."
- SCRIPT: Xfinity App & Rewards (same as NonSub)
- COMPLIANCE (C8): Closing verbatim
- SCRIPT: No-Sale Close (same as NonSub)

- [ ] **Step 2: Validate constraints**

```bash
grep -i "\bfree\b" scripts/script-xm-likely.html | grep -v "feel free"
grep -i "cancel\|risk.free" scripts/script-xm-likely.html
# Expected: no output for both
```

- [ ] **Step 3: Open in browser and visually verify**

```bash
start scripts/script-xm-likely.html
```

- [ ] **Step 4: Commit**

```bash
git add scripts/script-xm-likely.html
git commit -m "Add XM Likely dialer script for existing Internet customers"
```

---

### Task 4: Build Add a Line script

**Files:**
- Create: `scripts/script-add-a-line.html`

**Depends on:** Task 1 (uses same HTML structure)

- [ ] **Step 1: Write complete Add a Line script**

**Header:** "Add a Line — Xfinity Mobile Line Addition", subtitle: "Existing XM Customer: Add Line/Wearable → XMC"

**Phase 1 — Connect (purple #6138f5):**
- GREETING: "Hi [Customer Name], my name is [Your Name] calling from Xfinity. How's your day going?"
- COMPLIANCE (C1): Recording Disclosure verbatim
- SCRIPT: Authentication — same as XM Likely
- SCRIPT: Reason + Rewards — "I see you've been a customer since [Year], which qualifies you for [Tier] level Xfinity Rewards — that's awesome. I can see you're already enjoying Xfinity Mobile, and the reason I'm reaching out is we've got some great deals going on right now to add another line to your account — whether it's for someone in the family or even a smartwatch."
- TIP: Rapport during lookup

**Phase 2 — Explore (green #00b894):**
- SCRIPT: Transition — "Tell me a little about who the new line would be for."
- SCRIPT: Users — "Is this for someone in the family — a spouse, a kid — or are you looking at something like a smartwatch for yourself?"
- SCRIPT: Usage — "And how would they be using it? Heavy on social media, streaming, gaming — or more basic calls and texts?" If smartwatch: "Are you looking at an Apple Watch or Samsung? Do you have one in mind already?"
- SCRIPT: Devices — "Do they already have a phone they'd want to bring over, or are they looking at getting a new device?"
- TIP: "If it's for a kid, emphasize parental controls and the savings vs. a separate plan. If BYOD, no device payment = lower total cost. If new device, lead with the trade-in promos."

**Phase 3 — Consult (blue #0984e3):**
- COMPLIANCE (C3): Broadband Labels verbatim
- SCRIPT: Line Pitch — "Great news — adding a line to your existing plan is super simple. For your [person/device], we'd just add another [Unlimited/Premium Unlimited] line."
- PRICING: Add a Line table
  | Current Lines | + 1 Unlimited | + 1 Premium |
  |1 → 2 | $60/mo total | $80/mo total |
  |2 → 3 | $80/mo total | $110/mo total |
  |3 → 4 | $100/mo total | $140/mo total |
- SCRIPT: Wearable option — "For a smartwatch, it's just $10/mo added to your plan. You get calls, texts, and data right on your wrist even when your phone isn't nearby."
- SCRIPT: Device Promos — "If they need a new phone, right now we've got some incredible deals — iPhone 17e on us with a trade-in on Premium Unlimited, up to $1,100 off Samsung. Plus the $25 activation fee is waived through April 21st." BYOD: "And if they already have a phone they love, they can bring it right over — no device payment, just the plan cost."
- SCRIPT: XMC Cross-sell — "One thing I always recommend when adding a new device — Xfinity Mobile Care. Starting at just $9/mo, it covers cracked screens, loss, theft, and even gives you an early upgrade option. It's way better than AppleCare because it includes loss and theft coverage and you can use it at any Xfinity store."

**Phase 4 — Overcome (orange #e67e22):**
- OBJECTION 1: "We don't need another line."
  1. Understand: "Totally fair. Just curious — is there anyone in the household who's sharing a phone, or maybe a kid who's getting to that age?"
  2. Empathize & Overcome: "The reason I ask is that adding a line on your existing plan is way more affordable than most people think — it's only $20 more for Unlimited. And with the deals we've got on devices right now, the phone can practically pay for itself with trade-in credit."
  3. Restate Tie-backs: "You mentioned [tie-back about family/devices] — that's exactly the kind of situation where an extra line makes life easier."
  4. Add Value: "Plus I'd recommend Xfinity Mobile Care on the new device — starting at just $9/mo for unlimited screen repairs and full loss/theft coverage."
- OBJECTION 2: "My kid doesn't need a phone yet."
  1. Understand: "I hear that — how old are they, if you don't mind me asking?"
  2. Empathize & Overcome: "That makes sense. A lot of parents tell me the same thing, and then they end up getting one for safety reasons — being able to reach them after school, at a friend's house, or in an emergency. And with Xfinity Mobile you've got parental controls built right in."
  3. Restate Tie-backs: "And at just $20 more on your plan for Unlimited, it's a lot more affordable than a separate plan."
  4. Add Value: "Right now we've got phones starting at $0 with trade-in — and a smartwatch at $10/mo is another option if you want them reachable without a full phone."

**Phase 5 — Review (teal #00cec9):**
- SCRIPT: Assume the Sale — "Let's go ahead and get that line added — this is going to be so easy."
- SCRIPT: Reaffirm — "Great call on this — [Person] is going to love having their own line, and at just $[X] more on your plan, it's a no-brainer."
- COMPLIANCE (C4): Before Submitting verbatim
- SCRIPT: Order Summary checklist
- COMPLIANCE (C5): Text Consent verbatim
- COMPLIANCE (C6): Verbal Summary verbatim
- COMPLIANCE (C7): Post-Approval verbatim
- SCRIPT: Activation — New device: "We'll ship the [Device] right to your door. Once it arrives, power it on and it'll be ready to go." BYOD: "We'll get a SIM shipped out — once it's in, the line activates automatically." Wearable: "Your [Watch] will ship out and we'll have the line ready. Once you pair it to your phone, you're all set."
- SCRIPT: XMC Reminder — "And just to confirm — did you want to add Xfinity Mobile Care on that new device? At $[X]/mo it's the best way to keep it protected from day one."
- SCRIPT: Xfinity App & Rewards (same as NonSub)
- COMPLIANCE (C8): Closing verbatim
- SCRIPT: No-Sale Close (same as NonSub)

- [ ] **Step 2: Validate constraints**

```bash
grep -i "\bfree\b" scripts/script-add-a-line.html | grep -v "feel free"
grep -i "cancel\|risk.free" scripts/script-add-a-line.html
# Expected: no output for both
```

- [ ] **Step 3: Open in browser and visually verify**

```bash
start scripts/script-add-a-line.html
```

- [ ] **Step 4: Commit**

```bash
git add scripts/script-add-a-line.html
git commit -m "Add Add-a-Line dialer script for existing XM customers"
```

---

### Task 5: Build XMC script

**Files:**
- Create: `scripts/script-xmc.html`

**Depends on:** Task 1 (uses same HTML structure)

Shortest script — single product, no cross-sells.

- [ ] **Step 1: Write complete XMC script**

**Header:** "XMC — Xfinity Mobile Care", subtitle: "Existing XM Customer: Device Protection"

**Phase 1 — Connect (purple #6138f5):**
- GREETING: "Hi [Customer Name], my name is [Your Name] calling from Xfinity. How's your day going?"
- COMPLIANCE (C1): Recording Disclosure verbatim
- SCRIPT: Authentication — same as XM Likely
- SCRIPT: Reason + Rewards — "I see you've been a customer since [Year], which qualifies you for [Tier] level Xfinity Rewards — that's awesome. I see you're on Xfinity Mobile — great choice. The reason I'm calling is I wanted to make sure your device is fully protected. A lot of our customers don't realize how much coverage they can get, and I'd hate for you to find out the hard way."
- TIP: Rapport during lookup

**Phase 2 — Explore (green #00b894):**
- SCRIPT: Transition — "Let me ask you a couple quick questions so I can show you exactly what kind of coverage makes sense."
- SCRIPT: Device — "What phone are you using right now?" Follow-up: "How long have you had it? Are you still making payments on it?"
- SCRIPT: Risk — "Do you use a case and screen protector, or are you living on the edge?" Follow-up: "Have you ever cracked a screen or lost a phone? What did that end up costing you?"
- TIP: "The goal is to make them think about the cost of NOT having protection. Get them to name a dollar amount they've paid for a repair or replacement — then you compare that to $9-$19/mo."

**Phase 3 — Consult (blue #0984e3):**
- NOTE: No Broadband Labels required (not offering Internet or Mobile service)
- SCRIPT: XMC Pitch — "So [Customer Name], with your [Phone Model], here's what Xfinity Mobile Care gets you — unlimited screen repairs, front and back glass, at no extra charge. If your phone is lost, stolen, or damaged beyond repair, you're covered for up to 3 claims in 12 months. And here's something most people don't know — you also get early upgrade eligibility once you've paid off 50% of your device."
- PRICING: XMC Tiers table
  | Device Value | Monthly |
  | $0-$300.99 | $9/mo |
  | $301-$949.99 | $15/mo |
  | $950-$1,194.99 | $17/mo |
  | $1,195+ | $19/mo |
- SCRIPT: AppleCare Comparison — "A lot of people think AppleCare has them covered, but here's the difference — AppleCare doesn't cover loss or theft unless you pay extra, charges you a deductible for every screen repair, and you can only go to Apple. With XMC, screen repairs are included at no extra cost, loss and theft is built in, and you can walk into any Xfinity store or thousands of repair locations. Plus it works even if you brought your own device."
- PRICING: XMC vs AppleCare comparison table
  | Feature | XMC | AppleCare+ |
  | Screen repair | Included (unlimited) | $29-$99 deductible |
  | Loss/Theft | Included | Extra cost add-on |
  | Repair locations | Xfinity stores + thousands | Apple stores only |
  | BYOD eligible | Yes | No |
  | Early upgrade | At 50% paid off | Not available |
- SCRIPT: Cost Anchoring — "Think about it this way — a single screen repair at a third-party shop runs $200-$350. Replacing a lost phone out of pocket? $800-$1,200. For $[X]/mo, you're covered for all of it."

**Phase 4 — Overcome (orange #e67e22):**
- OBJECTION 1: "I already have AppleCare."
  1. Understand: "Good — so you're already thinking about protection, which is smart. Let me ask — do you have the basic AppleCare or AppleCare+ with theft and loss?"
  2. Empathize & Overcome: "Here's where XMC really stands apart — with AppleCare, every screen repair has a deductible. With XMC, screen repairs are included at no extra cost, unlimited, front and back. Plus XMC includes loss and theft automatically — with Apple, that's an upgrade you have to pay extra for. And you're not limited to Apple stores — you can use any Xfinity store or thousands of repair locations."
  3. Restate Tie-backs: "You mentioned you [don't use a case / have cracked a screen before / are still paying the phone off] — XMC makes sure that never costs you out of pocket."
  4. Add Value: "Plus you get early upgrade eligibility at 50% paid off. AppleCare doesn't offer that."
- OBJECTION 2: "I don't need insurance — I'm careful."
  1. Understand: "I respect that — you clearly take care of your stuff."
  2. Empathize & Overcome: "Here's the thing though — most claims aren't from being careless. It's a phone slipping off a counter, getting knocked out of your hand, or just plain bad luck. And if it's lost or stolen, careful doesn't matter. A single incident without coverage on a [Phone Model] could cost you $[estimate]."
  3. Restate Tie-backs: "For just $[X]/mo, that's less than a dollar a day to make sure you never have to pay that."
  4. Add Value: "And don't forget the early upgrade perk — once you've paid off half your device, you can upgrade with no fee. That alone can save you hundreds."
- OBJECTION 3: "It's too expensive for insurance."
  1. Understand: "I get it — nobody wants another monthly charge. What's your biggest concern — the monthly cost or the value of what you're getting?"
  2. Empathize & Overcome: "Here's how I think about it — your [Phone Model] costs $[MSRP]. A screen repair runs $200-$350. Losing it? You're looking at replacing it at full price. XMC at $[X]/mo means in a year you've paid $[annual], and one single claim saves you more than that."
  3. Restate Tie-backs: "And with unlimited screen repairs included, you could crack it tomorrow and it wouldn't cost you a thing extra."
  4. Add Value: "Plus the early upgrade eligibility — you don't have to pay your phone all the way off before getting the next one."

**Phase 5 — Review (teal #00cec9):**
- SCRIPT: Assume the Sale — "Let's go ahead and get your [Phone Model] protected right now — takes about two minutes."
- SCRIPT: Reaffirm — "Smart move, [Customer Name]. For just $[X]/mo you've got unlimited screen repairs, loss and theft coverage, and that early upgrade perk. You won't have to worry about a thing."
- SCRIPT: Enrollment Confirmation — "Your Xfinity Mobile Care coverage starts today. If anything ever happens to your device, just walk into any Xfinity store, call us, or file a claim through the Xfinity app. You've got 3 claims per 12 months, and remember — screen repairs are unlimited and included."
- COMPLIANCE (C8): Closing verbatim
- SCRIPT: No-Sale Close (same as other scripts)

- [ ] **Step 2: Validate constraints**

```bash
grep -i "\bfree\b" scripts/script-xmc.html | grep -v "feel free"
grep -i "cancel\|risk.free" scripts/script-xmc.html
# Expected: no output for both
```

- [ ] **Step 3: Open in browser and visually verify**

```bash
start scripts/script-xmc.html
```

- [ ] **Step 4: Commit**

```bash
git add scripts/script-xmc.html
git commit -m "Add XMC dialer script for device protection pitch"
```

---

### Task 6: Cross-script validation and final commit

**Files:**
- All 5 scripts in `scripts/`

**Depends on:** Tasks 1-5

- [ ] **Step 1: Validate constraints across all scripts**

```bash
# No "free" in sales language across all scripts
for f in scripts/script-*.html; do echo "=== $f ===" && grep -in "\bfree\b" "$f" | grep -v "feel free"; done
# Expected: no matches

# No cancel/risk-free selling
for f in scripts/script-*.html; do echo "=== $f ===" && grep -in "cancel\|risk.free" "$f"; done
# Expected: no matches

# All compliance verbatims present in applicable scripts
for f in scripts/script-*.html; do
  echo "=== $f ==="
  echo -n "C1 Recording: "; grep -c "xfinity.com/privacy" "$f"
  echo -n "C8 Closing: "; grep -c "1-800-XFINITY" "$f"
done
# Expected: at least 1 for each in every script

# Broadband Labels in applicable scripts only
for f in scripts/script-nonsub.html scripts/script-localizers.html scripts/script-xm-likely.html scripts/script-add-a-line.html; do
  echo -n "$f C3: "; grep -c "xfinity.com/labels" "$f"
done
# Expected: at least 1 for each

# XMC should NOT have Broadband Labels
echo -n "XMC C3 (should be 0): "; grep -c "xfinity.com/labels" scripts/script-xmc.html
# Expected: 0

# Sale compliance in all scripts except XMC
for f in scripts/script-nonsub.html scripts/script-localizers.html scripts/script-xm-likely.html scripts/script-add-a-line.html; do
  echo -n "$f C4: "; grep -c "Before submitting your order" "$f"
  echo -n "$f C5: "; grep -c "Message and data rates" "$f"
  echo -n "$f C6: "; grep -c "DO YOU AGREE TO ORDER" "$f"
  echo -n "$f C7: "; grep -c "within 6 hours" "$f"
done
# Expected: at least 1 for each

# No <style> blocks or <script> tags (FCKeditor constraint)
for f in scripts/script-*.html; do echo "=== $f ===" && grep -in "<style\|<script\|display:flex\|display:grid" "$f"; done
# Expected: no matches
```

- [ ] **Step 2: Verify all 5 files exist and are non-empty**

```bash
ls -la scripts/script-*.html
wc -l scripts/script-*.html
```

Expected: 5 files, each several hundred lines.

- [ ] **Step 3: Open each in browser for final visual check**

```bash
for f in scripts/script-*.html; do start "$f"; done
```

Verify all 5 render correctly with proper colors, tables, and formatting.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add scripts/
git commit -m "Final validation pass across all 5 dialer scripts"
```
