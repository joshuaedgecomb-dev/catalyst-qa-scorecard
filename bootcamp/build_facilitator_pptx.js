const pptxgen = require('pptxgenjs');

const WHITE = 'FFFFFF';
const DARK = '0F172A';
const GRAY = '64748B';
const LIGHT = 'F8FAFC';

const DC = {
  1: { p: '6366F1', l: 'EEF2FF', a: '818CF8' },
  2: { p: '8B5CF6', l: 'F5F3FF', a: 'A78BFA' },
  3: { p: '0891B2', l: 'ECFEFF', a: '22D3EE' },
  4: { p: 'DC2626', l: 'FEF2F2', a: 'F87171' },
  5: { p: '059669', l: 'F0FDF4', a: '34D399' },
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Performance Analytics';

function hdr(slide, text, day, sub) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 1.05, fill: { color: DC[day].p } });
  slide.addText(text, { x: 0.5, y: 0.12, w: 7.5, h: 0.4, fontSize: 22, bold: true, color: WHITE, fontFace: 'Segoe UI' });
  if (sub) slide.addText(sub, { x: 0.5, y: 0.55, w: 7.5, h: 0.28, fontSize: 12, color: WHITE, fontFace: 'Segoe UI', italic: true });
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.5, y: 0.15, w: 1.2, h: 0.6, fill: { color: 'FFFFFF', transparency: 20 }, rectRadius: 0.08 });
  slide.addText(`Day ${day}`, { x: 8.5, y: 0.15, w: 1.2, h: 0.6, fontSize: 16, bold: true, color: WHITE, fontFace: 'Segoe UI', align: 'center', valign: 'middle' });
  // Confidential tag
  slide.addText('FACILITATOR GUIDE - CONFIDENTIAL', { x: 0, y: 0.82, w: '100%', h: 0.2, fontSize: 7, bold: true, color: 'FBBF24', fontFace: 'Segoe UI', align: 'center', letterSpacing: 2 });
}

function secBar(slide, text, y, color) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.35, y, w: 9.3, h: 0.35, fill: { color }, rectRadius: 0.05 });
  slide.addText(text, { x: 0.55, y, w: 9, h: 0.35, fontSize: 10, bold: true, color: WHITE, fontFace: 'Segoe UI', valign: 'middle' });
}

function tipBox(slide, text, y, h) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y, w: 9.2, h: h || 0.55, fill: { color: 'FEF3C7' }, line: { color: 'FCD34D', width: 1 }, rectRadius: 0.08 });
  slide.addText(text, { x: 0.6, y, w: 8.8, h: h || 0.55, fontSize: 10, color: '92400E', fontFace: 'Segoe UI', valign: 'middle' });
}

function ft(slide) {
  slide.addText('Facilitator Guide - Confidential - Catalyst Coaching Bootcamp - DR Site - March 2026', { x: 0, y: 7.2, w: '100%', h: 0.3, fontSize: 7, color: GRAY, fontFace: 'Segoe UI', align: 'center' });
}

function runItem(text, timing) {
  return [
    { text: timing ? `[${timing}]  ` : '', options: { fontSize: 10, bold: true, color: '3730A3', fontFace: 'Segoe UI' } },
    { text, options: { fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  ];
}

// ── COVER ──
let s = pres.addSlide();
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: '1E1B4B' } });
s.addText('Facilitator Guide', { x: 1, y: 1.5, w: 8, h: 0.8, fontSize: 38, bold: true, color: WHITE, fontFace: 'Segoe UI' });
s.addText('Catalyst Coaching Bootcamp', { x: 1, y: 2.3, w: 8, h: 0.6, fontSize: 20, color: 'C7D2FE', fontFace: 'Segoe UI' });
s.addText('CONFIDENTIAL - LEADERSHIP ONLY', { x: 1, y: 3, w: 8, h: 0.4, fontSize: 11, bold: true, color: 'FBBF24', fontFace: 'Segoe UI', letterSpacing: 3 });
s.addShape(pres.shapes.RECTANGLE, { x: 1, y: 3.6, w: 1.8, h: 0.05, fill: { color: 'FBBF24' } });
s.addText('5-Day Intensive  |  DR Site\nXfinity Outbound Telesales\n\nStructure per Day:\n   30-min Morning Huddle (high energy)\n   Midday Floor Walk + Coaching\n   15-min Afternoon Focus Session\n\nPrepared by Performance Analytics\nMarch 2026', { x: 1, y: 3.9, w: 8, h: 2.5, fontSize: 12, color: 'A5B4FC', fontFace: 'Segoe UI', lineSpacing: 20 });

// ══════════════════════════════════════════════════════════
// DAY 1
// ══════════════════════════════════════════════════════════

// Morning run of show
s = pres.addSlide();
hdr(s, 'The Power of the First 30 Seconds', 1, 'Morning Huddle - Run of Show');
const d1run = [
  { t: 'Open with energy. Stand up, music playing as agents walk in. Set the tone.', m: '2 min' },
  { t: 'Frame the week. "5-day bootcamp. Morning huddle, midday check-ins, afternoon debrief. By Friday, you own the Compass Navigator."', m: '3 min' },
  { t: 'Today\'s topic: The Opening. Why the first 30 seconds matter. Play a bad example (robotic) vs. good example (warm, natural). Ask: "Which agent would you stay on the line for?"', m: '8 min' },
  { t: 'Walk through the Compass Navigator opening script. Emphasize natural delivery. Point out the window for personal connection between name and reason for call.', m: '5 min' },
  { t: 'Existing customer bonus: using their name early shows prep. "I see you\'ve been with us for 3 years" is a power move.', m: '3 min' },
  { t: 'Recording disclosure: must happen before discovery. Practice saying it at a conversational pace.', m: '3 min' },
  { t: 'Preview the afternoon activity: "You\'re going to pair up and practice your opening."', m: '1 min' },
];
d1run.forEach((r, i) => {
  const y = 1.2 + i * 0.75;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.35, y, w: 0.55, h: 0.55, fill: { color: DC[1].l }, rectRadius: 0.06 });
  s.addText(`${i + 1}`, { x: 0.35, y, w: 0.55, h: 0.55, fontSize: 14, bold: true, color: DC[1].p, fontFace: 'Segoe UI', align: 'center', valign: 'middle' });
  s.addText(r.m, { x: 1, y, w: 0.7, h: 0.28, fontSize: 8.5, bold: true, color: '3730A3', fontFace: 'Segoe UI', valign: 'middle' });
  s.addText(r.t, { x: 1.75, y, w: 7.8, h: 0.65, fontSize: 10, color: '1E293B', fontFace: 'Segoe UI', valign: 'top', lineSpacing: 16 });
});
tipBox(s, 'Facilitator Tip: Don\'t lecture. Ask questions. "Who has had a customer hang up in the first 10 seconds? What happened?" Get them talking early.', 6.6, 0.5);
ft(s);

// Activity + Commitments
s = pres.addSlide();
hdr(s, 'The Power of the First 30 Seconds', 1, 'Activity + Floor Walk + Commitments');

secBar(s, '  ACTIVITY: The 30-Second Challenge', 1.15, DC[1].p);
s.addText([
  { text: 'Setup: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Pair up. One plays customer ("Hello?"), one plays agent. Full opening in 30 seconds. Stopwatch.\n', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Rules: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Must include a genuine personal connection (not just "How are you?"). Disclosure before 30s mark.\n', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Debrief: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: '"What felt different live vs. reading? What did your partner do that made you want to listen?"', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
], { x: 0.5, y: 1.6, w: 9, h: 1.3, lineSpacing: 20 });

secBar(s, '  MIDDAY FLOOR WALK - CHECKLIST', 3.1, '475569');
s.addText('[ ]  Is the greeting warm or robotic?\n[ ]  Is recording disclosure delivered before discovery?\n[ ]  Are agents using the customer\'s name on existing customer calls?\n[ ]  Is there a pause for personal connection or does it jump straight to pitch?', { x: 0.6, y: 3.55, w: 5, h: 1.3, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI', lineSpacing: 20 });
s.addText('Quick Coaching:\n- Flat tone? Have them stand up.\n- Disclosure rushed? Practice at half speed.\n- No connection? "Ask one non-scripted question next call."', { x: 5.5, y: 3.55, w: 4, h: 1.3, fontSize: 10, color: '475569', fontFace: 'Segoe UI', lineSpacing: 18 });

secBar(s, '  COMMITMENTS YOU\'RE LOOKING FOR', 5.1, '1D4ED8');
s.addText('1.  Smile before you dial. Tone changes when you smile. The customer hears it.\n2.  Use their name within the first 15 seconds on existing customer calls.\n3.  Pause after "How are you?" Actually listen. Respond before moving on.\n4.  Deliver the recording disclosure naturally. Practice until it sounds conversational.', { x: 0.6, y: 5.55, w: 8.8, h: 1.2, fontSize: 11, color: '1E293B', fontFace: 'Segoe UI', lineSpacing: 20 });

tipBox(s, 'Success Metric: By end of day, every agent delivers a warm, natural opening with disclosure in under 30 seconds without sounding scripted.', 6.85, 0.45);
ft(s);

// ══════════════════════════════════════════════════════════
// DAY 2
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
hdr(s, 'Discovering with Intent', 2, 'Morning Huddle - Run of Show');
const d2run = [
  { t: 'Day 1 callback. "Who recorded themselves this morning? How did it sound?"', m: '2 min' },
  { t: 'Frame today. "Yesterday was getting them to stay. Today is learning enough to make them want to buy." Discovery is the AGENT asking, not the customer.', m: '3 min' },
  { t: 'The 4 Pillars: Users, Usage, Devices, Cost. Walk through with example questions for each.', m: '8 min' },
  { t: 'Qualitative vs. Quantitative live demo. Two agents role-play in front of group. One asks only closed questions, the other open-ended. Ask: "Which agent learned more?"', m: '8 min' },
  { t: 'Key rule: One great open-ended question beats five closed ones. Discovery should feel like a conversation.', m: '2 min' },
  { t: 'Tie-backs preview: "Everything the customer tells you becomes ammunition for your pitch. Write it down."', m: '3 min' },
  { t: 'Preview the Discovery Bingo activity.', m: '2 min' },
];
d2run.forEach((r, i) => {
  const y = 1.2 + i * 0.75;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.35, y, w: 0.55, h: 0.55, fill: { color: DC[2].l }, rectRadius: 0.06 });
  s.addText(`${i + 1}`, { x: 0.35, y, w: 0.55, h: 0.55, fontSize: 14, bold: true, color: DC[2].p, fontFace: 'Segoe UI', align: 'center', valign: 'middle' });
  s.addText(r.m, { x: 1, y, w: 0.7, h: 0.28, fontSize: 8.5, bold: true, color: '3730A3', fontFace: 'Segoe UI', valign: 'middle' });
  s.addText(r.t, { x: 1.75, y, w: 7.8, h: 0.65, fontSize: 10, color: '1E293B', fontFace: 'Segoe UI', valign: 'top', lineSpacing: 16 });
});
tipBox(s, 'Facilitator Tip: Have two agents role-play discovery live. The contrast between closed and open questions sells the lesson better than any slide.', 6.6, 0.5);
ft(s);

s = pres.addSlide();
hdr(s, 'Discovering with Intent', 2, 'Activity + Floor Walk + Commitments');
secBar(s, '  ACTIVITY: Discovery Bingo', 1.15, DC[2].p);
s.addText([
  { text: 'Setup: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: '2x2 grid (Users/Usage/Devices/Cost). Pair up. Customer uses persona card. Agent has 3 min to fill all 4 boxes.\n', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Rules: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Open-ended questions only. If agent asks a closed question, customer calls it out and agent rephrases.\n', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Debrief: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: '"How many pillars did you cover? What was hardest? What question worked best?"', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
], { x: 0.5, y: 1.6, w: 9, h: 1.3, lineSpacing: 20 });

secBar(s, '  MIDDAY FLOOR WALK - CHECKLIST', 3.1, '475569');
s.addText('[ ]  Open-ended or closed questions?\n[ ]  All 4 pillars covered before pitch?\n[ ]  Tie-backs being noted?\n[ ]  Does discovery sound like conversation or intake form?', { x: 0.6, y: 3.55, w: 5, h: 1.2, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI', lineSpacing: 20 });
s.addText('Quick Coaching:\n- Jumps to pitch after one question?\n  "What else could you have asked?"\n- Sounds like a survey?\n  "React to what they say."', { x: 5.5, y: 3.55, w: 4, h: 1.2, fontSize: 10, color: '475569', fontFace: 'Segoe UI', lineSpacing: 18 });

secBar(s, '  COMMITMENTS YOU\'RE LOOKING FOR', 5.0, '1D4ED8');
s.addText('1.  Ask at least one open-ended question per pillar. Minimum: Users and Usage.\n2.  Listen for tie-backs. Write them down. You\'ll use them in the pitch.\n3.  Don\'t interrogate. Discovery is a conversation. React to what they say.\n4.  Never skip discovery. A pitch without discovery is a feature list.', { x: 0.6, y: 5.45, w: 8.8, h: 1.2, fontSize: 11, color: '1E293B', fontFace: 'Segoe UI', lineSpacing: 20 });

tipBox(s, 'Success Metric: By end of day, agents ask predominantly open-ended questions and cover at least 3 of 4 pillars before pitching.', 6.8, 0.45);
ft(s);

// ══════════════════════════════════════════════════════════
// DAY 3
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
hdr(s, 'Linking & Being the Ambassador', 3, 'Morning Huddle - Run of Show');
const d3run = [
  { t: 'Day 2 callback. "Did anyone get a customer to tell them a story yesterday?"', m: '2 min' },
  { t: 'Frame today. "Yesterday you uncovered needs. Today you USE what you uncovered. This is where discovery becomes a sale."', m: '3 min' },
  { t: 'The logic bridge: Every recommendation needs a "because." Live demo: take a fake profile, build the pitch using tie-backs in real time.', m: '8 min' },
  { t: 'Feature list vs. recommendation. Show both side by side. Generic vs. personalized. Ask: "Which pitch would you buy from?"', m: '5 min' },
  { t: 'Product confidence check. Quick quiz: What\'s included at each tier? What\'s the XM line promo worth? ($480) When do you mention broadband labels?', m: '5 min' },
  { t: 'Broadband labels compliance. Required on every Internet/Mobile offer. Practice weaving it in naturally.', m: '3 min' },
  { t: 'Preview the 60-Second Pitch Build activity.', m: '2 min' },
];
d3run.forEach((r, i) => {
  const y = 1.2 + i * 0.75;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.35, y, w: 0.55, h: 0.55, fill: { color: DC[3].l }, rectRadius: 0.06 });
  s.addText(`${i + 1}`, { x: 0.35, y, w: 0.55, h: 0.55, fontSize: 14, bold: true, color: DC[3].p, fontFace: 'Segoe UI', align: 'center', valign: 'middle' });
  s.addText(r.m, { x: 1, y, w: 0.7, h: 0.28, fontSize: 8.5, bold: true, color: '3730A3', fontFace: 'Segoe UI', valign: 'middle' });
  s.addText(r.t, { x: 1.75, y, w: 7.8, h: 0.65, fontSize: 10, color: '1E293B', fontFace: 'Segoe UI', valign: 'top', lineSpacing: 16 });
});
tipBox(s, 'Facilitator Tip: Take a fake customer profile and build the pitch live in front of the group, narrating your tie-backs as you go. Then ask an agent to do the same.', 6.6, 0.5);
ft(s);

s = pres.addSlide();
hdr(s, 'Linking & Being the Ambassador', 3, 'Activity + Floor Walk + Commitments');
secBar(s, '  ACTIVITY: 60-Second Pitch Build', 1.15, DC[3].p);
s.addText([
  { text: 'Setup: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Prepare 4-5 persona cards with discovery details pre-filled. Each agent draws one, has 60 seconds to deliver a pitch.\n', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Rules: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Must include "Based on what you told me..." and at least one "I heard you say..." Must reference broadband labels.\n', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Judging: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Group votes: Did it connect features to this customer? Would you buy? Was broadband labels natural?', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
], { x: 0.5, y: 1.6, w: 9, h: 1.3, lineSpacing: 20 });

secBar(s, '  MIDDAY FLOOR WALK - CHECKLIST', 3.1, '475569');
s.addText('[ ]  Tie-back language used? ("You mentioned...", "I heard you say...")\n[ ]  Pitch connects features to discovered needs?\n[ ]  Broadband labels referenced during pitch?\n[ ]  Right product for the household?', { x: 0.6, y: 3.55, w: 9, h: 1.2, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI', lineSpacing: 20 });

secBar(s, '  COMMITMENTS YOU\'RE LOOKING FOR', 5.0, '1D4ED8');
s.addText('1.  Never pitch without a "because." If you can\'t finish "I\'m recommending this because you said...", discover more.\n2.  Use the customer\'s exact words. "You mentioned..." is your most powerful phrase.\n3.  Lead with benefits, not features. "Your kids can stream without buffering" beats "unlimited data."\n4.  Reference broadband labels naturally. Practice weaving it in.', { x: 0.6, y: 5.45, w: 8.8, h: 1.2, fontSize: 11, color: '1E293B', fontFace: 'Segoe UI', lineSpacing: 20 });

tipBox(s, 'Success Metric: By end of day, agents use at least one tie-back per pitch and reference broadband labels on every Internet/Mobile offer.', 6.8, 0.45);
ft(s);

// ══════════════════════════════════════════════════════════
// DAY 4
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
hdr(s, 'Objections & Overcoming Them', 4, 'Morning Huddle - Run of Show');
const d4run = [
  { t: 'Day 3 callback. "Who started with \'Based on what you told me\' yesterday? How did the customer react?"', m: '2 min' },
  { t: 'Frame today. "An objection is NOT a rejection. It\'s the customer saying they need more info. Top closers aren\'t the ones who never hear no. They know what to do when they hear it."', m: '3 min' },
  { t: 'The 4-Step Framework. Walk through each with live demo: facilitator plays customer, agent walks all 4 steps.\n1) Understand  2) Empathize & Overcome  3) Restate Tie-Backs  4) Add Value', m: '12 min' },
  { t: 'Common objections: "I\'ll think about it", "Too expensive", "Under contract", "Not interested". Walk through response strategies.', m: '6 min' },
  { t: 'Critical rule: Never speak negatively about competitors. That\'s a red flag (auto-fail on QA).', m: '2 min' },
  { t: 'The re-close: After overcoming, you MUST ask again. Don\'t leave the sale hanging.', m: '3 min' },
];
d4run.forEach((r, i) => {
  const y = 1.2 + i * 0.85;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.35, y, w: 0.55, h: 0.55, fill: { color: DC[4].l }, rectRadius: 0.06 });
  s.addText(`${i + 1}`, { x: 0.35, y, w: 0.55, h: 0.55, fontSize: 14, bold: true, color: DC[4].p, fontFace: 'Segoe UI', align: 'center', valign: 'middle' });
  s.addText(r.m, { x: 1, y, w: 0.7, h: 0.28, fontSize: 8.5, bold: true, color: '3730A3', fontFace: 'Segoe UI', valign: 'middle' });
  s.addText(r.t, { x: 1.75, y, w: 7.8, h: 0.75, fontSize: 10, color: '1E293B', fontFace: 'Segoe UI', valign: 'top', lineSpacing: 16 });
});
tipBox(s, 'Facilitator Tip: The biggest mistake is going straight to rebuttal. Drill Step 1 (Understand) harder than the others. If they get the real reason, the rest flows.', 6.6, 0.5);
ft(s);

s = pres.addSlide();
hdr(s, 'Objections & Overcoming Them', 4, 'Activity + Floor Walk + Commitments');
secBar(s, '  ACTIVITY: Objection Gauntlet', 1.15, DC[4].p);
s.addText([
  { text: 'Setup: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Prepare objection cards. Agent sits in hot seat. Facilitator draws a card and delivers objection.\n', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Rules: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Agent must walk through ALL 4 steps in order. Then re-close. "Customer" decides if they\'d stay on the line.\n', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Watch for: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Did they probe before rebutting? Empathy genuine or scripted? Tie-back used? Re-closed?', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
], { x: 0.5, y: 1.6, w: 9, h: 1.3, lineSpacing: 20 });

secBar(s, '  MIDDAY FLOOR WALK - CHECKLIST', 3.1, '475569');
s.addText('[ ]  Agent probes before rebutting?\n[ ]  After overcoming, agent re-closes?\n[ ]  "I understand" sounds genuine or reflexive?\n[ ]  Tie-backs from discovery used in rebuttal?', { x: 0.6, y: 3.55, w: 9, h: 1.2, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI', lineSpacing: 20 });

secBar(s, '  COMMITMENTS YOU\'RE LOOKING FOR', 5.0, '1D4ED8');
s.addText('1.  Always probe before rebutting. "What specifically concerns you?" changes the conversation.\n2.  Lead with genuine empathy. "I completely understand" and mean it.\n3.  Use their own words in the rebuttal. Tie-backs are your strongest tool.\n4.  Always re-close after overcoming. Don\'t leave the sale hanging.', { x: 0.6, y: 5.45, w: 8.8, h: 1.2, fontSize: 11, color: '1E293B', fontFace: 'Segoe UI', lineSpacing: 20 });

tipBox(s, 'Success Metric: By end of day, agents probe before rebutting on every objection and re-close after every overcome attempt.', 6.8, 0.45);
ft(s);

// ══════════════════════════════════════════════════════════
// DAY 5
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
hdr(s, 'Putting It All Together', 5, 'Morning Huddle - Run of Show');
const d5run = [
  { t: 'Week recap. Quick-fire: Day 1 (opening), Day 2 (discovery), Day 3 (linking), Day 4 (objections). "Today we connect all four."', m: '5 min' },
  { t: 'The Compass Navigator flow. Walk through all 5 phases: Connect, Explore, Consult, Overcome, Review. Show how each day maps to a phase.', m: '5 min' },
  { t: 'The 6 Catalyst Behaviors self-check. Go through each. Ask room: "Scale of 1-5, where are you on this?"', m: '8 min' },
  { t: 'Going forward message. This isn\'t the end of training. Pick one behavior each day. Master it. Move to the next. QA scorecard is a mirror, not a judgment.', m: '5 min' },
  { t: 'Preview the Full Call Simulation.', m: '2 min' },
];
d5run.forEach((r, i) => {
  const y = 1.2 + i * 0.9;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.35, y, w: 0.55, h: 0.55, fill: { color: DC[5].l }, rectRadius: 0.06 });
  s.addText(`${i + 1}`, { x: 0.35, y, w: 0.55, h: 0.55, fontSize: 14, bold: true, color: DC[5].p, fontFace: 'Segoe UI', align: 'center', valign: 'middle' });
  s.addText(r.m, { x: 1, y, w: 0.7, h: 0.28, fontSize: 8.5, bold: true, color: '3730A3', fontFace: 'Segoe UI', valign: 'middle' });
  s.addText(r.t, { x: 1.75, y, w: 7.8, h: 0.75, fontSize: 10, color: '1E293B', fontFace: 'Segoe UI', valign: 'top', lineSpacing: 16 });
});

// Compass phases visual
const ph = [
  { n: 'Connect', c: 'FB923C', bg: 'FFF7ED' },
  { n: 'Explore', c: 'A78BFA', bg: 'FAF5FF' },
  { n: 'Consult', c: '4ADE80', bg: 'F0FDF4' },
  { n: 'Overcome', c: 'FB7185', bg: 'FFF1F2' },
  { n: 'Review', c: '2DD4BF', bg: 'F0FDFA' },
];
ph.forEach((p, i) => {
  const x = 0.4 + i * 1.9;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 5.9, w: 1.7, h: 0.65, fill: { color: p.bg }, line: { color: p.c, width: 1.5 }, rectRadius: 0.08 });
  s.addText(p.n, { x, y: 5.9, w: 1.7, h: 0.65, fontSize: 12, bold: true, color: p.c, fontFace: 'Segoe UI', align: 'center', valign: 'middle' });
});
ft(s);

s = pres.addSlide();
hdr(s, 'Putting It All Together', 5, 'Activity + Wrap-Up + Full Week Commitments');
secBar(s, '  ACTIVITY: Full Call Simulation', 1.15, DC[5].p);
s.addText([
  { text: 'Setup: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Prepare 3-4 detailed customer personas. Agent volunteers for hot seat. Facilitator plays the customer.\n', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Full flow: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Opening, Discovery, Pitch with tie-backs, Handle objection, Re-close, Summarize. Group scores each phase.\n', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Debrief: ', options: { bold: true, fontSize: 10.5, color: '1E293B', fontFace: 'Segoe UI' } },
  { text: 'Group gives feedback: strongest phase, biggest gap. Facilitator highlights one thing each agent should keep doing.', options: { fontSize: 10.5, color: '475569', fontFace: 'Segoe UI' } },
], { x: 0.5, y: 1.6, w: 9, h: 1.2, lineSpacing: 20 });

secBar(s, '  FULL WEEK COMMITMENTS - REFERENCE', 3.0, '1D4ED8');
s.addText([
  { text: 'Day 1 - Opening\n', options: { bold: true, fontSize: 10.5, color: DC[1].p, fontFace: 'Segoe UI' } },
  { text: '  Smile before you dial. Name in first 15s. Pause after "How are you?" Disclosure delivered naturally.\n', options: { fontSize: 10, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Day 2 - Discovery\n', options: { bold: true, fontSize: 10.5, color: DC[2].p, fontFace: 'Segoe UI' } },
  { text: '  Open-ended questions. 4 pillars. Record tie-backs. Conversation, not interrogation.\n', options: { fontSize: 10, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Day 3 - Linking\n', options: { bold: true, fontSize: 10.5, color: DC[3].p, fontFace: 'Segoe UI' } },
  { text: '  Every pitch has a "because." Use their words. Benefits over features. Broadband labels.\n', options: { fontSize: 10, color: '475569', fontFace: 'Segoe UI' } },
  { text: 'Day 4 - Objections\n', options: { bold: true, fontSize: 10.5, color: DC[4].p, fontFace: 'Segoe UI' } },
  { text: '  Probe before rebutting. Genuine empathy. Tie-backs in rebuttal. Always re-close.', options: { fontSize: 10, color: '475569', fontFace: 'Segoe UI' } },
], { x: 0.5, y: 3.45, w: 9, h: 2.5, lineSpacing: 18 });

secBar(s, '  AFTERNOON WRAP-UP', 6.1, DC[5].p);
s.addText('1. Recognition: Call out agents who showed most improvement. Be specific.   2. Personal commitment: Each agent writes one behavior to sustain. Post at desk.', { x: 0.5, y: 6.5, w: 9, h: 0.45, fontSize: 10, color: '1E293B', fontFace: 'Segoe UI' });

tipBox(s, 'Post-Bootcamp: Use the Catalyst QA Scorecard to track behaviors weekly. Share in team huddles. Celebrate ED scores. Coach DND patterns.', 7.0, 0.4);
ft(s);

pres.writeFile({ fileName: 'C:/Users/Josh Edgecomb/Documents/Claude/Auto QA Form/Catalyst_Bootcamp_Facilitator_Guide.pptx' })
  .then(() => console.log('Facilitator guide saved.'))
  .catch(e => console.error('Error:', e));
