const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
pres.author = 'Performance Analytics';
pres.subject = 'Catalyst Coaching Bootcamp';

// ── Dimensions ──
const W = 13.33; // slide width
const M = 0.5;   // margin
const CW = W - M*2; // content width = 12.33
const HW = CW/2 - 0.15; // half width with gap = ~6.02
const QW = CW/4 - 0.15; // quarter width

// ── Colors ──
const WHITE = 'FFFFFF', DARK = '0F172A', DARK2 = '1E293B', GRAY = '64748B', LIGHT = 'F8FAFC';
const DC = {
  1: { p: '6366F1', l: 'EEF2FF', a: '818CF8', g: '4F46E5' },
  2: { p: '8B5CF6', l: 'F5F3FF', a: 'A78BFA', g: '7C3AED' },
  3: { p: '0891B2', l: 'ECFEFF', a: '22D3EE', g: '0E7490' },
  4: { p: 'E67E22', l: 'FFF7ED', a: 'F59E0B', g: 'C2410C' },
  5: { p: '059669', l: 'F0FDF4', a: '34D399', g: '047857' },
};

// ── Helpers ──
function header(s, title, sub, day) {
  const c = DC[day];
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:W, h:1.15, fill:{type:'solid', color:c.p} });
  // Gradient overlay
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:W, h:1.15, fill:{color:c.g, transparency:60} });
  s.addText(title, { x:M, y:0.15, w:W-3, h:0.5, fontSize:28, bold:true, color:WHITE, fontFace:'Segoe UI' });
  if(sub) s.addText(sub, { x:M, y:0.65, w:W-3, h:0.3, fontSize:14, color:WHITE, fontFace:'Segoe UI', italic:true, transparency:15 });
  // Day badge
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:W-1.8, y:0.2, w:1.3, h:0.75, fill:{color:WHITE, transparency:80}, rectRadius:0.1 });
  s.addText(`Day ${day}`, { x:W-1.8, y:0.2, w:1.3, h:0.75, fontSize:20, bold:true, color:WHITE, fontFace:'Segoe UI', align:'center', valign:'middle' });
}

function footer(s, day) {
  s.addText(`Catalyst Coaching Bootcamp  |  DR Site  |  Day ${day} of 5  |  March 2026`, { x:0, y:7.15, w:W, h:0.3, fontSize:8, color:GRAY, fontFace:'Segoe UI', align:'center' });
}

function sectionBar(s, text, y, color) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M, y, w:CW, h:0.4, fill:{color}, rectRadius:0.06 });
  s.addText(text, { x:M+0.2, y, w:CW-0.4, h:0.4, fontSize:12, bold:true, color:WHITE, fontFace:'Segoe UI', valign:'middle' });
}

// Rich bullet list - items can be strings or {bold:'label', text:'description'} objects
function bullets(s, items, x, y, w, h, opts={}) {
  const fs = opts.fontSize||12;
  const color = opts.color||'1E293B';
  const boldColor = opts.boldColor||color;
  const ls = opts.lineSpacing||26;
  const textItems = [];
  items.forEach(item => {
    if(typeof item === 'object' && item.bold) {
      // Single paragraph with bold lead-in: "Bold - description"
      textItems.push(
        { text: item.bold + ' - ' + item.text, options: { fontSize:fs, color, fontFace:'Segoe UI', bullet:{type:'bullet'}, breakLine:true, lineSpacing:ls } }
      );
      // Apply bold only to the lead-in by using paraSpaceBefore hack - not possible in pptxgenjs
      // Instead, use the dash separator approach which keeps it on one line
    } else if(typeof item === 'string' && item === '') {
      textItems.push({ text: ' ', options: { fontSize:6, fontFace:'Segoe UI', breakLine:true, lineSpacing:8 } });
    } else {
      textItems.push({ text: String(item), options: { fontSize:fs, color, fontFace:'Segoe UI', bullet:{type:'bullet'}, breakLine:true, lineSpacing:ls } });
    }
  });
  s.addText(textItems, { x, y, w, h, valign:'top' });
}

// Rich text with bold labels on the same line - uses separate addText per item for true inline bold
function richBullets(s, items, x, y, w, h, opts={}) {
  const fs = opts.fontSize||11;
  const color = opts.color||'1E293B';
  const boldColor = opts.boldColor||color;
  const lineH = opts.lineH||0.3;
  items.forEach((item, i) => {
    const iy = y + i*lineH;
    if(typeof item === 'object' && item.bold) {
      s.addText([
        { text: '\u2022  ', options: { fontSize:fs, color:boldColor, fontFace:'Segoe UI' } },
        { text: item.bold, options: { fontSize:fs, color:boldColor, fontFace:'Segoe UI', bold:true } },
        { text: '  ' + item.text, options: { fontSize:fs, color, fontFace:'Segoe UI' } },
      ], { x, y:iy, w, h:lineH, valign:'middle' });
    } else if(typeof item === 'string' && item !== '') {
      s.addText([
        { text: '\u2022  ', options: { fontSize:fs, color, fontFace:'Segoe UI' } },
        { text: item, options: { fontSize:fs, color, fontFace:'Segoe UI' } },
      ], { x, y:iy, w, h:lineH, valign:'middle' });
    }
  });
}

function noteBox(s, text, y, opts={}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M, y, w:CW, h:opts.h||0.55, fill:{color:opts.bg||'FEF3C7'}, line:{color:opts.border||'FCD34D', width:1}, rectRadius:0.08 });
  s.addText(text, { x:M+0.2, y, w:CW-0.4, h:opts.h||0.55, fontSize:11, color:opts.textColor||'92400E', fontFace:'Segoe UI', valign:'middle' });
}

function scriptBox(s, text, x, y, w, h) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill:{color:'F0F9FF'}, line:{color:'BAE6FD', width:1}, rectRadius:0.08 });
  s.addText(text, { x:x+0.2, y, w:w-0.4, h, fontSize:12, italic:true, color:'0C4A6E', fontFace:'Segoe UI', valign:'middle', lineSpacing:22 });
}

function twoBoxSlide(s, day, leftTitle, leftItems, leftColors, rightTitle, rightItems, rightColors) {
  const boxW = HW;
  const boxH = 5.5;
  const leftX = M;
  const rightX = M + boxW + 0.3;
  const topY = 1.4;

  // Left box
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:leftX, y:topY, w:boxW, h:boxH, fill:{color:leftColors.bg}, line:{color:leftColors.border, width:1.5}, rectRadius:0.12 });
  s.addText(leftTitle, { x:leftX+0.2, y:topY+0.1, w:boxW-0.4, h:0.4, fontSize:15, bold:true, color:leftColors.title, fontFace:'Segoe UI' });
  bullets(s, leftItems, leftX+0.2, topY+0.6, boxW-0.4, boxH-0.8, { color:leftColors.text, boldColor:leftColors.title, fontSize:12, lineSpacing:26 });

  // Right box
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:rightX, y:topY, w:boxW, h:boxH, fill:{color:rightColors.bg}, line:{color:rightColors.border, width:1.5}, rectRadius:0.12 });
  s.addText(rightTitle, { x:rightX+0.2, y:topY+0.1, w:boxW-0.4, h:0.4, fontSize:15, bold:true, color:rightColors.title, fontFace:'Segoe UI' });
  bullets(s, rightItems, rightX+0.2, topY+0.6, boxW-0.4, boxH-0.8, { color:rightColors.text, boldColor:rightColors.title, fontSize:12, lineSpacing:26 });
}

// ══════════════════════════════════════════════════════════
// COVER
// ══════════════════════════════════════════════════════════
let s = pres.addSlide();
s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:W, h:'100%', fill:{color:DARK} });
// Accent stripe
s.addShape(pres.shapes.RECTANGLE, { x:0, y:3.4, w:W, h:0.08, fill:{color:'818CF8'} });
s.addText('Catalyst Coaching\nBootcamp', { x:1.2, y:1.2, w:11, h:1.8, fontSize:44, bold:true, color:WHITE, fontFace:'Segoe UI', lineSpacing:54 });
s.addText('5-Day Intensive  |  DR Site', { x:1.2, y:3.7, w:11, h:0.5, fontSize:20, color:'94A3B8', fontFace:'Segoe UI' });
s.addText('Xfinity Outbound Telesales\nCompass Navigator  |  Catalyst Quality Behaviors\n\nMarch 2026', { x:1.2, y:4.5, w:11, h:1.8, fontSize:14, color:'64748B', fontFace:'Segoe UI', lineSpacing:24 });

// ══════════════════════════════════════════════════════════
// DAY 1 - SLIDE 1: Why This Matters + Script
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
header(s, 'The Power of the First 30 Seconds', 'Positive Introduction', 1);

// Left column: Why + what ED looks like
s.addText('Why This Matters', { x:M, y:1.3, w:HW, h:0.3, fontSize:16, bold:true, color:DARK2, fontFace:'Segoe UI' });
s.addText('Outbound telesales is an interruption. You have 30 seconds to earn their willingness to stay on the line.', { x:M, y:1.6, w:HW, h:0.5, fontSize:11, color:'475569', fontFace:'Segoe UI', lineSpacing:20 });

sectionBar(s, 'What "Effectively Demonstrated" Looks Like', 2.15, DC[1].p);
richBullets(s, [
  {bold:'Genuine warmth', text:'the customer hears a smile, not a script'},
  {bold:'Natural pace', text:'not rushed, not robotic'},
  {bold:'Personal connection', text:'pause between their name and the pitch'},
  {bold:'Pre-call prep', text:'use their name early (existing customers)'},
  {bold:'Recording disclosure', text:'delivered naturally before discovery'},
], M+0.2, 2.65, HW-0.3, 2.2, { fontSize:11, boldColor:DC[1].g, lineH:0.35 });

// Right column: Script + Catalyst note
s.addText('The Compass Navigator Opening', { x:M+HW+0.3, y:1.3, w:HW, h:0.3, fontSize:16, bold:true, color:DARK2, fontFace:'Segoe UI' });
scriptBox(s, '"Hello! My name is [First Last], and I\'m calling from Xfinity. May I speak with [Customer Name]?"\n\n[Confirm identity, ask how their day is going]\n\n"Before we continue, I need to inform you that the call is being recorded and monitored..."', M+HW+0.3, 1.7, HW, 2.2);

// Existing customer callout
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M+HW+0.3, y:4.1, w:HW, h:0.7, fill:{color:DC[1].l}, line:{color:DC[1].a, width:1}, rectRadius:0.08 });
s.addText('Existing Customer Bonus: Using their name early shows you prepped. "I see you\'ve been with us for 3 years" is a power move.', { x:M+HW+0.5, y:4.1, w:HW-0.4, h:0.7, fontSize:10.5, color:DC[1].g, fontFace:'Segoe UI', valign:'middle', lineSpacing:18 });

// Bottom bar - full width
noteBox(s, 'Catalyst Behaviors:  Engage Actively + Own It  -  Warmth and competence from the first word.', 5.1, { h:0.45, bg:DC[1].l, border:DC[1].a, textColor:DC[1].g });
footer(s, 1);

// ══════════════════════════════════════════════════════════
// DAY 1 - SLIDE 2: DND vs ED
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
header(s, 'The Power of the First 30 Seconds', 'What to Avoid vs. What to Do', 1);

// Shorter DND/ED boxes
const boxH2 = 3.2;
const leftX2 = M, rightX2 = M + HW + 0.3;

s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:leftX2, y:1.4, w:HW, h:boxH2, fill:{color:'FEF2F2'}, line:{color:'FECACA', width:1.5}, rectRadius:0.12 });
s.addText('Did Not Demonstrate', { x:leftX2+0.2, y:1.5, w:HW-0.4, h:0.35, fontSize:15, bold:true, color:'991B1B', fontFace:'Segoe UI' });
richBullets(s, [
  {bold:'Robotic delivery', text:'reading a script word for word'},
  {bold:'Flat tone', text:'no warmth, no energy, no smile'},
  {bold:'No pause', text:'jumped from "Nice to meet you" into the pitch'},
  {bold:'Disclosure missed', text:'skipped or delivered after discovery'},
  {bold:'No personalization', text:'generic opening for anyone'},
], leftX2+0.3, 2.0, HW-0.6, 2.2, { color:'7F1D1D', boldColor:'991B1B', fontSize:11, lineH:0.38 });

s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:rightX2, y:1.4, w:HW, h:boxH2, fill:{color:'F0FDF4'}, line:{color:'BBF7D0', width:1.5}, rectRadius:0.12 });
s.addText('Effectively Demonstrated', { x:rightX2+0.2, y:1.5, w:HW-0.4, h:0.35, fontSize:15, bold:true, color:'166534', fontFace:'Segoe UI' });
richBullets(s, [
  {bold:'Real conversation', text:'sounds like a person, not a screen'},
  {bold:'Natural pauses', text:'lets customer respond, reacts to them'},
  {bold:'Genuine question', text:'asks "How are you?" and listens'},
  {bold:'Account awareness', text:'"Been with us 3 years - awesome!"'},
  {bold:'Smooth disclosure', text:'feels conversational, not rushed'},
], rightX2+0.3, 2.0, HW-0.6, 2.2, { color:'14532D', boldColor:'166534', fontSize:11, lineH:0.38 });

// Common Pitfalls panel below
const pitY = 4.8;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M, y:pitY, w:CW, h:2.1, fill:{color:'FFF7ED'}, line:{color:'FCD34D', width:1.5}, rectRadius:0.12 });
s.addText('Common Pitfalls', { x:M+0.2, y:pitY+0.08, w:3, h:0.35, fontSize:14, bold:true, color:'92400E', fontFace:'Segoe UI' });

// Two columns of pitfalls
richBullets(s, [
  {bold:'Sounded scripted', text:'delivery feels memorized'},
  {bold:'Rapid pace', text:'customer had to ask you to repeat'},
  {bold:'No name usage', text:'didn\'t use name (existing customer)'},
], M+0.3, pitY+0.5, HW-0.4, 1.2, { fontSize:10.5, boldColor:'92400E', color:'78350F', lineH:0.35 });

richBullets(s, [
  {bold:'Delayed engagement', text:'too long to connect with customer'},
  {bold:'Skipped personal moment', text:'no pause between name and pitch'},
  {bold:'State compliance missed', text:'IL/KY/CT special scripts not followed'},
], rightX2+0.3, pitY+0.5, HW-0.6, 1.2, { fontSize:10.5, boldColor:'92400E', color:'78350F', lineH:0.35 });

footer(s, 1);

// ══════════════════════════════════════════════════════════
// DAY 2 - SLIDE 1: 4 Pillars
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
header(s, 'Discovering with Intent', 'Qualitative vs. Quantitative', 2);

s.addText('Why This Matters', { x:M, y:1.35, w:CW, h:0.35, fontSize:18, bold:true, color:DARK2, fontFace:'Segoe UI' });
s.addText('Discovery is the agent asking questions, not the customer asking you. It\'s the foundation of the entire pitch. A generic pitch happens because of generic discovery. A tailored pitch that closes happens because you uncovered something real.', { x:M, y:1.75, w:CW, h:0.65, fontSize:13, color:'475569', fontFace:'Segoe UI', lineSpacing:22 });

sectionBar(s, 'The 4 Pillars of Discovery', 2.55, DC[2].p);

// 4 pillar boxes - full width
const pillars = [
  { title:'Users', desc:'Who lives in the home?\nAdults, kids, elderly, remote workers?', q:'"Who all is in the household using WiFi or devices?"' },
  { title:'Usage', desc:'How do they use services?\nStreaming, gaming, WFH, school?', q:'"Walk me through a typical evening - what\'s everyone doing online?"' },
  { title:'Devices', desc:'What are they connecting?\nPhones, tablets, smart home?', q:'"How many devices are connected to your WiFi at any given time?"' },
  { title:'Cost', desc:'What matters financially?\nCurrent spend, budget concerns?', q:'"What are you paying for Internet and phone service combined right now?"' },
];
pillars.forEach((p, i) => {
  const px = M + i*(QW+0.2);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:px, y:3.1, w:QW, h:2.6, fill:{color:DC[2].l}, line:{color:DC[2].a, width:1}, rectRadius:0.1 });
  s.addText(p.title, { x:px, y:3.2, w:QW, h:0.4, fontSize:16, bold:true, color:DC[2].p, fontFace:'Segoe UI', align:'center' });
  s.addText(p.desc, { x:px+0.15, y:3.65, w:QW-0.3, h:0.7, fontSize:10.5, color:'475569', fontFace:'Segoe UI', align:'center', lineSpacing:18 });
  s.addText(p.q, { x:px+0.15, y:4.45, w:QW-0.3, h:0.9, fontSize:10.5, italic:true, color:'0C4A6E', fontFace:'Segoe UI', align:'center', lineSpacing:18 });
});

noteBox(s, 'Key Rule: One great open-ended question that yields a full picture of the household is worth more than five closed questions that return one-word answers. Quality over quantity.', 5.95, { h:0.55, bg:'FFFBEB', border:'FCD34D' });
noteBox(s, 'Catalyst Behavior: Discover Needs - Ask proactive, relevant questions that reveal something new. Discovery is the agent probing the customer, not the customer asking the agent.', 6.6, { h:0.5, bg:DC[2].l, border:DC[2].a, textColor:DC[2].g });
footer(s, 2);

// ══════════════════════════════════════════════════════════
// DAY 2 - SLIDE 2: Qualitative vs Quantitative (redesigned)
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
header(s, 'Discovering with Intent', 'The Same Customer, Two Different Approaches', 2);

// Scenario context bar
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M, y:1.35, w:CW, h:0.5, fill:{color:DC[2].l}, line:{color:DC[2].a, width:1}, rectRadius:0.08 });
s.addText('Scenario: You\'re calling Maria, a 35-year-old single mom. You need to discover her household needs before pitching.', { x:M+0.2, y:1.35, w:CW-0.4, h:0.5, fontSize:12, bold:true, color:DC[2].g, fontFace:'Segoe UI', valign:'middle' });

// LEFT: Closed questions - conversation format
const cqX = M, cqW = HW;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:cqX, y:2.05, w:cqW, h:3.6, fill:{color:'FEF2F2'}, line:{color:'FECACA', width:1.5}, rectRadius:0.12 });
s.addText('Closed Questions', { x:cqX+0.2, y:2.12, w:cqW-0.4, h:0.35, fontSize:14, bold:true, color:'991B1B', fontFace:'Segoe UI' });
// Conversation bubbles
const cqConvo = [
  { speaker:'Agent:', text:'"Do you have WiFi at home?"', agent:true },
  { speaker:'Maria:', text:'"Yes."', agent:false },
  { speaker:'Agent:', text:'"Do you stream?"', agent:true },
  { speaker:'Maria:', text:'"Yes."', agent:false },
  { speaker:'Agent:', text:'"Do you have a phone?"', agent:true },
  { speaker:'Maria:', text:'"Yes."', agent:false },
];
cqConvo.forEach((c, i) => {
  const cy = 2.55 + i*0.35;
  s.addText(c.speaker, { x:cqX+0.3, y:cy, w:0.6, h:0.28, fontSize:9, bold:true, color:c.agent?DC[2].p:'991B1B', fontFace:'Segoe UI' });
  s.addText(c.text, { x:cqX+0.9, y:cy, w:cqW-1.2, h:0.28, fontSize:10.5, color:c.agent?DARK2:'7F1D1D', fontFace:'Segoe UI', italic:!c.agent });
});
// Result
s.addShape(pres.shapes.RECTANGLE, { x:cqX+0.3, y:4.75, w:cqW-0.6, h:0.02, fill:{color:'FECACA'} });
s.addText('Result: 3 questions. 3 one-word answers. Zero insight.\nYou have nothing to tie back to. The pitch will be generic.', { x:cqX+0.3, y:4.85, w:cqW-0.6, h:0.65, fontSize:11, bold:true, color:'991B1B', fontFace:'Segoe UI', lineSpacing:20 });

// RIGHT: Open question - conversation format
const oqX = M + HW + 0.3, oqW = HW;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:oqX, y:2.05, w:oqW, h:3.6, fill:{color:'F0FDF4'}, line:{color:'BBF7D0', width:1.5}, rectRadius:0.12 });
s.addText('Open-Ended Questions', { x:oqX+0.2, y:2.12, w:oqW-0.4, h:0.35, fontSize:14, bold:true, color:'166534', fontFace:'Segoe UI' });

s.addText('Agent:', { x:oqX+0.3, y:2.55, w:0.6, h:0.25, fontSize:9, bold:true, color:DC[2].p, fontFace:'Segoe UI' });
s.addText('"Tell me about your household. Who\'s home during the day and what\'s everyone usually doing online?"', { x:oqX+0.3, y:2.8, w:oqW-0.6, h:0.55, fontSize:11, italic:true, color:'0C4A6E', fontFace:'Segoe UI', lineSpacing:20 });

s.addText('Maria:', { x:oqX+0.3, y:3.4, w:0.6, h:0.25, fontSize:9, bold:true, color:'991B1B', fontFace:'Segoe UI' });
s.addText('"It\'s me and my two kids. My 14-year-old is always gaming after school, and my 8-year-old watches YouTube all day. I work from home twice a week doing video calls, so I need the internet to work."', { x:oqX+0.3, y:3.65, w:oqW-0.6, h:0.7, fontSize:10.5, color:DARK2, fontFace:'Segoe UI', lineSpacing:18 });

// Result with pillar tags
s.addShape(pres.shapes.RECTANGLE, { x:oqX+0.3, y:4.45, w:oqW-0.6, h:0.02, fill:{color:'BBF7D0'} });
s.addText('1 question uncovered:', { x:oqX+0.3, y:4.55, w:1.8, h:0.25, fontSize:11, bold:true, color:'166534', fontFace:'Segoe UI' });
// Pillar pills - positioned within the box
const pillLabels = ['Users', 'Usage', 'Devices', 'Cost'];
const pillColors = ['8B5CF6', '0891B2', 'E67E22', '059669'];
const pillBgs = ['F5F3FF', 'ECFEFF', 'FFF7ED', 'F0FDF4'];
const pillStart = oqX + 2.1;
const pillGap = (oqW - 2.4) / 4;
pillLabels.forEach((label, i) => {
  const px = pillStart + i * pillGap;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:px, y:4.55, w:pillGap-0.1, h:0.28, fill:{color:pillBgs[i]}, line:{color:pillColors[i], width:1}, rectRadius:0.14 });
  s.addText(label, { x:px, y:4.55, w:pillGap-0.1, h:0.28, fontSize:9, bold:true, color:pillColors[i], fontFace:'Segoe UI', align:'center', valign:'middle' });
});
s.addText('"3 kids, gaming + streaming + WFH = 1 Gig"', { x:oqX+0.3, y:4.9, w:oqW-0.6, h:0.3, fontSize:10, italic:true, color:'166534', fontFace:'Segoe UI' });

// Bottom takeaway - full width
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M, y:5.85, w:CW, h:1, fill:{color:DC[2].l}, line:{color:DC[2].a, width:1.5}, rectRadius:0.1 });
s.addText('The Pitch That Follows', { x:M+0.2, y:5.9, w:3, h:0.3, fontSize:13, bold:true, color:DC[2].p, fontFace:'Segoe UI' });

// Generic pitch
s.addText('Closed:', { x:M+0.2, y:6.2, w:0.7, h:0.25, fontSize:10, bold:true, color:'991B1B', fontFace:'Segoe UI' });
s.addText('"Our 1 Gig plan has unlimited data and a gateway for $60/mo."', { x:M+0.9, y:6.2, w:HW-0.9, h:0.25, fontSize:10, italic:true, color:'7F1D1D', fontFace:'Segoe UI' });
// Tailored pitch
s.addText('Open:', { x:M+HW+0.5, y:6.2, w:0.6, h:0.25, fontSize:10, bold:true, color:'166534', fontFace:'Segoe UI' });
s.addText('"Since your son games and you do video calls, I\'m recommending 1 Gig so everyone can be online without lag."', { x:M+HW+1.1, y:6.2, w:HW-1.1, h:0.5, fontSize:10, italic:true, color:'14532D', fontFace:'Segoe UI', lineSpacing:16 });

footer(s, 2);

// ══════════════════════════════════════════════════════════
// DAY 3 - SLIDE 1: The Logic Bridge
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
header(s, 'Linking & Being the Ambassador', 'From Discovery to Recommendation', 3);

s.addText('Why This Matters', { x:M, y:1.35, w:CW, h:0.35, fontSize:18, bold:true, color:DARK2, fontFace:'Segoe UI' });
s.addText('Discovery without a tailored pitch is wasted effort. Being an Ambassador means you don\'t just list features. You connect them to what the customer told you. The customer should hear their own words reflected back in your recommendation.', { x:M, y:1.75, w:CW, h:0.65, fontSize:13, color:'475569', fontFace:'Segoe UI', lineSpacing:22 });

sectionBar(s, 'The Logic Bridge: "Based on what you told me..."', 2.55, DC[3].p);
scriptBox(s, '"Based on what you told me, I think I have the perfect plan for your household..."\n\n"I heard you say [what they told you in discovery], so I included [product] because [specific benefit that addresses their need]."', M, 3.05, CW, 1.2);

// Feature list vs Recommendation - full width
const compY = 4.5;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M, y:compY, w:HW, h:2.2, fill:{color:'FEF2F2'}, line:{color:'FECACA', width:1.5}, rectRadius:0.12 });
s.addText('Feature List (Generic)', { x:M+0.2, y:compY+0.1, w:HW-0.4, h:0.35, fontSize:14, bold:true, color:'991B1B', fontFace:'Segoe UI' });
s.addText('"Our 1 Gig plan comes with unlimited data, a gateway, WiFi hotspot access, and Advanced Security. It\'s $60 a month with auto-pay."', { x:M+0.2, y:compY+0.5, w:HW-0.4, h:0.9, fontSize:12, italic:true, color:'7F1D1D', fontFace:'Segoe UI', lineSpacing:22 });
s.addText('Could be said to any customer. No connection to discovery.', { x:M+0.2, y:compY+1.5, w:HW-0.4, h:0.3, fontSize:11, bold:true, color:'991B1B', fontFace:'Segoe UI' });

s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M+HW+0.3, y:compY, w:HW, h:2.2, fill:{color:'F0FDF4'}, line:{color:'BBF7D0', width:1.5}, rectRadius:0.12 });
s.addText('Tailored Recommendation (Tie-Back)', { x:M+HW+0.5, y:compY+0.1, w:HW-0.4, h:0.35, fontSize:14, bold:true, color:'166534', fontFace:'Segoe UI' });
s.addText('"You mentioned your husband works from home and your kids stream constantly, so I\'m recommending 1 Gig because your whole household can be online without anyone lagging. And since you said you\'re paying $80 now, this actually brings you down to $60."', { x:M+HW+0.5, y:compY+0.5, w:HW-0.4, h:1.1, fontSize:12, italic:true, color:'14532D', fontFace:'Segoe UI', lineSpacing:22 });
s.addText('Personal. References their household. Explains why it fits.', { x:M+HW+0.5, y:compY+1.65, w:HW-0.4, h:0.3, fontSize:11, bold:true, color:'166534', fontFace:'Segoe UI' });

noteBox(s, 'Compliance: Reference broadband labels on every Internet/Mobile offer: "You can also see this information at Xfinity.com/labels."', 6.65, { h:0.4, bg:'ECFEFF', border:'22D3EE', textColor:'0E7490' });
footer(s, 3);

// ══════════════════════════════════════════════════════════
// DAY 4 - SLIDE 1: 4-Step Framework
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
header(s, 'Objections & Overcoming Them', 'The 4-Step Framework', 4);

s.addText('An objection is not a rejection. It\'s the customer telling you they need more information.', { x:M, y:1.35, w:CW, h:0.4, fontSize:16, bold:true, color:DARK2, fontFace:'Segoe UI' });

const steps = [
  { num:'1', title:'Understand the Objection', desc:'Don\'t assume you know why. Probe genuinely.', script:'"I appreciate you sharing that. What specifically about the plan are you unsure about?"', bg:'FFF7ED', border:'FED7AA' },
  { num:'2', title:'Empathize & Overcome', desc:'Show you heard them before pivoting to the solution.', script:'"I completely understand that, however..."', bg:'FFFBEB', border:'FDE68A' },
  { num:'3', title:'Restate Key Tie-Backs', desc:'Anchor back to what they told you in discovery.', script:'"I heard you say [X], so I wanted to make sure you had [benefit]..."', bg:'F0FDF4', border:'BBF7D0' },
  { num:'4', title:'Add Additional Value', desc:'Introduce one more benefit they haven\'t heard yet.', script:'"On top of that, this plan also includes [new benefit] which would help with [their situation]."', bg:'EFF6FF', border:'BFDBFE' },
];
steps.forEach((st, i) => {
  const y = 1.95 + i*1.2;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M, y, w:CW, h:1.05, fill:{color:st.bg}, line:{color:st.border, width:1}, rectRadius:0.1 });
  // Number circle
  s.addShape(pres.shapes.OVAL, { x:M+0.2, y:y+0.22, w:0.6, h:0.6, fill:{color:DC[4].p} });
  s.addText(st.num, { x:M+0.2, y:y+0.22, w:0.6, h:0.6, fontSize:20, bold:true, color:WHITE, fontFace:'Segoe UI', align:'center', valign:'middle' });
  // Title + desc
  s.addText(st.title, { x:M+1, y:y+0.1, w:4.5, h:0.35, fontSize:15, bold:true, color:DARK2, fontFace:'Segoe UI' });
  s.addText(st.desc, { x:M+1, y:y+0.5, w:4.5, h:0.35, fontSize:11, color:'475569', fontFace:'Segoe UI' });
  // Script
  s.addText(st.script, { x:M+6, y:y+0.1, w:CW-6.2, h:0.85, fontSize:12, italic:true, color:'0C4A6E', fontFace:'Segoe UI', valign:'middle', lineSpacing:20 });
});

noteBox(s, 'Critical: Never speak negatively about competitors. "Our service is 99.9% reliable" is fine. "AT&T is terrible" is a red flag (auto-fail on QA).', 6.85, { h:0.5, bg:'FEF2F2', border:'FECACA', textColor:'991B1B' });
footer(s, 4);

// ══════════════════════════════════════════════════════════
// DAY 4 - SLIDE 2: Common Objections
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
header(s, 'Objections & Overcoming Them', 'Common Objections & Responses', 4);

const objections = [
  { obj:'"I need to think about it"', understand:'"Absolutely. What part are you thinking over?"', overcome:'If price: Reframe value per day. "$60/mo is $2/day for your whole household to have reliable WiFi and a phone line included."' },
  { obj:'"Too expensive"', understand:'"I completely understand budget is important."', overcome:'"You mentioned you\'re paying $80 now. This actually saves you $20/month, and you\'re getting a phone line included that\'s worth another $40."' },
  { obj:'"I\'m under contract"', understand:'"When does your current contract end?"', overcome:'"Even with an early termination fee, the savings over 12 months often exceed the fee. Let me show you the math."' },
  { obj:'"Not interested"', understand:'"Is it the product itself, or is this just not a good time?"', overcome:'If timing: Respect it, but plant the seed with one benefit they\'ll remember when they\'re ready.' },
];
objections.forEach((o, i) => {
  const y = 1.4 + i*1.4;
  const bg = i%2===0 ? 'FFF7ED' : LIGHT;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M, y, w:CW, h:1.25, fill:{color:bg}, line:{color:'E2E8F0', width:0.5}, rectRadius:0.1 });
  s.addText(o.obj, { x:M+0.2, y:y+0.05, w:3, h:1.15, fontSize:15, bold:true, color:DC[4].p, fontFace:'Segoe UI', valign:'middle' });
  s.addText(o.understand, { x:M+3.2, y:y+0.1, w:4.5, h:0.45, fontSize:11, color:DARK2, fontFace:'Segoe UI', valign:'middle' });
  s.addText(o.overcome, { x:M+3.2, y:y+0.55, w:CW-3.6, h:0.6, fontSize:11, italic:true, color:'475569', fontFace:'Segoe UI', valign:'top', lineSpacing:18 });
});

s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M, y:7.0, w:CW, h:0.08, fill:{color:DC[4].a} });
s.addText('Always re-close after overcoming. Don\'t leave the sale hanging. Ask again with confidence.', { x:M, y:6.65, w:CW, h:0.3, fontSize:13, bold:true, color:DC[4].p, fontFace:'Segoe UI', align:'center' });
footer(s, 4);

// ══════════════════════════════════════════════════════════
// DAY 5 - PUTTING IT ALL TOGETHER
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
header(s, 'Putting It All Together', 'Full Call Flow Mastery', 5);

// Compass Navigator - 5 phase flow
const phases = [
  { name:'Connect', items:'Greeting\nAgenda\nDisclosure', color:'FB923C', bg:'FFF7ED' },
  { name:'Explore', items:'Users\nUsage\nDevices | Cost', color:'A78BFA', bg:'FAF5FF' },
  { name:'Consult', items:'Tie-backs\nRecommendation\nBroadband Labels', color:'4ADE80', bg:'F0FDF4' },
  { name:'Overcome', items:'Understand\nEmpathize\nRestate | Value', color:'F59E0B', bg:'FFF7ED' },
  { name:'Review', items:'Reaffirm\nSummarize\nClose', color:'2DD4BF', bg:'F0FDFA' },
];
const phaseW = (CW - 0.8)/5;
phases.forEach((p, i) => {
  const px = M + i*(phaseW+0.2);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:px, y:1.4, w:phaseW, h:2, fill:{color:p.bg}, line:{color:p.color, width:2}, rectRadius:0.12 });
  s.addText(p.name, { x:px, y:1.5, w:phaseW, h:0.45, fontSize:16, bold:true, color:p.color, fontFace:'Segoe UI', align:'center' });
  s.addText(p.items, { x:px+0.1, y:2, w:phaseW-0.2, h:1.2, fontSize:11, color:'475569', fontFace:'Segoe UI', align:'center', lineSpacing:20 });
  // Arrow between phases
  if(i < 4) {
    s.addText('\u25B6', { x:px+phaseW, y:2.05, w:0.2, h:0.5, fontSize:14, color:GRAY, fontFace:'Segoe UI', align:'center', valign:'middle' });
  }
});

// Week recap
sectionBar(s, 'This Week\'s Journey', 3.7, DC[5].p);
const recap = [
  { day:'Day 1', topic:'First 30 seconds. Smile, name, personal connection, recording disclosure.', color:DC[1].p },
  { day:'Day 2', topic:'Discovery. Open-ended questions. 4 pillars. Conversation, not interrogation.', color:DC[2].p },
  { day:'Day 3', topic:'Linking. Tie-backs. Every pitch has a "because." Benefits over features.', color:DC[3].p },
  { day:'Day 4', topic:'Objections. Understand first. Empathize. Restate. Add value. Always re-close.', color:DC[4].p },
];
recap.forEach((r, i) => {
  const ry = 4.25 + i*0.4;
  s.addText(r.day, { x:M+0.2, y:ry, w:1, h:0.35, fontSize:12, bold:true, color:r.color, fontFace:'Segoe UI' });
  s.addText(r.topic, { x:M+1.3, y:ry, w:CW-1.5, h:0.35, fontSize:12, color:'475569', fontFace:'Segoe UI' });
});

// 6 Catalyst behaviors
sectionBar(s, 'The 6 Catalyst Behaviors - Self Check', 6.0, DC[5].p);
const behaviors = [
  { name:'Engage\nActively', q:'Conversation\nor transaction?', color:'0891B2', bg:'CFFAFE' },
  { name:'Own It', q:'Expertise +\nkeeping them informed?', color:'1D4ED8', bg:'DBEAFE' },
  { name:'Make It\nEffortless', q:'Digestible\npieces?', color:'D97706', bg:'FEF3C7' },
  { name:'Discover\nNeeds', q:'Questions that\nreveal something?', color:'7C3AED', bg:'EDE9FE' },
  { name:'Be an\nAmbassador', q:'Products to\nthis life?', color:'16A34A', bg:'DCFCE7' },
  { name:'Show\nAppreciation', q:'Valued,\nnot processed?', color:'BE185D', bg:'FCE7F3' },
];
const bW = (CW - 0.5*5)/6;
behaviors.forEach((b, i) => {
  const bx = M + i*(bW+0.1);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:bx, y:6.5, w:bW, h:0.9, fill:{color:b.bg}, rectRadius:0.08 });
  s.addText(b.name, { x:bx, y:6.5, w:bW, h:0.45, fontSize:9, bold:true, color:b.color, fontFace:'Segoe UI', align:'center', valign:'middle', lineSpacing:14 });
  s.addText(b.q, { x:bx, y:6.9, w:bW, h:0.45, fontSize:8, color:'475569', fontFace:'Segoe UI', align:'center', valign:'top', lineSpacing:12 });
});

footer(s, 5);

// ── Save ──
pres.writeFile({ fileName: 'C:/Users/Josh Edgecomb/Documents/Claude/Auto QA Form/bootcamp/Catalyst_Bootcamp_Agent_Deck.pptx' })
  .then(() => console.log('Agent deck saved.'))
  .catch(e => console.error('Error:', e));
