const pptxgen = require('pptxgenjs');

// ── Color palette ──
const DARK = '0F172A';
const DARK2 = '1E293B';
const WHITE = 'FFFFFF';
const GRAY = '64748B';
const LIGHT_BG = 'F8FAFC';
const BORDER = 'E2E8F0';

const DAY_COLORS = {
  1: { primary: '6366F1', light: 'EEF2FF', accent: '818CF8' },
  2: { primary: '8B5CF6', light: 'F5F3FF', accent: 'A78BFA' },
  3: { primary: '0891B2', light: 'ECFEFF', accent: '22D3EE' },
  4: { primary: 'DC2626', light: 'FEF2F2', accent: 'F87171' },
  5: { primary: '059669', light: 'F0FDF4', accent: '34D399' },
};

const AMBER = 'F59E0B';
const GREEN = '22C55E';
const RED = 'EF4444';

// ── Helper functions ──
function addSlide(pres, opts = {}) {
  return pres.addSlide({ masterName: opts.master || undefined });
}

function titleBar(slide, text, day, subtext) {
  const c = DAY_COLORS[day];
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.1, fill: { color: c.primary } });
  slide.addText(text, { x: 0.5, y: 0.15, w: 8, h: 0.45, fontSize: 24, bold: true, color: WHITE, fontFace: 'Segoe UI' });
  if (subtext) {
    slide.addText(subtext, { x: 0.5, y: 0.6, w: 8, h: 0.3, fontSize: 13, color: WHITE, fontFace: 'Segoe UI', italic: true });
  }
  // Day badge
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.5, y: 0.2, w: 1.2, h: 0.65, fill: { color: 'FFFFFF', transparency: 20 }, rectRadius: 0.1 });
  slide.addText(`Day ${day}`, { x: 8.5, y: 0.2, w: 1.2, h: 0.65, fontSize: 18, bold: true, color: WHITE, fontFace: 'Segoe UI', align: 'center', valign: 'middle' });
}

function sectionHeader(slide, text, y, color) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y, w: 9.2, h: 0.38, fill: { color }, rectRadius: 0.05 });
  slide.addText(text, { x: 0.6, y, w: 9, h: 0.38, fontSize: 11, bold: true, color: WHITE, fontFace: 'Segoe UI', valign: 'middle' });
}

function bulletSlide(slide, items, startY, opts = {}) {
  const fontSize = opts.fontSize || 12;
  const color = opts.color || '1E293B';
  const x = opts.x || 0.6;
  const w = opts.w || (10 - x - 0.4);
  const textItems = items.map(item => ({
    text: item,
    options: { fontSize, color, fontFace: 'Segoe UI', bullet: { type: 'bullet' }, breakLine: true, lineSpacing: 22 }
  }));
  slide.addText(textItems, { x, y: startY, w, h: opts.h || (items.length * 0.35 + 0.2), valign: 'top' });
}

function noteBox(slide, text, y, opts = {}) {
  const bgColor = opts.bg || 'FEF3C7';
  const borderColor = opts.border || 'FCD34D';
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y, w: 9, h: opts.h || 0.6, fill: { color: bgColor }, line: { color: borderColor, width: 1 }, rectRadius: 0.08 });
  slide.addText(text, { x: 0.7, y, w: 8.6, h: opts.h || 0.6, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI', valign: 'middle' });
}

function scriptBox(slide, text, y, w, h) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y, w: w || 9, h: h || 0.7, fill: { color: 'F0F9FF' }, line: { color: 'BAE6FD', width: 1 }, rectRadius: 0.08 });
  slide.addText(text, { x: 0.7, y, w: (w || 9) - 0.4, h: h || 0.7, fontSize: 11, italic: true, color: '0C4A6E', fontFace: 'Segoe UI', valign: 'middle' });
}

function footerText(slide, text) {
  slide.addText(text, { x: 0, y: 7.2, w: '100%', h: 0.3, fontSize: 7.5, color: GRAY, fontFace: 'Segoe UI', align: 'center' });
}

// ══════════════════════════════════════════════════════════
// BUILD AGENT-FACING DECK
// ══════════════════════════════════════════════════════════
let pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Performance Analytics';
pres.subject = 'Catalyst Coaching Bootcamp';

// ── Cover slide ──
let s = addSlide(pres);
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: DARK } });
s.addText('Catalyst Coaching\nBootcamp', { x: 1, y: 1.5, w: 8, h: 1.8, fontSize: 40, bold: true, color: WHITE, fontFace: 'Segoe UI', lineSpacing: 48 });
s.addShape(pres.shapes.RECTANGLE, { x: 1, y: 3.5, w: 2, h: 0.06, fill: { color: '818CF8' } });
s.addText('5-Day Intensive  |  DR Site', { x: 1, y: 3.7, w: 8, h: 0.5, fontSize: 18, color: '94A3B8', fontFace: 'Segoe UI' });
s.addText('Xfinity Outbound Telesales\nCompass Navigator  |  Catalyst Quality Behaviors\n\nMarch 2026', { x: 1, y: 4.5, w: 8, h: 1.5, fontSize: 13, color: '64748B', fontFace: 'Segoe UI', lineSpacing: 22 });

// ══════════════════════════════════════════════════════════
// DAY 1 - POSITIVE INTRODUCTION
// ══════════════════════════════════════════════════════════
s = addSlide(pres);
titleBar(s, 'The Power of the First 30 Seconds', 1, 'Positive Introduction');
s.addText('Why This Matters', { x: 0.5, y: 1.3, w: 9, h: 0.35, fontSize: 16, bold: true, color: '1E293B', fontFace: 'Segoe UI' });
s.addText('Outbound telesales is an interruption. The customer didn\'t ask for this call. You have 30 seconds to earn their willingness to stay on the line. The opening isn\'t just a formality. It\'s where trust is built or lost.', { x: 0.5, y: 1.7, w: 9, h: 0.7, fontSize: 12, color: '475569', fontFace: 'Segoe UI', lineSpacing: 20 });

sectionHeader(s, '  What "Effectively Demonstrated" Looks Like', 2.5, DAY_COLORS[1].primary);
bulletSlide(s, [
  'Genuine warmth - the customer hears a smile, not a script',
  'Natural pace - not rushed, not robotic',
  'Personal connection - find the window between getting their name and the pitch',
  'Pre-call prep (existing customers) - using the customer\'s name early shows you reviewed the account',
  'Recording disclosure delivered naturally before any discovery questions',
], 2.95, { h: 2.2 });

scriptBox(s, '"Hello! My name is [First Last], and I\'m calling from Xfinity. May I speak with [Customer Name]?"\n[Confirm identity, ask how their day is going]\n"Before we continue, I need to inform you that the call is being recorded and monitored..."', 5.3, 9, 1);

noteBox(s, 'Catalyst Behaviors:  Engage Actively  +  Own It  -  Warmth + competence from the first word.', 6.5, { h: 0.45, bg: 'EEF2FF', border: '818CF8' });
footerText(s, 'Catalyst Coaching Bootcamp  |  DR Site  |  Day 1 of 5  |  March 2026');

// Day 1 - DND vs ED comparison
s = addSlide(pres);
titleBar(s, 'The Power of the First 30 Seconds', 1, 'What to Avoid vs. What to Do');

// Bad side
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.3, w: 4.4, h: 3.5, fill: { color: 'FEF2F2' }, line: { color: 'FECACA', width: 1 }, rectRadius: 0.1 });
s.addText('Did Not Demonstrate', { x: 0.6, y: 1.4, w: 4, h: 0.35, fontSize: 11, bold: true, color: '991B1B', fontFace: 'Segoe UI' });
bulletSlide(s, [
  'Robotic, memorized delivery',
  'Flat tone with no warmth',
  'Jumping straight from "Nice to meet you" into the pitch',
  'Recording disclosure skipped or delivered after discovery',
  'No personalization at all',
], 1.85, { h: 2.8, color: '7F1D1D', fontSize: 11, x: 0.6, w: 4 });

// Good side
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.2, y: 1.3, w: 4.4, h: 3.5, fill: { color: 'F0FDF4' }, line: { color: 'BBF7D0', width: 1 }, rectRadius: 0.1 });
s.addText('Effectively Demonstrated', { x: 5.4, y: 1.4, w: 4, h: 0.35, fontSize: 11, bold: true, color: '166534', fontFace: 'Segoe UI' });
bulletSlide(s, [
  'Sounds like a real person, not reading',
  'Pauses to let the customer respond',
  '"I see you\'ve been with us for 3 years - that\'s awesome!"',
  'Recording disclosure feels natural, not rushed',
  'Customer feels welcomed, not processed',
], 1.85, { h: 2.8, color: '14532D', fontSize: 11, x: 5.4, w: 4 });

s.addText('Common Pitfalls', { x: 0.5, y: 5.1, w: 9, h: 0.3, fontSize: 14, bold: true, color: '1E293B', fontFace: 'Segoe UI' });
bulletSlide(s, [
  'Sounded scripted - delivery feels memorized',
  'Rapid pace - customer had to work to keep up',
  'Moved directly from "Nice to meet you" into the pitch with no pause for personal connection',
  'Customer name not used in opening (existing customer)',
], 5.45, { h: 1.6, fontSize: 11 });

footerText(s, 'Catalyst Coaching Bootcamp  |  DR Site  |  Day 1 of 5  |  March 2026');

// ══════════════════════════════════════════════════════════
// DAY 2 - DISCOVERING WITH INTENT
// ══════════════════════════════════════════════════════════
s = addSlide(pres);
titleBar(s, 'Discovering with Intent', 2, 'Qualitative vs. Quantitative');
s.addText('Why This Matters', { x: 0.5, y: 1.3, w: 9, h: 0.35, fontSize: 16, bold: true, color: '1E293B', fontFace: 'Segoe UI' });
s.addText('Discovery is the agent asking questions, not the customer asking you. It\'s the foundation of the entire pitch. A generic pitch happens because of generic discovery. A tailored pitch that closes happens because you uncovered something real.', { x: 0.5, y: 1.7, w: 9, h: 0.7, fontSize: 12, color: '475569', fontFace: 'Segoe UI', lineSpacing: 20 });

sectionHeader(s, '  The 4 Pillars of Discovery', 2.5, DAY_COLORS[2].primary);

// 4 pillar boxes
const pillars = [
  { title: 'Users', desc: 'Who lives in the home?', q: '"Who all is in the household using WiFi or devices?"', x: 0.4 },
  { title: 'Usage', desc: 'How do they use services?', q: '"Walk me through a typical evening online."', x: 2.65 },
  { title: 'Devices', desc: 'What are they connecting?', q: '"How many devices are connected at once?"', x: 4.9 },
  { title: 'Cost', desc: 'What matters financially?', q: '"What are you paying for Internet and phone combined?"', x: 7.15 },
];
pillars.forEach(p => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: p.x, y: 3.0, w: 2.1, h: 2.2, fill: { color: DAY_COLORS[2].light }, line: { color: DAY_COLORS[2].accent, width: 1 }, rectRadius: 0.1 });
  s.addText(p.title, { x: p.x, y: 3.1, w: 2.1, h: 0.35, fontSize: 14, bold: true, color: DAY_COLORS[2].primary, fontFace: 'Segoe UI', align: 'center' });
  s.addText(p.desc, { x: p.x + 0.1, y: 3.5, w: 1.9, h: 0.3, fontSize: 10, color: '475569', fontFace: 'Segoe UI', align: 'center' });
  s.addText(p.q, { x: p.x + 0.1, y: 3.95, w: 1.9, h: 1, fontSize: 9.5, italic: true, color: '0C4A6E', fontFace: 'Segoe UI', align: 'center', valign: 'top' });
});

noteBox(s, 'Key Rule: One great open-ended question that yields a full picture of the household is worth more than five closed questions that return one-word answers.', 5.4, { h: 0.55, bg: 'FFFBEB', border: 'FCD34D' });

noteBox(s, 'Catalyst Behavior:  Discover Needs  -  Ask proactive, relevant questions that reveal something new.', 6.15, { h: 0.45, bg: 'F5F3FF', border: 'A78BFA' });

footerText(s, 'Catalyst Coaching Bootcamp  |  DR Site  |  Day 2 of 5  |  March 2026');

// Day 2 - Qualitative vs Quantitative
s = addSlide(pres);
titleBar(s, 'Discovering with Intent', 2, 'Qualitative vs. Quantitative');

s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.3, w: 4.4, h: 3.2, fill: { color: 'FEF2F2' }, line: { color: 'FECACA', width: 1 }, rectRadius: 0.1 });
s.addText('Quantitative (Closed Questions)', { x: 0.6, y: 1.4, w: 4, h: 0.35, fontSize: 11, bold: true, color: '991B1B', fontFace: 'Segoe UI' });
s.addText('"Do you have WiFi?" - "Yes."\n"Do you stream?" - "Yes."\n"Do you have a phone?" - "Yes."', { x: 0.7, y: 1.85, w: 3.9, h: 1, fontSize: 11, color: '7F1D1D', fontFace: 'Segoe UI', lineSpacing: 20 });
s.addText('Result: Three questions, zero insight. You know nothing you didn\'t already know. The pitch that follows will be generic.', { x: 0.7, y: 2.9, w: 3.9, h: 0.8, fontSize: 10, italic: true, color: '991B1B', fontFace: 'Segoe UI', lineSpacing: 18 });

s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.2, y: 1.3, w: 4.4, h: 3.2, fill: { color: 'F0FDF4' }, line: { color: 'BBF7D0', width: 1 }, rectRadius: 0.1 });
s.addText('Qualitative (Open-Ended Questions)', { x: 5.4, y: 1.4, w: 4, h: 0.35, fontSize: 11, bold: true, color: '166534', fontFace: 'Segoe UI' });
s.addText('"Tell me about your household. Who\'s home during the day and what are they usually doing online?"', { x: 5.5, y: 1.85, w: 3.9, h: 0.8, fontSize: 11, color: '14532D', fontFace: 'Segoe UI', lineSpacing: 20 });
s.addText('Result: One question uncovers 3 pillars - Users, Usage, Devices. Now you can pitch with specificity: "Since your daughter is doing virtual school and your husband works from home..."', { x: 5.5, y: 2.7, w: 3.9, h: 1, fontSize: 10, italic: true, color: '166534', fontFace: 'Segoe UI', lineSpacing: 18 });

s.addText('Remember: Discovery is the AGENT asking proactive questions about Users, Usage, Devices, and Cost.\nQuestions the customer asks you do NOT count as discovery.', { x: 0.5, y: 4.8, w: 9, h: 0.7, fontSize: 12, bold: true, color: DAY_COLORS[2].primary, fontFace: 'Segoe UI', lineSpacing: 22 });

footerText(s, 'Catalyst Coaching Bootcamp  |  DR Site  |  Day 2 of 5  |  March 2026');

// ══════════════════════════════════════════════════════════
// DAY 3 - LINKING & AMBASSADOR
// ══════════════════════════════════════════════════════════
s = addSlide(pres);
titleBar(s, 'Linking & Being the Ambassador', 3, 'From Discovery to Recommendation');
s.addText('Why This Matters', { x: 0.5, y: 1.3, w: 9, h: 0.35, fontSize: 16, bold: true, color: '1E293B', fontFace: 'Segoe UI' });
s.addText('Discovery without a tailored pitch is wasted effort. Being an Ambassador means you don\'t just list features. You connect them to what the customer told you. The customer should hear their own words reflected back in your recommendation.', { x: 0.5, y: 1.7, w: 9, h: 0.7, fontSize: 12, color: '475569', fontFace: 'Segoe UI', lineSpacing: 20 });

sectionHeader(s, '  The Logic Bridge', 2.5, DAY_COLORS[3].primary);
scriptBox(s, '"Based on what you told me, I think I have the perfect plan for you..."\n\n"I heard you say [what they told you], so I included [product] because [specific benefit for their household]."', 2.95, 9, 1.1);

// Bad vs Good
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 4.3, w: 4.4, h: 1.8, fill: { color: 'FEF2F2' }, line: { color: 'FECACA', width: 1 }, rectRadius: 0.1 });
s.addText('Feature List (DND)', { x: 0.6, y: 4.4, w: 4, h: 0.3, fontSize: 10, bold: true, color: '991B1B', fontFace: 'Segoe UI' });
s.addText('"Our 1 Gig plan comes with unlimited data, a gateway, WiFi hotspot access, and Advanced Security. It\'s $60 a month with auto-pay."', { x: 0.7, y: 4.7, w: 3.9, h: 0.8, fontSize: 10, italic: true, color: '7F1D1D', fontFace: 'Segoe UI', lineSpacing: 18 });
s.addText('Generic. Could be said to any customer.', { x: 0.7, y: 5.5, w: 3.9, h: 0.3, fontSize: 9, color: '991B1B', fontFace: 'Segoe UI' });

s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.2, y: 4.3, w: 4.4, h: 1.8, fill: { color: 'F0FDF4' }, line: { color: 'BBF7D0', width: 1 }, rectRadius: 0.1 });
s.addText('Tailored Recommendation (ED)', { x: 5.4, y: 4.4, w: 4, h: 0.3, fontSize: 10, bold: true, color: '166534', fontFace: 'Segoe UI' });
s.addText('"You mentioned your husband works from home and your kids stream constantly, so I\'m recommending 1 Gig because your whole household can be online without lagging. And you said you\'re paying $80 now - this brings you to $60."', { x: 5.5, y: 4.7, w: 3.9, h: 1, fontSize: 10, italic: true, color: '14532D', fontFace: 'Segoe UI', lineSpacing: 18 });
s.addText('Personal. References their household. Explains why.', { x: 5.5, y: 5.7, w: 3.9, h: 0.3, fontSize: 9, color: '166534', fontFace: 'Segoe UI' });

noteBox(s, 'Compliance: Reference broadband labels on every Internet/Mobile offer: "You can also see this information at Xfinity.com/labels."', 6.35, { h: 0.45, bg: 'ECFEFF', border: '22D3EE' });
footerText(s, 'Catalyst Coaching Bootcamp  |  DR Site  |  Day 3 of 5  |  March 2026');

// ══════════════════════════════════════════════════════════
// DAY 4 - OBJECTIONS
// ══════════════════════════════════════════════════════════
s = addSlide(pres);
titleBar(s, 'Objections & Overcoming Them', 4, 'The 4-Step Framework');
s.addText('An objection is not a rejection. It\'s the customer telling you they need more information.', { x: 0.5, y: 1.3, w: 9, h: 0.4, fontSize: 14, bold: true, color: '1E293B', fontFace: 'Segoe UI' });

// 4 steps
const steps = [
  { num: '1', title: 'Understand', desc: 'Don\'t assume. Probe.', script: '"What specifically concerns you about that?"', color: 'FEF2F2', border: 'FECACA' },
  { num: '2', title: 'Empathize & Overcome', desc: 'Show you heard them, then pivot.', script: '"I completely understand that, however..."', color: 'FFFBEB', border: 'FDE68A' },
  { num: '3', title: 'Restate Tie-Backs', desc: 'Anchor to what they told you.', script: '"I heard you say [X], so I wanted to make sure..."', color: 'F0FDF4', border: 'BBF7D0' },
  { num: '4', title: 'Add Value', desc: 'One new benefit they haven\'t heard.', script: '"On top of that, this also includes [benefit]..."', color: 'EFF6FF', border: 'BFDBFE' },
];
steps.forEach((st, i) => {
  const y = 1.9 + i * 1.15;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y, w: 9.2, h: 1, fill: { color: st.color }, line: { color: st.border, width: 1 }, rectRadius: 0.08 });
  s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.2, w: 0.55, h: 0.55, fill: { color: DAY_COLORS[4].primary } });
  s.addText(st.num, { x: 0.6, y: y + 0.2, w: 0.55, h: 0.55, fontSize: 16, bold: true, color: WHITE, fontFace: 'Segoe UI', align: 'center', valign: 'middle' });
  s.addText(st.title, { x: 1.35, y: y + 0.08, w: 3, h: 0.3, fontSize: 13, bold: true, color: '1E293B', fontFace: 'Segoe UI' });
  s.addText(st.desc, { x: 1.35, y: y + 0.4, w: 3, h: 0.3, fontSize: 10, color: '475569', fontFace: 'Segoe UI' });
  s.addText(st.script, { x: 4.8, y: y + 0.15, w: 4.5, h: 0.65, fontSize: 10.5, italic: true, color: '0C4A6E', fontFace: 'Segoe UI', valign: 'middle' });
});

noteBox(s, 'Critical: Never speak negatively about competitors. "Our service is 99.9% reliable" is fine. "AT&T is terrible" is a red flag (auto-fail).', 6.4, { h: 0.45, bg: 'FEF2F2', border: 'F87171' });
footerText(s, 'Catalyst Coaching Bootcamp  |  DR Site  |  Day 4 of 5  |  March 2026');

// Day 4 - Common objections
s = addSlide(pres);
titleBar(s, 'Objections & Overcoming Them', 4, 'Common Objections');

const objections = [
  { obj: '"I need to think about it"', respond: 'Understand: "Absolutely. What part are you thinking over?"\nIf price: Reframe value per day. "$60/mo is $2/day for your whole household."' },
  { obj: '"Too expensive"', respond: 'Empathize: "I completely understand budget is important."\nRestate: "You mentioned you\'re paying $80 now. This actually saves you $20/month."' },
  { obj: '"I\'m under contract"', respond: 'Understand: "When does your contract end?"\nValue: "Even with an ETF, the savings over 12 months often exceed the fee."' },
  { obj: '"Not interested"', respond: 'Probe: "Is it the product itself, or is this just not a good time?"\nIf timing: Respect it, but plant the seed with one benefit they\'ll remember.' },
];
objections.forEach((o, i) => {
  const y = 1.3 + i * 1.35;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y, w: 9.2, h: 1.2, fill: { color: i % 2 === 0 ? 'FEF2F2' : LIGHT_BG }, line: { color: BORDER, width: 0.5 }, rectRadius: 0.08 });
  s.addText(o.obj, { x: 0.6, y: y + 0.05, w: 2.5, h: 1.1, fontSize: 13, bold: true, color: DAY_COLORS[4].primary, fontFace: 'Segoe UI', valign: 'middle' });
  s.addText(o.respond, { x: 3.3, y: y + 0.05, w: 6, h: 1.1, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI', valign: 'middle', lineSpacing: 18 });
});

s.addText('Always re-close after overcoming. Don\'t leave the sale hanging. Ask again with confidence.', { x: 0.5, y: 6.7, w: 9, h: 0.35, fontSize: 12, bold: true, color: DAY_COLORS[4].primary, fontFace: 'Segoe UI' });
footerText(s, 'Catalyst Coaching Bootcamp  |  DR Site  |  Day 4 of 5  |  March 2026');

// ══════════════════════════════════════════════════════════
// DAY 5 - PUTTING IT ALL TOGETHER
// ══════════════════════════════════════════════════════════
s = addSlide(pres);
titleBar(s, 'Putting It All Together', 5, 'Full Call Flow Mastery');

// Compass Navigator flow
const phases = [
  { name: 'Connect', items: 'Greeting\nAgenda\nDisclosure', color: 'FB923C', bg: 'FFF7ED' },
  { name: 'Explore', items: 'Users\nUsage\nDevices | Cost', color: 'A78BFA', bg: 'FAF5FF' },
  { name: 'Consult', items: 'Tie-backs\nRecommendation\nLabels', color: '4ADE80', bg: 'F0FDF4' },
  { name: 'Overcome', items: 'Understand\nEmpathize\nRestate | Value', color: 'FB7185', bg: 'FFF1F2' },
  { name: 'Review', items: 'Reaffirm\nSummarize\nClose', color: '2DD4BF', bg: 'F0FDFA' },
];
phases.forEach((p, i) => {
  const x = 0.3 + i * 1.9;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.3, w: 1.75, h: 1.8, fill: { color: p.bg }, line: { color: p.color, width: 1.5 }, rectRadius: 0.1 });
  s.addText(p.name, { x, y: 1.4, w: 1.75, h: 0.4, fontSize: 13, bold: true, color: p.color, fontFace: 'Segoe UI', align: 'center' });
  s.addText(p.items, { x, y: 1.85, w: 1.75, h: 1, fontSize: 10, color: '475569', fontFace: 'Segoe UI', align: 'center', lineSpacing: 17 });
});

// Week recap
sectionHeader(s, '  This Week\'s Journey', 3.4, DAY_COLORS[5].primary);
const recap = [
  { day: 'Day 1', topic: 'First 30 seconds. Smile, name, connection, disclosure.', color: DAY_COLORS[1].primary },
  { day: 'Day 2', topic: 'Discovery. Open-ended. 4 pillars. Conversation, not interrogation.', color: DAY_COLORS[2].primary },
  { day: 'Day 3', topic: 'Linking. Tie-backs. "Because." Benefits over features.', color: DAY_COLORS[3].primary },
  { day: 'Day 4', topic: 'Objections. Understand first. Empathize. Restate. Add value. Re-close.', color: DAY_COLORS[4].primary },
];
recap.forEach((r, i) => {
  const y = 3.9 + i * 0.45;
  s.addText(r.day, { x: 0.6, y, w: 0.8, h: 0.35, fontSize: 11, bold: true, color: r.color, fontFace: 'Segoe UI' });
  s.addText(r.topic, { x: 1.5, y, w: 8, h: 0.35, fontSize: 11, color: '475569', fontFace: 'Segoe UI' });
});

// 6 behaviors
sectionHeader(s, '  The 6 Catalyst Behaviors - Self Check', 5.8, DAY_COLORS[5].primary);
const behaviors = [
  { name: 'Engage Actively', q: 'Conversation or transaction?', color: '0891B2', bg: 'CFFAFE' },
  { name: 'Own It', q: 'Expertise + keeping them informed?', color: '1D4ED8', bg: 'DBEAFE' },
  { name: 'Make It Effortless', q: 'Digestible pieces?', color: 'D97706', bg: 'FEF3C7' },
  { name: 'Discover Needs', q: 'Questions that reveal something?', color: '7C3AED', bg: 'EDE9FE' },
  { name: 'Be an Ambassador', q: 'Products to this life?', color: '16A34A', bg: 'DCFCE7' },
  { name: 'Show Appreciation', q: 'Valued, not processed?', color: 'BE185D', bg: 'FCE7F3' },
];
behaviors.forEach((b, i) => {
  const x = 0.3 + i * 1.6;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 6.25, w: 1.5, h: 0.85, fill: { color: b.bg }, rectRadius: 0.06 });
  s.addText(b.name, { x, y: 6.28, w: 1.5, h: 0.35, fontSize: 8.5, bold: true, color: b.color, fontFace: 'Segoe UI', align: 'center' });
  s.addText(b.q, { x, y: 6.6, w: 1.5, h: 0.4, fontSize: 7.5, color: '475569', fontFace: 'Segoe UI', align: 'center' });
});

footerText(s, 'Catalyst Coaching Bootcamp  |  DR Site  |  Day 5 of 5  |  March 2026');

// Save agent deck
pres.writeFile({ fileName: 'C:/Users/Josh Edgecomb/Documents/Claude/Auto QA Form/Catalyst_Bootcamp_Agent_Deck_v2.pptx' })
  .then(() => console.log('Agent deck saved.'))
  .catch(e => console.error('Agent deck error:', e));
