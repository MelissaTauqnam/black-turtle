'use strict';
/* ============================================================
   Thai → phonetics, following the teacher's notation used in the course PDFs:
     consonants  ก g · ข ค k · จ j · ฉ ช ch · ต dt · ป bp · ท ถ t · พ ผ p · ด d · บ b · ห h
     vowels      long doubled: aa ii uu ee oo ɛɛ ɔɔ əə ʉʉ · short: a i u e o ɛ ɔ ə ʉ · ia ʉa ua ai ao
     tones       ˋ low · ˆ falling · ˊ high · ˇ rising · none = mid
     words are written solid (wanníi); a hyphen marks a glottal stop (sa-àat).
   ============================================================ */
const Phon = (() => {
  // consonant: [initial, final, class]  (H high, M mid, L low)
  const C = {
    'ก':['g','k','M'],'ข':['k','k','H'],'ฃ':['k','k','H'],'ค':['k','k','L'],'ฅ':['k','k','L'],'ฆ':['k','k','L'],'ง':['ng','ng','L'],
    'จ':['j','t','M'],'ฉ':['ch','','H'],'ช':['ch','t','L'],'ซ':['s','t','L'],'ฌ':['ch','','L'],'ญ':['y','n','L'],
    'ฎ':['d','t','M'],'ฏ':['dt','t','M'],'ฐ':['t','t','H'],'ฑ':['t','t','L'],'ฒ':['t','t','L'],'ณ':['n','n','L'],
    'ด':['d','t','M'],'ต':['dt','t','M'],'ถ':['t','t','H'],'ท':['t','t','L'],'ธ':['t','t','L'],'น':['n','n','L'],
    'บ':['b','p','M'],'ป':['bp','p','M'],'ผ':['p','','H'],'ฝ':['f','','H'],'พ':['p','p','L'],'ฟ':['f','p','L'],'ภ':['p','p','L'],
    'ม':['m','m','L'],'ย':['y','i','L'],'ร':['r','n','L'],'ล':['l','n','L'],'ว':['w','w','L'],
    'ศ':['s','t','H'],'ษ':['s','t','H'],'ส':['s','t','H'],'ห':['h','','H'],'ฬ':['l','n','L'],'อ':['','','M'],'ฮ':['h','','L'],
  };
  const LEAD = 'เแโไใ';
  const VMARK = 'ิีึืุูั็';
  const TMARK = '่้๊๋';
  const TAIL = 'ะาำ';
  const VOWELISH = VMARK + TMARK + TAIL;
  const CLUSTER1 = 'กขคตปผพฟ';
  const isC = ch => ch !== undefined && C[ch] !== undefined;
  const isVowelish = ch => ch !== undefined && VOWELISH.includes(ch);

  // very common exceptions (irregular spelling)
  const EXC = {
    'สวัสดี':'sawàtdii','ครับ':'kráp','คะ':'ká','ค่ะ':'kâ','ขอบคุณ':'kɔ̀ɔpkun','ขอโทษ':'kɔ̌ɔtôot','ไม่':'mâi','ใช่':'châi',
    'ไม่ใช่':'mâi châi','อะไร':'arai','ทำไม':'tammai','อย่างไร':'yàangrai','เป็น':'bpen','เมื่อ':'mʉ̂a','ได้':'dâai','ให้':'hâi',
    'ที่':'tîi','ผม':'pǒm','ฉัน':'chán','คุณ':'kun','เขา':'káo','เรา':'rao','มัน':'man','นี่':'nîi','นั่น':'nân','โน่น':'nôon',
    'อร่อย':'arɔ̀i','สบาย':'sabaai','ประเทศ':'bpratêet','ภาษา':'paasǎa','ไทย':'tai','วัน':'wan','เวลา':'weelaa','ตลาด':'dtalàat',
    'สนุก':'sanùk','สะดวก':'sadùak','ผู้หญิง':'pûuyǐng','ผู้ชาย':'pûuchaai','พรุ่งนี้':'prûngníi','เท่าไหร่':'tâorài','เท่าไร':'tâorai',
    'หรือ':'rʉ̌ʉ','จริง':'jing','จริงๆ':'jing jing','ก็':'gɔ̂ɔ','แล้ว':'lɛ́ɛo','และ':'lɛ́','ห้องน้ำ':'hɔ̂ɔngnáam','กรุงเทพ':'grungtêep',
    'กรุงเทพฯ':'grungtêep','เก่ง':'gèng','เยอะ':'yə́','โรงพยาบาล':'roongpayaabaan','ความสะอาด':'kwaamsa-àat','ยังไง':'yangngai','อาหาร':'aahǎan','คอมพิวเตอร์':'kɔmpíudtə̂ə',
  };

  function syllable(cs, i) {
    let lead = null;
    if (LEAD.includes(cs[i]) && isC(cs[i + 1])) { lead = cs[i]; i++; }
    if (!isC(cs[i])) return null;
    let c1 = cs[i++];
    let init = C[c1][0], cls = C[c1][2];

    // leading silent consonant (ห / อ) or consonant cluster
    const n = cs[i];
    if (c1 === 'ห' && isC(n) && 'งญนมยรลว'.includes(n) && !(n === 'ว' && false)) { c1 = n; init = C[n][0]; cls = 'H'; i++; }
    else if (c1 === 'อ' && n === 'ย' && (VOWELISH.includes(cs[i + 1]) )) { init = 'y'; cls = 'M'; i++; }
    else if (c1 === 'ท' && n === 'ร' && (isVowelish(cs[i + 1]) )) { init = 's'; cls = 'L'; i++; }
    else if (CLUSTER1.includes(c1) && isC(n) && 'รลว'.includes(n) && isVowelish(cs[i + 1]) && !(n === 'ล' && c1 === 'ต')) { init += C[n][0]; i++; }

    // vowel / tone marks
    let vm = '', tm = '';
    while (cs[i] && (VMARK.includes(cs[i]) || TMARK.includes(cs[i]))) { if (TMARK.includes(cs[i])) tm = cs[i]; else vm += cs[i]; i++; }
    const has = ch => cs[i] === ch;
    let v = null, short = false, live = false, tailFinal = '';

    if (lead === 'เ') {
      if (vm === 'ี' && has('ย')) { v = 'ia'; i++; }
      else if (vm === 'ื' && has('อ')) { v = 'ʉa'; i++; }
      else if (vm === 'ิ') v = 'əə';
      else if (vm === '็') { v = 'e'; short = true; }
      else if (!vm && has('า')) { i++; if (has('ะ')) { i++; v = 'ɔ'; short = true; } else { v = 'ao'; live = true; } }
      else if (!vm && has('อ') && !isVowelish(cs[i + 1])) { v = 'əə'; i++; }
      else if (!vm && has('ะ')) { v = 'e'; short = true; i++; }
      else v = 'ee';
    } else if (lead === 'แ') { v = 'ɛɛ'; if (has('ะ')) { v = 'ɛ'; short = true; i++; } }
    else if (lead === 'โ') { v = 'oo'; if (has('ะ')) { v = 'o'; short = true; i++; } }
    else if (lead === 'ไ' || lead === 'ใ') { v = 'ai'; live = true; }
    else {
      if (vm === 'ั' && has('ว') && !isVowelish(cs[i + 1])) { v = 'ua'; i++; }
      else if (vm === 'ั') { v = 'a'; short = true; }
      else if (vm === 'ื') { v = 'ʉʉ'; if (has('อ')) i++; }
      else if (vm === 'ิ') { v = 'i'; short = true; }
      else if (vm === 'ี') v = 'ii';
      else if (vm === 'ึ') { v = 'ʉ'; short = true; }
      else if (vm === 'ุ') { v = 'u'; short = true; }
      else if (vm === 'ู') v = 'uu';
      else if (vm === '็' && has('อ')) { v = 'ɔ'; short = true; i++; }
      else if (has('ะ')) { v = 'a'; short = true; i++; }
      else if (has('า')) { v = 'aa'; i++; if (has('ะ')) { v = 'a'; short = true; i++; } }
      else if (has('ำ')) { v = 'a'; short = true; tailFinal = 'm'; i++; }
      else if (cs[i] === 'ร' && cs[i + 1] === 'ร') { v = 'a'; short = true; i += 2; if (!(isC(cs[i]) && (!isC(cs[i + 1]) || LEAD.includes(cs[i + 1]) || cs[i + 1] === undefined))) tailFinal = 'n'; }
      else if (has('อ') && !isVowelish(cs[i + 1])) { v = 'ɔɔ'; i++; }
      else if (has('ว') && !isVowelish(cs[i + 1])) { v = 'ua'; i++; }
    }

    // final consonant?
    let fin = tailFinal;
    if (!fin) {
      const f = cs[i], f2 = cs[i + 1];
      if (isC(f) && C[f][1] !== '' && (f2 === undefined || isC(f2) || LEAD.includes(f2))) { fin = C[f][1]; i++; }
    }
    if (lead === 'เ' && v === 'ee' && fin === 'i') v = 'əə';   // เลย → loei
    if (v === null) v = fin ? 'o' : 'a';
    if (v === 'o' || v === 'a') short = true;
    // final y/w changes how the vowel is written
    let finR = fin;
    if (fin === 'i') finR = 'i';
    if (fin === 'w') finR = /i$/.test(v) ? 'u' : 'o';

    // tone
    const dead = ['k', 't', 'p'].includes(fin) || (!fin && short && !live);
    let tone = '';
    if (tm === '่') tone = cls === 'L' ? 'fall' : 'low';
    else if (tm === '้') tone = cls === 'L' ? 'high' : 'fall';
    else if (tm === '๊') tone = 'high';
    else if (tm === '๋') tone = 'rise';
    else if (dead) tone = cls === 'L' ? (short ? 'high' : 'fall') : 'low';
    else tone = cls === 'H' ? 'rise' : '';
    const MK = { low: '̀', fall: '̂', high: '́', rise: '̌', '': '' };
    // the tone mark goes on the first letter of the vowel
    const vt = v[0] + MK[tone] + v.slice(1);
    return { rom: init + vt + finR, plain: init + v + finR, weak: v === 'a' && !fin && short, next: i };
  }

  function word(w) {
    if (EXC[w]) return EXC[w].normalize('NFC');
    // silent letters (์): drop “consonant (+ vowel) + ์”
    const clean = [];
    const src = [...w];
    for (let k = 0; k < src.length; k++) {
      if (src[k + 1] === '์') { k += 1; continue; }
      if (VMARK.includes(src[k + 1]) && src[k + 2] === '์') { k += 2; continue; }
      if (src[k] === '์') continue;
      clean.push(src[k]);
    }
    const out = []; let i = 0;
    while (i < clean.length) {
      const ch = clean[i];
      if (ch >= '๐' && ch <= '๙') { out.push(String(ch.charCodeAt(0) - 0x0E50)); i++; continue; }
      if (ch === 'ๆ') { i++; continue; }
      const s = syllable(clean, i);
      if (s && s.next > i) { out.push(s); i = s.next; }
      else { out.push({ rom: ch, plain: ch }); i++; }
    }
    // unstressed short open « a » syllables inside a word carry no tone mark (sabaai, arai…)
    // words are written solid; a hyphen marks a glottal stop before a vowel (sa-àat)
    let r = '';
    out.forEach((sy, k) => {
      const t = (k < out.length - 1 && sy.weak) ? sy.plain : sy.rom;
      const startsVowel = /^[aeiouɛɔəʉ]/.test(t.normalize('NFD')[0] || '');
      r += (k && startsVowel ? '-' : '') + t;
    });
    return r.normalize('NFC');
  }

  const seg = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter('th', { granularity: 'word' }) : null;
  const memo = new Map();
  function convert(text) {
    if (memo.has(text)) return memo.get(text);
    const parts = seg ? [...seg.segment(text)].map(s => s.segment) : text.split(/(\s+)/);
    const out = [];
    let last = '';
    for (const p of parts) {
      if (!p.trim()) continue;
      if (p === 'ๆ') { if (out.length) out[out.length - 1] += '-' + last; continue; }
      const rep = p.length > 1 && p.endsWith('ๆ');
      const base = rep ? p.slice(0, -1) : p;
      last = /[\u0E00-\u0E7F]/.test(base) ? word(base) : base;
      out.push(rep ? last + '-' + last : last);
    }
    const r = out.join(' ').replace(/\s+([?!.,])/g, '$1');
    memo.set(text, r);
    return r;
  }
  return { convert };
})();
