const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Performance Analytics';

const W = 13.33, M = 0.5, CW = W-M*2;
const WHITE='FFFFFF', DARK='0F172A', DARK2='1E293B', GRAY='64748B';

// ══════════════════════════════════════════════════════════
// COVER
// ══════════════════════════════════════════════════════════
let s = pres.addSlide();
s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:W, h:'100%', fill:{color:DARK} });
s.addShape(pres.shapes.RECTANGLE, { x:0, y:3.2, w:W, h:0.06, fill:{color:'818CF8'} });
s.addText('Bootcamp Materials Kit', { x:1.2, y:1.5, w:11, h:0.9, fontSize:40, bold:true, color:WHITE, fontFace:'Segoe UI' });
s.addText('Print & Prepare Before Day 1', { x:1.2, y:2.4, w:11, h:0.5, fontSize:18, color:'94A3B8', fontFace:'Segoe UI' });
s.addText('Contents:\n\n   1.  Discovery Bingo Grids (Day 2) - print one per agent\n   2.  Customer Persona Cards (Days 2, 3, 5) - print one set, cut out\n   3.  Objection Cards (Day 4) - print one set, cut out\n   4.  Pitch Scorecard (Day 3) - print one per pair\n   5.  Personal Commitment Card (Day 5) - print one per agent', { x:1.2, y:3.6, w:11, h:2.5, fontSize:14, color:'64748B', fontFace:'Segoe UI', lineSpacing:24 });
s.addText('Catalyst Coaching Bootcamp  |  DR Site  |  March 2026', { x:0, y:7.1, w:W, h:0.3, fontSize:9, color:GRAY, fontFace:'Segoe UI', align:'center' });

// ══════════════════════════════════════════════════════════
// DISCOVERY BINGO GRID (Day 2) - 2 per page
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:W, h:0.7, fill:{color:'8B5CF6'} });
s.addText('Discovery Bingo  |  Day 2 Activity  |  Print & Cut - 2 per page', { x:M, y:0, w:CW, h:0.7, fontSize:16, bold:true, color:WHITE, fontFace:'Segoe UI', valign:'middle' });

// Draw two bingo grids
function drawBingoGrid(s, startX, startY, gridW, gridH) {
  const cellW = gridW/2, cellH = gridH/2;
  const pillars = [
    { title:'USERS', prompt:'Who lives in the home?\nAdults, kids, elderly?\nRemote workers?', color:'8B5CF6', bg:'F5F3FF' },
    { title:'USAGE', prompt:'How do they use services?\nStreaming, gaming, WFH?\nVideo calls, school?', color:'0891B2', bg:'ECFEFF' },
    { title:'DEVICES', prompt:'What devices are connected?\nPhones, tablets, laptops?\nSmart home, gaming?', color:'E67E22', bg:'FFF7ED' },
    { title:'COST', prompt:'What are they paying now?\nWhat matters financially?\nValue or savings?', color:'059669', bg:'F0FDF4' },
  ];
  // Outer border
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:startX, y:startY, w:gridW, h:gridH, fill:{color:WHITE}, line:{color:'CBD5E1', width:2}, rectRadius:0.12 });
  // Title inside the border at the top
  s.addText('Discovery Bingo', { x:startX+0.1, y:startY+0.05, w:gridW/2-0.2, h:0.25, fontSize:11, bold:true, color:'8B5CF6', fontFace:'Segoe UI' });
  s.addText('Open-ended questions only', { x:startX+gridW/2, y:startY+0.05, w:gridW/2-0.1, h:0.25, fontSize:9, italic:true, color:GRAY, fontFace:'Segoe UI', align:'right' });

  const cellStartY = startY + 0.3; // offset for title
  const cellHAdj = (gridH - 0.3)/2;
  pillars.forEach((p, i) => {
    const cx = startX + (i%2)*cellW;
    const cy = cellStartY + Math.floor(i/2)*cellHAdj;
    // Cell background
    s.addShape(pres.shapes.RECTANGLE, { x:cx+0.05, y:cy+0.05, w:cellW-0.1, h:cellHAdj-0.1, fill:{color:p.bg}, line:{color:p.color, width:1} });
    // Pillar title
    s.addText(p.title, { x:cx, y:cy+0.08, w:cellW, h:0.28, fontSize:12, bold:true, color:p.color, fontFace:'Segoe UI', align:'center' });
    // Prompt text
    s.addText(p.prompt, { x:cx+0.1, y:cy+0.35, w:cellW-0.2, h:cellHAdj-0.7, fontSize:9, color:'475569', fontFace:'Segoe UI', align:'center', lineSpacing:14 });
    // Write-in line
    s.addShape(pres.shapes.RECTANGLE, { x:cx+0.1, y:cy+cellHAdj-0.2, w:cellW-0.2, h:0.01, fill:{color:'CBD5E1'} });
  });
}

drawBingoGrid(s, 0.3, 1.2, 6.2, 2.8);
drawBingoGrid(s, 6.8, 1.2, 6.2, 2.8);

// Second row - adjusted to fit within slide
drawBingoGrid(s, 0.3, 4.5, 6.2, 2.8);
drawBingoGrid(s, 6.8, 4.5, 6.2, 2.8);

// Adjust title positions to be inside the grid, not above
// (handled by reducing startY offset for titles in drawBingoGrid)

// ══════════════════════════════════════════════════════════
// CUSTOMER PERSONA CARDS - Used Days 2, 3, 5
// ══════════════════════════════════════════════════════════
const personas = [
  {
    name: 'Maria Gonzalez',
    age: 35,
    household: 'Single mom with 2 kids (ages 8 and 14)',
    current: 'AT&T Internet at $90/mo, no home phone',
    usage: 'Kids stream YouTube and Netflix constantly. Older kid games online after school. Maria works remotely 2 days/week on video calls.',
    devices: '3 phones, 1 tablet, 1 laptop, smart TV',
    budget: 'Budget-conscious, always looking for value',
    objection: '"That sounds like too much money right now."',
    campaign: 'Nonsub BAU',
    color: '6366F1', bg: 'EEF2FF',
  },
  {
    name: 'James & Patricia Williams',
    age: 67,
    household: 'Retired couple, empty nesters',
    current: 'Verizon wireless ($130/mo for 2 lines), no home internet, uses phone hotspot',
    usage: 'Email, news, occasional FaceTime with grandkids. Patricia watches cooking shows on YouTube. James follows sports.',
    devices: '2 phones, 1 iPad',
    budget: 'Fixed income, but willing to pay for reliability',
    objection: '"We\'re not really interested, we already have our phones."',
    campaign: 'Nonsub BAU',
    color: '8B5CF6', bg: 'F5F3FF',
  },
  {
    name: 'David Chen',
    age: 28,
    household: 'Lives alone, apartment',
    current: 'T-Mobile 5G Home Internet at $50/mo, T-Mobile wireless',
    usage: 'Software developer, WFH full-time. Heavy gamer (PS5 + PC). 4K streaming every night. Downloads large files regularly.',
    devices: '1 phone, gaming PC, PS5, laptop, smart TV, smart speakers',
    budget: 'Not price-sensitive, wants the best performance',
    objection: '"Let me think about it, I need to compare."',
    campaign: 'Nonsub BAU',
    color: '0891B2', bg: 'ECFEFF',
  },
  {
    name: 'Keisha Johnson',
    age: 42,
    household: 'Family of 5 (husband + 3 teenagers)',
    current: 'Existing Xfinity Internet customer (500 Mbps), Verizon wireless ($220/mo for 4 lines)',
    usage: 'Teenagers are on TikTok, Snapchat, gaming constantly. Husband streams sports. Keisha does online shopping and WFH once a week.',
    devices: '5 phones, 2 tablets, 3 laptops, gaming console, smart TV',
    budget: 'Pays a lot, would love to consolidate and save',
    objection: '"We\'re under contract with Verizon for another 8 months."',
    campaign: 'XM Likely',
    color: 'E67E22', bg: 'FFF7ED',
  },
  {
    name: 'Roberto Alvarez',
    age: 55,
    household: 'Wife (Ana) and elderly mother live with him',
    current: 'Existing Xfinity Internet + 1 Xfinity Mobile line. Wife on separate AT&T plan.',
    usage: 'Roberto runs a small business from home, needs reliable internet for Zoom calls with clients. Mother watches novelas on streaming. Ana uses her phone for everything.',
    devices: '3 phones, 1 laptop, 2 smart TVs, security camera',
    budget: 'Values reliability over price, but wants to understand the value',
    objection: '"I need to talk to my wife about this before I decide."',
    campaign: 'Xfinity Mobile Add A Line',
    color: '059669', bg: 'F0FDF4',
  },
];

personas.forEach((p, i) => {
  s = pres.addSlide();
  // Header bar
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:W, h:0.7, fill:{color:p.color} });
  s.addText(`Customer Persona ${i+1} of ${personas.length}  |  Days 2, 3, 5 Activities`, { x:M, y:0, w:CW-3, h:0.7, fontSize:14, bold:true, color:WHITE, fontFace:'Segoe UI', valign:'middle' });
  s.addText(`Campaign: ${p.campaign}`, { x:W-3.5, y:0, w:3, h:0.7, fontSize:12, color:WHITE, fontFace:'Segoe UI', valign:'middle', align:'right' });

  // Main card
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M, y:0.9, w:CW, h:6.2, fill:{color:p.bg}, line:{color:p.color, width:2}, rectRadius:0.15 });

  // Name + age
  s.addText(p.name, { x:M+0.4, y:1.05, w:6, h:0.5, fontSize:28, bold:true, color:p.color, fontFace:'Segoe UI' });
  s.addText(`Age ${p.age}`, { x:M+0.4, y:1.55, w:6, h:0.3, fontSize:14, color:GRAY, fontFace:'Segoe UI' });

  // Info grid - left column
  const leftX = M+0.4, rightX = M+CW/2+0.2, infoW = CW/2-0.6;

  const fields = [
    { label:'HOUSEHOLD', value:p.household, y:2.1 },
    { label:'CURRENT PROVIDER', value:p.current, y:2.8 },
    { label:'HOW THEY USE SERVICES', value:p.usage, y:3.6 },
  ];
  fields.forEach(f => {
    s.addText(f.label, { x:leftX, y:f.y, w:infoW, h:0.25, fontSize:9, bold:true, color:p.color, fontFace:'Segoe UI', letterSpacing:1.5 });
    s.addText(f.value, { x:leftX, y:f.y+0.25, w:infoW, h:0.55, fontSize:12, color:DARK2, fontFace:'Segoe UI', lineSpacing:20, valign:'top' });
  });

  const fieldsRight = [
    { label:'DEVICES', value:p.devices, y:2.1 },
    { label:'BUDGET SENSITIVITY', value:p.budget, y:2.8 },
  ];
  fieldsRight.forEach(f => {
    s.addText(f.label, { x:rightX, y:f.y, w:infoW, h:0.25, fontSize:9, bold:true, color:p.color, fontFace:'Segoe UI', letterSpacing:1.5 });
    s.addText(f.value, { x:rightX, y:f.y+0.25, w:infoW, h:0.45, fontSize:12, color:DARK2, fontFace:'Segoe UI', lineSpacing:20, valign:'top' });
  });

  // Objection box - prominent
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M+0.3, y:4.9, w:CW-0.6, h:0.9, fill:{color:WHITE}, line:{color:p.color, width:1.5}, rectRadius:0.1 });
  s.addText('LIKELY OBJECTION', { x:M+0.5, y:4.95, w:3, h:0.25, fontSize:9, bold:true, color:p.color, fontFace:'Segoe UI', letterSpacing:1.5 });
  s.addText(p.objection, { x:M+0.5, y:5.2, w:CW-1, h:0.5, fontSize:16, italic:true, bold:true, color:DARK2, fontFace:'Segoe UI', valign:'middle' });

  // Discovery hints for facilitator
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M+0.3, y:6, w:CW-0.6, h:0.9, fill:{color:'FFFBEB'}, line:{color:'FCD34D', width:1}, rectRadius:0.1 });
  s.addText('FACILITATOR NOTE', { x:M+0.5, y:6.05, w:3, h:0.25, fontSize:8, bold:true, color:'92400E', fontFace:'Segoe UI', letterSpacing:1.5 });

  const hints = {
    0: 'Discovery should uncover: WFH needs for video calls, kids\' streaming/gaming habits, single-income budget sensitivity. Pitch 1 Gig (WFH + gaming + streaming). Tie-back: "Since your kids game and you do video calls..."',
    1: 'Discovery should uncover: grandkid FaceTime needs, sports streaming interest, hotspot frustration. Pitch 300 Mbps + included XM line. Tie-back: "You said you FaceTime your grandkids, so reliable WiFi means..."',
    2: 'Discovery should uncover: WFH reliability needs, gaming latency concerns, heavy download habits. Pitch 1 Gig or 1.2 Gig. Tie-back: "As a developer who games, you need speed that doesn\'t deprioritize..."',
    3: 'Discovery should uncover: teenager data consumption, sports streaming, cost of 4 Verizon lines. Pitch XM family plan savings. Tie-back: "You\'re paying $220 for 4 lines. With Xfinity Mobile that drops to..."',
    4: 'Discovery should uncover: business reliability needs, wife\'s separate plan waste, mother\'s streaming. Pitch Add A Line for wife. Tie-back: "Since Ana is on a separate plan, adding her saves you..."',
  };
  s.addText(hints[i], { x:M+0.5, y:6.3, w:CW-1, h:0.55, fontSize:10, color:'92400E', fontFace:'Segoe UI', valign:'top', lineSpacing:16 });

  // Footer
  s.addText('Catalyst Coaching Bootcamp  |  DR Site  |  Materials Kit  |  March 2026', { x:0, y:7.15, w:W, h:0.3, fontSize:8, color:GRAY, fontFace:'Segoe UI', align:'center' });
});

// ══════════════════════════════════════════════════════════
// OBJECTION CARDS (Day 4) - 6 cards, 2 per row, 3 rows
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:W, h:0.6, fill:{color:'E67E22'} });
s.addText('Objection Cards  |  Day 4 Activity  |  Print & Cut', { x:M, y:0, w:CW, h:0.6, fontSize:14, bold:true, color:WHITE, fontFace:'Segoe UI', valign:'middle' });

const objections = [
  { text:'"I need to think about it."', hint:'Probe: What specifically?\nIs it price, timing, or the product?', icon:'?' },
  { text:'"That\'s too expensive for me."', hint:'Reframe value per day.\nCompare to current spend.', icon:'$' },
  { text:'"I\'m under contract with my current provider."', hint:'Ask when it ends.\nCalculate savings vs. ETF.', icon:'\u26D4' },
  { text:'"I\'m not interested."', hint:'Is it the product or the timing?\nPlant the seed with one benefit.', icon:'\u2716' },
  { text:'"I need to talk to my spouse about this."', hint:'Respect it. Offer to send details.\nAsk what they\'d want to know.', icon:'\uD83D\uDCAC' },
  { text:'"I already have a provider and I\'m happy."', hint:'What do they like about it?\nFind the gap. Speed? Price? Bundle?', icon:'\u2714' },
];

const cardW = CW/2 - 0.2;
const cardH = 2;
objections.forEach((o, i) => {
  const cx = M + (i%2)*(cardW+0.4);
  const cy = 0.8 + Math.floor(i/2)*(cardH+0.25);

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:cx, y:cy, w:cardW, h:cardH, fill:{color:'FFF7ED'}, line:{color:'E67E22', width:2}, rectRadius:0.12 });

  // Card number
  s.addShape(pres.shapes.OVAL, { x:cx+0.15, y:cy+0.15, w:0.45, h:0.45, fill:{color:'E67E22'} });
  s.addText(`${i+1}`, { x:cx+0.15, y:cy+0.15, w:0.45, h:0.45, fontSize:16, bold:true, color:WHITE, fontFace:'Segoe UI', align:'center', valign:'middle' });

  // Objection text
  s.addText(o.text, { x:cx+0.75, y:cy+0.1, w:cardW-1, h:0.7, fontSize:16, bold:true, italic:true, color:DARK2, fontFace:'Segoe UI', valign:'middle', lineSpacing:22 });

  // Divider
  s.addShape(pres.shapes.RECTANGLE, { x:cx+0.3, y:cy+0.9, w:cardW-0.6, h:0.02, fill:{color:'FCD34D'} });

  // Facilitator hint
  s.addText('COACHING HINT', { x:cx+0.3, y:cy+1, w:2, h:0.2, fontSize:7, bold:true, color:'E67E22', fontFace:'Segoe UI', letterSpacing:1.5 });
  s.addText(o.hint, { x:cx+0.3, y:cy+1.2, w:cardW-0.6, h:0.65, fontSize:10.5, color:'92400E', fontFace:'Segoe UI', lineSpacing:18, valign:'top' });
});

s.addText('Catalyst Coaching Bootcamp  |  DR Site  |  Materials Kit  |  March 2026', { x:0, y:7.15, w:W, h:0.3, fontSize:8, color:GRAY, fontFace:'Segoe UI', align:'center' });

// ══════════════════════════════════════════════════════════
// PITCH SCORECARD (Day 3) - Group uses to judge pitches
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:W, h:0.6, fill:{color:'0891B2'} });
s.addText('Pitch Scorecard  |  Day 3 Activity  |  Print one per pair', { x:M, y:0, w:CW, h:0.6, fontSize:14, bold:true, color:WHITE, fontFace:'Segoe UI', valign:'middle' });

// Two scorecards side by side
function drawPitchScorecard(s, startX, startY, w) {
  const h = 6.2;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:startX, y:startY, w, h, fill:{color:WHITE}, line:{color:'0891B2', width:1.5}, rectRadius:0.12 });
  s.addText('Pitch Scorecard', { x:startX, y:startY+0.1, w, h:0.35, fontSize:16, bold:true, color:'0891B2', fontFace:'Segoe UI', align:'center' });
  s.addText('Agent: ___________________________', { x:startX+0.3, y:startY+0.5, w:w-0.6, h:0.3, fontSize:11, color:DARK2, fontFace:'Segoe UI' });

  const criteria = [
    { label:'Started with "Based on what you told me..."', y:startY+1 },
    { label:'Used at least one tie-back ("I heard you say...")', y:startY+1.7 },
    { label:'Connected features to THIS customer\'s life', y:startY+2.4 },
    { label:'Referenced broadband labels naturally', y:startY+3.1 },
    { label:'Would you buy based on this pitch?', y:startY+3.8 },
  ];
  criteria.forEach(c => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:startX+0.2, y:c.y, w:w-0.4, h:0.55, fill:{color:'ECFEFF'}, line:{color:'BAE6FD', width:0.5}, rectRadius:0.06 });
    s.addText(c.label, { x:startX+0.4, y:c.y, w:w-2.2, h:0.55, fontSize:11, color:DARK2, fontFace:'Segoe UI', valign:'middle' });
    // Yes/No boxes
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:startX+w-1.7, y:c.y+0.1, w:0.6, h:0.35, fill:{color:WHITE}, line:{color:'22C55E', width:1}, rectRadius:0.05 });
    s.addText('YES', { x:startX+w-1.7, y:c.y+0.1, w:0.6, h:0.35, fontSize:8, bold:true, color:'22C55E', fontFace:'Segoe UI', align:'center', valign:'middle' });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:startX+w-0.95, y:c.y+0.1, w:0.6, h:0.35, fill:{color:WHITE}, line:{color:'EF4444', width:1}, rectRadius:0.05 });
    s.addText('NO', { x:startX+w-0.95, y:c.y+0.1, w:0.6, h:0.35, fontSize:8, bold:true, color:'EF4444', fontFace:'Segoe UI', align:'center', valign:'middle' });
  });

  // Notes area
  s.addText('Notes / Feedback:', { x:startX+0.3, y:startY+4.6, w:w-0.6, h:0.25, fontSize:10, bold:true, color:GRAY, fontFace:'Segoe UI' });
  for(let i=0; i<3; i++) {
    s.addShape(pres.shapes.RECTANGLE, { x:startX+0.3, y:startY+5+i*0.35, w:w-0.6, h:0.01, fill:{color:'CBD5E1'} });
  }
}

drawPitchScorecard(s, 0.3, 0.8, 6.2);
drawPitchScorecard(s, 6.8, 0.8, 6.2);

s.addText('Catalyst Coaching Bootcamp  |  DR Site  |  Materials Kit  |  March 2026', { x:0, y:7.15, w:W, h:0.3, fontSize:8, color:GRAY, fontFace:'Segoe UI', align:'center' });

// ══════════════════════════════════════════════════════════
// PERSONAL COMMITMENT CARD (Day 5)
// ══════════════════════════════════════════════════════════
s = pres.addSlide();
s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:W, h:0.6, fill:{color:'059669'} });
s.addText('Personal Commitment Card  |  Day 5  |  Print one per agent', { x:M, y:0, w:CW, h:0.6, fontSize:14, bold:true, color:WHITE, fontFace:'Segoe UI', valign:'middle' });

// 4 cards per page
function drawCommitCard(s, cx, cy, cw, ch) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:cx, y:cy, w:cw, h:ch, fill:{color:'F0FDF4'}, line:{color:'059669', width:2}, rectRadius:0.15 });

  s.addText('My Commitment', { x:cx, y:cy+0.15, w:cw, h:0.4, fontSize:18, bold:true, color:'059669', fontFace:'Segoe UI', align:'center' });
  s.addText('Catalyst Coaching Bootcamp  |  DR Site', { x:cx, y:cy+0.5, w:cw, h:0.25, fontSize:9, color:GRAY, fontFace:'Segoe UI', align:'center' });

  s.addText('Name: _________________________________', { x:cx+0.4, y:cy+0.95, w:cw-0.8, h:0.3, fontSize:11, color:DARK2, fontFace:'Segoe UI' });
  s.addText('Date: ______________', { x:cx+0.4, y:cy+1.25, w:cw-0.8, h:0.3, fontSize:11, color:DARK2, fontFace:'Segoe UI' });

  s.addText('The one behavior I commit to sustaining:', { x:cx+0.4, y:cy+1.7, w:cw-0.8, h:0.25, fontSize:11, bold:true, color:'059669', fontFace:'Segoe UI' });
  for(let i=0; i<3; i++) {
    s.addShape(pres.shapes.RECTANGLE, { x:cx+0.4, y:cy+2.1+i*0.35, w:cw-0.8, h:0.01, fill:{color:'86EFAC'} });
  }

  // Reminders
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:cx+0.3, y:cy+ch-0.8, w:cw-0.6, h:0.65, fill:{color:WHITE}, rectRadius:0.06 });
  s.addText('Remember:\nEvery call is practice. The scorecard is a mirror, not a judgment.\nCompete with yourself. Beat last week\'s scores.', { x:cx+0.4, y:cy+ch-0.75, w:cw-0.8, h:0.55, fontSize:9, color:GRAY, fontFace:'Segoe UI', lineSpacing:15, valign:'middle' });
}

drawCommitCard(s, 0.3, 0.8, 6.2, 3.1);
drawCommitCard(s, 6.8, 0.8, 6.2, 3.1);
drawCommitCard(s, 0.3, 4.1, 6.2, 3.1);
drawCommitCard(s, 6.8, 4.1, 6.2, 3.1);

s.addText('Catalyst Coaching Bootcamp  |  DR Site  |  Materials Kit  |  March 2026', { x:0, y:7.15, w:W, h:0.3, fontSize:8, color:GRAY, fontFace:'Segoe UI', align:'center' });

// ── Save ──
pres.writeFile({ fileName: 'C:/Users/Josh Edgecomb/Documents/Claude/Auto QA Form/bootcamp/Catalyst_Bootcamp_Materials_Kit.pptx' })
  .then(() => console.log('Materials kit saved.'))
  .catch(e => console.error('Error:', e));
