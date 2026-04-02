# Dialer Scripts Design — FCKeditor Campaign Scripts

**Date:** 2026-04-02
**Status:** Approved

---

## Overview

Build 5 standalone HTML scripts for FCKeditor-based dialer, one per campaign/job. Each script provides a full verbatim talk track following the Compass Navigator's 5 phases (Connect, Explore, Consult, Overcome, Review). Scripts are visually modern within FCKeditor constraints using table-based layout with inline styles.

## Deliverables

5 standalone HTML files:
1. `script-nonsub.html` — Non-subscriber new customer acquisition
2. `script-localizers.html` — Website visitors who didn't finalize (warm nonsub variant)
3. `script-xm-likely.html` — Existing Internet customers pitched Xfinity Mobile
4. `script-add-a-line.html` — Existing XM customers adding a line or wearable
5. `script-xmc.html` — Existing XM customers pitched device protection

## Constraints

- **FCKeditor compatibility:** Table-based layout, inline styles only. No `<style>` blocks, no CSS flexbox/grid, no gradients, no JavaScript.
- **No merge fields:** All dynamic values use `[Bracket Placeholders]` that agents fill verbally by reading the contact info panel.
- **Standalone files:** Each loaded independently by the dialer per campaign/job.
- **Pricing source:** April 2026 cheatsheet (WiFi Deals, Mobile plans, XMC tiers, StreamSaver bundles).
- **Compliance source:** Scorecard training doc verbatims.
- **Never use "free"** in sales language — use "included" or "on us" per established feedback.
- **Never use cancellation/risk-free as a selling point** per established feedback.

## Visual Design

Table-based layout with inline styles. Color-coded phases:

| Phase | Color | Hex |
|-------|-------|-----|
| Connect | Purple | `#6138f5` |
| Explore | Green | `#00b894` |
| Consult | Blue | `#0984e3` |
| Overcome | Orange | `#e67e22` |
| Review | Teal | `#00cec9` |

Content block badges:
- **GREETING / SCRIPT** — Verbatim talk track
- **COMPLIANCE** — Required disclosures (yellow callout, `#fef9e7` bg, `#f39c12` left border)
- **TIP** — Coaching hints (gray italic)
- **PRICING** — Deal tables with current numbers
- **OBJECTION** — Rebuttal with 4-step framework

## Script Structure (Universal)

### Phase 1 — Connect
- Greeting (campaign-specific opening)
- Recording disclosure (compliance verbatim — all scripts)
- Authentication (existing customer scripts: XM Likely, Add a Line, XMC)
- Reason for call (campaign-specific)
- Rapport question (during system lookup)

### Phase 2 — Explore
- Transition into discovery
- Discovery questions by pillar (campaign-specific pillar emphasis)
- Agent tip on listening for tie-backs

### Phase 3 — Consult
- Broadband Labels compliance (required when Internet or Mobile is offered — applies to NonSub, Localizers, XM Likely, and Add a Line; NOT required for XMC since only device protection is pitched)
- Primary product pitch with tie-back language
- Pricing table(s) with April 2026 deals
- Cross-sell pitches (campaign-specific)

### Phase 4 — Overcome
- Campaign-specific common objections (the listed objections per campaign are the complete set — no additional objections should be added)
- Each follows 4-step Compass framework: Understand → Empathize & Overcome → Restate Tie-backs → Add Value

### Phase 5 — Review
- Assume the sale language
- Reaffirm the decision
- Before Submitting compliance verbatim
- Order summary structure
- Text Consent compliance (if applicable)
- Verbal summary compliance (if digital fails)
- Post-Approval compliance verbatim
- Installation/activation details (campaign-specific)
- Xfinity App & Rewards mention
- Closing compliance verbatim
- No-sale close alternative

---

## Compliance Verbatims (exact text for scripts)

These are the required verbatim statements. Each must appear in a yellow compliance callout box in the scripts.

**C1 — Recording Disclosure (every call, Phase 1):**
> "Before I continue, I need to inform you that this call is being recorded and monitored for the highest quality standards. For more information about Comcast privacy practices please visit xfinity.com/privacy."

**C3 — Broadband Labels (when Internet or Mobile is offered, Phase 3):**
> "Before I go into plan details, I wanted to let you know that you can now review a breakdown of pricing and features for Internet and mobile plans online, making it easy for you to compare them. For more information please visit xfinity.com/labels."

**C4 — Before Submitting (every sale, Phase 5):**
> "Before submitting your order, I want to spend a few minutes confirming with you that I've accurately captured the services you want. I'll ask you to review the order, and then if it's correct, please approve it. What phone number or email address would you like to use to complete this process?"

**C5 — Text Consent (if order link sent via text, Phase 5):**
> "Thanks. I'll now send you a text message at the number you provided with a link to confirm your order. Message and data rates may apply. Okay?"

**C6 — Verbal Order Summary (if digital option fails, Phase 5):**
Agent reads entire order summary top to bottom including legal disclaimer, taxes, fees, one-time charges. Then:
> "DO YOU AGREE TO ORDER AND BE BILLED FOR THE EQUIPMENT AND SERVICES THAT I JUST DESCRIBED?"

**C7 — Post-Approval (every sale after approval, Phase 5):**
> "Thank you. After we finalize your order, you'll receive a copy of your order summary within 6 hours at the email address listed on your account. You can also find it at xfinity.com/MyAccount."

**C8 — Closing Compliance (every call — sale or no sale, Phase 5):**
> "Thank you for your time today. If you have any questions about this call or any Xfinity products or services in your area, please feel free to call 1-800-XFINITY (934-6489) or visit xfinity.com. Have a great rest of your day."

**No-Sale Close (all scripts — when customer declines):**
> "I appreciate you taking the time to chat with me today, [Customer Name]. If anything changes or you want to revisit this down the road, don't hesitate to call us at 1-800-XFINITY or visit xfinity.com. Have a great rest of your day!"
>
> TIP: *Even on a no-sale, leave the door open and leave a good impression. This person might call back, get another outbound call, or walk into a store. How you end the call matters.*

---

## Campaign-Specific Content

### 1. NonSub (script-nonsub.html)

**Connect:**
- Cold intro: "Hi, my name is [Your Name], calling from Xfinity. How's your day going?"
- Alt: "Hi, I'm [Your Name], calling on behalf of Xfinity."
- Recording disclosure
- Reason: New deals in the area, time-sensitive
- Rapport: Non-business question during lookup

**Explore (all 4 pillars deep):**
- Users: "Paint me a picture of your household. Who all is going to be using the internet?"
- Usage: "Walk me through a typical day — streaming, gaming, video chatting for work?"
- Devices: "How many devices are you connecting to WiFi? Phones, tablets, laptops, smart TVs, gaming consoles..."
- Cost: "Who's your current mobile provider? What does [Provider] run you for your [X] lines?"

**Consult:**
- Broadband Labels compliance
- Primary: Internet (WiFi Deals) — speed tier recommendation tied to discovery
- Pricing table: 300M/500M/1G/1.2G with 5Y and 1Y APPD pricing
- Cross-sell 1: Mobile (included line at $0/mo for 12 months, plan pricing table)
- Cross-sell 2: StreamSaver (bundle pricing table matched to their streaming apps)
- Cross-sell 3: Home (Smart Home $10/mo or Home Security $55/mo if applicable)
- Cross-sell 4: Voice ($30/mo APPD if international calling needs)

**Overcome (6 objections):**
1. "I'm not interested" (nonspecific — probe first)
2. "It's too expensive" (total cost comparison)
3. "I'm happy with my current provider" (competitive comparison)
4. "I need to think about it" (urgency + price-lock expiration)
5. "I'm in a contract" (savings offset ETF)
6. "Just send me the information" (walk through highlights now, send summary)

**Review:**
- Full order summary with install scheduling
- All compliance verbatims
- Xfinity App & Rewards

### 2. Localizers (script-localizers.html)

Full standalone file. Contains all NonSub content with the following modifications:

**Connect:**
- Same greeting as NonSub
- Recording disclosure
- Reason for call (DIFFERENT from NonSub): "I noticed you were recently checking out some of our plans on xfinity.com — looks like you were interested in getting set up. I wanted to reach out personally to see if I could answer any questions and help you get the best deal available right now."
- Rapport: Same as NonSub

**Explore (all 4 pillars — same as NonSub, plus one additional question):**
- Same Users, Usage, Devices, Cost questions as NonSub
- Additional question: "What was it about the plans you were looking at online that caught your eye? Was there something specific you were hoping to get?"

**Consult:**
- Same products and pricing as NonSub
- Warmer transition frame: "Based on what you were already looking at online, plus what you just told me, here's what I'd put together for you..."

**Overcome (7 objections — all 6 NonSub objections plus one additional):**
1-6. Same as NonSub
7. "I already looked online and decided not to" (phone-exclusive deals not available online, tailored recommendation, agent handles everything)

**Review:**
- Same as NonSub

### 3. XM Likely (script-xm-likely.html)

**Connect:**
- Existing customer greeting with name
- Recording disclosure
- Authentication (6-digit code or address + phone)
- Rewards tier reference
- Reason: Exclusive offer for existing customers

**Explore (Usage + Cost focus):**
- Devices: "How many phone lines do you have with [Provider]? Any smartwatches or tablets?"
- Usage: "How do you use your phone day to day — big data user, streaming on the go, hotspot?"
- Cost: "What's [Provider] running you for those [X] lines?"

**Consult:**
- Broadband Labels compliance
- Primary: Xfinity Mobile (included line, same Verizon network, savings comparison)
- Plan recommendation based on discovery (Premium Unlimited vs Unlimited)
- Device promos (iPhone 17e on us, Samsung trade-in, activation fee waiver)
- Cross-sell 1: StreamSaver
- Cross-sell 2: Home

**Overcome (3 objections):**
1. "I'm happy with my carrier" (same network, lower price)
2. "I don't want to switch my number" (port keeps same number)
3. "I don't want to deal with the hassle" (agent handles everything)

**Review:**
- Mobile activation steps (SIM/eSIM ship, number port, no need to call old provider)
- BYOD vs new device paths
- All compliance verbatims

### 4. Add a Line (script-add-a-line.html)

**Connect:**
- Existing customer greeting
- Recording disclosure
- Authentication
- Rewards tier reference
- Reason: Great deals to add another line

**Explore (Devices + Usage focus):**
- Users: "Is this for someone in the family or a smartwatch for yourself?"
- Usage: "How would they be using it? Heavy social media, streaming, gaming, or basic?"
- Devices: "Do they have a phone to bring over or looking at a new device?"

**Consult:**
- Broadband Labels compliance (required — Mobile is being offered)
- Line pricing table (current lines + 1 at Unlimited/Premium)
- Wearable option ($10/mo smartwatch)
- Device promos (trade-in deals, BYOD path)
- Cross-sell: XMC on the new device

**Overcome (2 objections):**
1. "We don't need another line" (affordability, family convenience)
2. "My kid doesn't need a phone yet" (safety, parental controls, smartwatch alternative)

**Review:**
- Device shipping / BYOD SIM / wearable pairing
- XMC reminder if not added
- All compliance verbatims

### 5. XMC (script-xmc.html)

**Connect:**
- Existing customer greeting
- Recording disclosure
- Authentication
- Reason: Making sure device is fully protected

**Explore (Devices focus — short):**
- Device: "What phone are you using right now? How long have you had it?"
- Risk: "Do you use a case and screen protector? Ever cracked a screen or lost a phone?"

**Consult:**
- XMC pitch with benefits (unlimited screen repair, loss/theft, early upgrade)
- Pricing table by device value tier ($9-$19/mo)
- AppleCare comparison (loss/theft, deductibles, repair locations, BYOD, early upgrade)
- Cost anchoring (repair costs vs monthly premium)

**Overcome (3 objections):**
1. "I already have AppleCare" (side-by-side comparison, loss/theft gap)
2. "I don't need insurance — I'm careful" (accidents happen, cost of one incident)
3. "It's too expensive" (cost vs replacement math)

**Review:**
- Enrollment confirmation (coverage starts today)
- Claims process (Xfinity store, app, or phone)
- Closing compliance

---

## Pricing Data (April 2026)

### WiFi Deals (all include Gateway, unlimited data, Advanced Security, included XM line)
| Tier | 5Y (APPD) | 5Y (no APPD) | 1Y (APPD) | 1Y (no APPD) |
|------|-----------|--------------|-----------|--------------|
| 300M | $45 | $55 | $40 | $50 |
| 500M | $60 | $70 | $50 | $60 |
| 1G | $70 | $80 | $60 | $70 |
| 1.2G | $100 | $110 | $90 | $100 |

1 Gig and 1.2 Gig tiers include Disney+, Hulu, Peacock Premium (36 months).

### Xfinity Mobile
| Lines | Unlimited | Premium Unlimited |
|-------|----------|-------------------|
| 1 | $40 | $50 |
| 2 | $60 | $80 |
| 3 | $80 | $110 |
| 4 | $100 | $140 |

Included line: $0/mo for 12 months on 300 Mbps+ Internet.

### XMC
| Device MSRP | Monthly |
|-------------|---------|
| $0–$300.99 | $9 |
| $301–$949.99 | $15 |
| $950–$1,194.99 | $17 |
| $1,195+ | $19 |

### StreamSaver Bundles
| Bundle | Price |
|--------|-------|
| Peacock + Disney+ + Hulu | $15 |
| Peacock + Netflix + Apple TV | $18 |
| Peacock + Netflix + HBO Max | $22 |
| Peacock + Apple TV + HBO Max | $22 |
| Peacock + Netflix + Disney+ + Hulu | $22 |
| Peacock + Netflix + Apple TV + HBO Max | $30 |
| Peacock + Netflix + Disney+ + Hulu + HBO Max | $30 |
| Peacock + Netflix + Apple TV + Disney+ + Hulu | $30 |

### Mobile Promos (most through 4/21/26)
- Included Unlimited line $0/mo for 12 months ($480 value)
- Waived $25 activation fee (through 4/21)
- iPhone 17e on us with trade-in (Premium Unlimited)
- Up to $1,100 off Samsung with trade-in (Premium Unlimited)
- Up to $830 off Apple/Google/Motorola with trade-in
- $400 off iPhone 17e no trade-in (Premium Unlimited, port required)

---

## File Delivery

All 5 HTML files placed in a new `scripts/` directory at project root:
```
scripts/
  script-nonsub.html
  script-localizers.html
  script-xm-likely.html
  script-add-a-line.html
  script-xmc.html
```

Each file is self-contained HTML that can be pasted directly into FCKeditor or loaded by the dialer system.
