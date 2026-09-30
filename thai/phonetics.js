'use strict';
/* ============================================================
   Thai → phonétique (romanisation avec tons), 100 % côté navigateur.
   Règles approchées : voyelles longues doublées (aa, ii, uu, ee, oo),
   ue = ɯ, aw = ɔ, oe = ɤ.
   Tons : ˋ grave (bas)  ˆ circonflexe (descendant)  ˊ aigu (haut)  ˇ caron (montant), rien = moyen.
   ============================================================ */
const Phon = (() => {
  // consonne : [initiale, finale, classe]  (H haute, M moyenne, L basse)
  const C = {
    'ก':['k','k','M'],'ข':['kh','k','H'],'ฃ':['kh','k','H'],'ค':['kh','k','L'],'ฅ':['kh','k','L'],'ฆ':['kh','k','L'],'ง':['ng','ng','L'],
    'จ':['j','t','M'],'ฉ':['ch','','H'],'ช':['ch','t','L'],'ซ':['s','t','L'],'ฌ':['ch','','L'],'ญ':['y','n','L'],
    'ฎ':['d','t','M'],'ฏ':['dt','t','M'],'ฐ':['th','t','H'],'ฑ':['th','t','L'],'ฒ':['th','t','L'],'ณ':['n','n','L'],
    'ด':['d','t','M'],'ต':['dt','t','M'],'ถ':['th','t','H'],'ท':['th','t','L'],'ธ':['th','t','L'],'น':['n','n','L'],
    'บ':['b','p','M'],'ป':['bp','p','M'],'ผ':['ph','','H'],'ฝ':['f','','H'],'พ':['ph','p','L'],'ฟ':['f','p','L'],'ภ':['ph','p','L'],
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

  // exceptions très courantes (orthographe irrégulière)
  const EXC = {
    'สวัสดี':'sà-wàt-dii','ครับ':'kháp','คะ':'khá','ค่ะ':'khâ','ขอบคุณ':'khàwp-khun','ขอโทษ':'khǎw-thôot','ไม่':'mâi','ใช่':'châi',
    'ไม่ใช่':'mâi châi','อะไร':'à-rai','ทำไม':'tham-mai','อย่างไร':'yàang-rai','เป็น':'bpen','เมื่อ':'mûea','ได้':'dâi','ให้':'hâi',
    'ที่':'thîi','ผม':'phǒm','ฉัน':'chǎn','คุณ':'khun','เขา':'khǎo','เรา':'rao','มัน':'man','นี่':'nîi','นั่น':'nân','โน่น':'nôon',
    'อร่อย':'à-ròi','สบาย':'sà-baai','ประเทศ':'bprà-thêet','ภาษา':'phaa-sǎa','ไทย':'thai','วัน':'wan','เวลา':'wee-laa','ตลาด':'dtà-làat',
    'สนุก':'sà-nùk','สะดวก':'sà-dùak','ผู้หญิง':'phûu-yǐng','ผู้ชาย':'phûu-chaai','พรุ่งนี้':'phrûng-níi','เท่าไหร่':'thâo-rài','เท่าไร':'thâo-rai',
    'หรือ':'rǔue','จริง':'jing','จริงๆ':'jing jing','ก็':'gâw','แล้ว':'láeo','และ':'lá',
    'ห้องน้ำ':'hâwng-náam','กรุงเทพ':'grung-thêep','กรุงเทพฯ':'grung-thêep',
  };

  function syllable(cs, i) {
    let lead = null;
    if (LEAD.includes(cs[i]) && isC(cs[i + 1])) { lead = cs[i]; i++; }
    if (!isC(cs[i])) return null;
    let c1 = cs[i++];
    let init = C[c1][0], cls = C[c1][2];

    // consonne muette qui « mène » (ห / อ) ou groupe consonantique
    const n = cs[i];
    if (c1 === 'ห' && isC(n) && 'งญนมยรลว'.includes(n) && !(n === 'ว' && false)) { c1 = n; init = C[n][0]; cls = 'H'; i++; }
    else if (c1 === 'อ' && n === 'ย' && (VOWELISH.includes(cs[i + 1]) )) { init = 'y'; cls = 'M'; i++; }
    else if (c1 === 'ท' && n === 'ร' && (isVowelish(cs[i + 1]) )) { init = 's'; cls = 'L'; i++; }
    else if (CLUSTER1.includes(c1) && isC(n) && 'รลว'.includes(n) && isVowelish(cs[i + 1]) && !(n === 'ล' && c1 === 'ต')) { init += C[n][0]; i++; }

    // marques de voyelle / de ton
    let vm = '', tm = '';
    while (cs[i] && (VMARK.includes(cs[i]) || TMARK.includes(cs[i]))) { if (TMARK.includes(cs[i])) tm = cs[i]; else vm += cs[i]; i++; }
    const has = ch => cs[i] === ch;
    let v = null, short = false, live = false, tailFinal = '';

    if (lead === 'เ') {
      if (vm === 'ี' && has('ย')) { v = 'ia'; i++; }
      else if (vm === 'ื' && has('อ')) { v = 'uea'; i++; }
      else if (vm === 'ิ') v = 'oe';
      else if (vm === '็') { v = 'e'; short = true; }
      else if (!vm && has('า')) { i++; if (has('ะ')) { i++; v = 'aw'; short = true; } else { v = 'ao'; live = true; } }
      else if (!vm && has('อ') && !isVowelish(cs[i + 1])) { v = 'oe'; i++; }
      else if (!vm && has('ะ')) { v = 'e'; short = true; i++; }
      else v = 'ee';
    } else if (lead === 'แ') { v = 'ae'; if (has('ะ')) { short = true; i++; } }
    else if (lead === 'โ') { v = 'oo'; if (has('ะ')) { v = 'o'; short = true; i++; } }
    else if (lead === 'ไ' || lead === 'ใ') { v = 'ai'; live = true; }
    else {
      if (vm === 'ั' && has('ว') && !isVowelish(cs[i + 1])) { v = 'ua'; i++; }
      else if (vm === 'ั') { v = 'a'; short = true; }
      else if (vm === 'ื') { v = 'ue'; if (has('อ')) i++; }
      else if (vm === 'ิ') { v = 'i'; short = true; }
      else if (vm === 'ี') v = 'ii';
      else if (vm === 'ึ') { v = 'ue'; short = true; }
      else if (vm === 'ุ') { v = 'u'; short = true; }
      else if (vm === 'ู') v = 'uu';
      else if (vm === '็' && has('อ')) { v = 'aw'; short = true; i++; }
      else if (has('ะ')) { v = 'a'; short = true; i++; }
      else if (has('า')) { v = 'aa'; i++; if (has('ะ')) { v = 'a'; short = true; i++; } }
      else if (has('ำ')) { v = 'a'; short = true; tailFinal = 'm'; i++; }
      else if (cs[i] === 'ร' && cs[i + 1] === 'ร') { v = 'a'; short = true; i += 2; if (!(isC(cs[i]) && (!isC(cs[i + 1]) || LEAD.includes(cs[i + 1]) || cs[i + 1] === undefined))) tailFinal = 'n'; }
      else if (has('อ') && !isVowelish(cs[i + 1])) { v = 'aw'; i++; }
      else if (has('ว') && !isVowelish(cs[i + 1])) { v = 'ua'; i++; }
    }

    // consonne finale ?
    let fin = tailFinal;
    if (!fin) {
      const f = cs[i], f2 = cs[i + 1];
      if (isC(f) && C[f][1] !== '' && (f2 === undefined || isC(f2) || LEAD.includes(f2))) { fin = C[f][1]; i++; }
    }
    if (lead === 'เ' && v === 'ee' && fin === 'i') v = 'oe';   // เลย → loei
    if (v === null) v = fin ? 'o' : 'a';
    if (v === 'o' || v === 'a') short = true;
    // la finale y/w modifie l'écriture de la voyelle
    let finR = fin;
    if (fin === 'i') finR = 'i';
    if (fin === 'w') finR = /i$/.test(v) ? 'u' : 'o';

    // ton
    const dead = ['k', 't', 'p'].includes(fin) || (!fin && short && !live);
    let tone = '';
    if (tm === '่') tone = cls === 'L' ? 'fall' : 'low';
    else if (tm === '้') tone = cls === 'L' ? 'high' : 'fall';
    else if (tm === '๊') tone = 'high';
    else if (tm === '๋') tone = 'rise';
    else if (dead) tone = cls === 'L' ? (short ? 'high' : 'fall') : 'low';
    else tone = cls === 'H' ? 'rise' : '';
    const MK = { low: '̀', fall: '̂', high: '́', rise: '̌', '': '' };
    // le ton se pose sur la première lettre de la voyelle
    const vt = v[0] + MK[tone] + v.slice(1);
    return { rom: init + vt + finR, next: i };
  }

  function word(w) {
    if (EXC[w]) return EXC[w].normalize('NFC');
    // consonnes muettes (์) : retirer « consonne (+ voyelle) + ์ »
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
      if (s && s.next > i) { out.push(s.rom); i = s.next; }
      else { out.push(ch); i++; }
    }
    return out.join('-').normalize('NFC');
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
      if (p === 'ๆ') { out.push(last); continue; }
      last = /[฀-๿]/.test(p) ? word(p) : p;
      out.push(last);
    }
    const r = out.join(' ').replace(/\s+([?!.,])/g, '$1');
    memo.set(text, r);
    return r;
  }
  return { convert };
})();
