(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HOVER = matchMedia('(hover: hover)').matches;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const nav = $('#nav');
  const onS = () => nav.classList.toggle('is-scrolled', scrollY > 30); addEventListener('scroll', onS, { passive: true }); onS();
  const mb = $('.menu-btn'), mm = $('#menu-m');
  mb.addEventListener('click', () => { const o = mb.getAttribute('aria-expanded') === 'true'; mb.setAttribute('aria-expanded', !o); mm.hidden = o; });
  $$('a', mm).forEach(a => a.addEventListener('click', () => { mb.setAttribute('aria-expanded', 'false'); mm.hidden = true; }));

  /* ---------- HERO: cada linha do título aparece quando a linha de varredura passa por ela ---------- */
  const lines = $$('.hero h1 .ln');
  if (!RM) {
    const heroEl = $('.hero'), H0 = heroEl.getBoundingClientRect().top;
    lines.forEach(ln => {
      const y = (ln.getBoundingClientRect().top - H0) / heroEl.offsetHeight; // 0..1
      ln.style.animationDelay = (0.2 + 2.4 * Math.min(.95, y) * .9) + 's';
      ln.classList.add('scan');
    });
  }
  const hero = $('.hero'), hxEl = $('#hx'), hyEl = $('#hy'), corte = $('#corte');
  if (HOVER && !RM) {
    const cl = document.createElement('div'); cl.className = 'slice-sel'; cl.setAttribute('aria-hidden', 'true'); $('.hero-media').appendChild(cl);
    hero.addEventListener('pointerleave', () => cl.style.opacity = 0);
    hero.addEventListener('pointermove', e => {
      cl.style.opacity = 1; cl.style.transform = `translateY(${e.clientY - hero.getBoundingClientRect().top}px)`;
      const r = hero.getBoundingClientRect(); const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height;
      hxEl.textContent = String(Math.round(e.clientX - r.left)).padStart(3, '0'); hyEl.textContent = String(Math.round(e.clientY - r.top)).padStart(3, '0');
      corte.textContent = String(1 + Math.min(23, Math.floor(ny * 24))).padStart(2, '0');
          });
  }
  // anel do aparelho: posição calculada sobre o object-fit
  const himg = $('.hero-img'), glow = $('.bore-glow');
  function placeBore() {
    const r = hero.getBoundingClientRect(), mob = innerWidth <= 760;
    const iw = mob ? 648 : 1536, ih = 864, px = mob ? .5 : .6;
    const fx = mob ? (0.742 * 1536 - (0.74 * 1536 - 324)) / 648 : 0.742, fy = 0.40;
    const s = Math.max(r.width / iw, r.height / ih);
    const ox = (r.width - iw * s) * px, oy = (r.height - ih * s) / 2;
    glow.style.setProperty('--bx', (ox + fx * iw * s) + 'px'); glow.style.setProperty('--by', (oy + fy * ih * s) + 'px');
    glow.style.setProperty('--bs', (0.2 * 1536 * s * (mob ? 1 : 1)) + 'px');
  }
  placeBore(); addEventListener('resize', placeBore);

  /* ---------- visualizador de cortes ---------- */
  const DATA = [
    { img: 'assets/cefaleia-740.webp', alt: 'Neurologista analisando imagens de ressonância do crânio no monitor', t: 'Cefaleia e enxaqueca', d: 'Diário de dor, identificação de gatilhos e tratamento preventivo quando as crises passam de quatro por mês. Bloqueios anestésicos e toxina botulínica quando indicados.' },
    { img: 'assets/epilepsia-740.webp', alt: 'Equipe ajustando a touca de eletroencefalograma em uma paciente', t: 'Epilepsia e crises', d: 'Diagnóstico com EEG feito aqui, ajuste fino de medicação e orientação para a família sobre o que fazer durante uma crise.' },
    { img: 'assets/memoria-493.webp', alt: 'Neurologista conversando com paciente sentada no laboratório', t: 'Memória e demências', d: 'Testes cognitivos, busca de causas tratáveis como falta de vitamina B12 ou tireoide, e um plano que inclui quem cuida.' },
    { img: 'assets/sono-740.webp', alt: 'Paciente com sensores na cabeça durante avaliação neurológica', t: 'Sono e neurologia', d: 'Insônia, sonolência durante o dia, pernas inquietas e narcolepsia, em parceria com a polissonografia.' },
    { img: 'assets/eeg-detalhe-720.webp', alt: 'Touca de eletroencefalograma com eletrodos e fios, vista de trás', t: 'Mapeamento cerebral (EEG)', d: 'EEG de rotina e prolongado, com fotoestimulação. Feito a duas salas do consultório e laudado pela mesma equipe.' }
  ];
  DATA.forEach(d => { const i = new Image(); i.src = d.img; });
  const frame = $('#vFrame'), vImg = $('#vImg'), strips = $('#vStrips');
  let cur = 0, auto = null, clearT = 0, userPicked = false;
  function show(i) {
    if (i === cur) return;
    const prev = DATA[cur]; cur = i;
    $$('.v-list button').forEach((b, k) => b.setAttribute('aria-selected', k === i));
    const D = DATA[i]; $('#vTitle').textContent = D.t; $('#vDesc').textContent = D.d; $('#vTag').textContent = `CORTE 0${i + 1}/05`;
    // a nova foto entra na hora (já pré-carregada) e nítida; só a foto anterior sai em tiras por cima
    vImg.src = D.img; vImg.alt = D.alt;
    clearTimeout(clearT); strips.innerHTML = '';
    if (RM) return;
    const r = frame.getBoundingClientRect(), n = 10, pre = new Image(); pre.src = prev.img;
    const iw = pre.naturalWidth || 740, ih = pre.naturalHeight || 493, s2 = Math.max(r.width / iw, r.height / ih), w = iw * s2, h = ih * s2, ox = (r.width - w) / 2, oy = (r.height - h) / 2;
    for (let k = 0; k < n; k++) {
      const el = document.createElement('i');
      el.style.backgroundImage = `url(${prev.img})`; el.style.backgroundSize = `${w}px ${h}px`;
      el.style.backgroundPosition = `${ox}px ${oy - k * r.height / n}px`;
      el.style.setProperty('--dx', (k % 2 ? 1 : -1) * 105 + '%'); el.style.setProperty('--d', (k * 0.02) + 's');
      strips.appendChild(el);
    }
    clearT = setTimeout(() => { strips.innerHTML = ''; }, 700);
  }
  const stopAuto = () => { userPicked = true; clearInterval(auto); auto = null; };
  $$('.v-list button').forEach(b => {
    b.addEventListener('click', () => { stopAuto(); show(+b.dataset.i); });
    if (HOVER) b.addEventListener('mouseenter', () => { stopAuto(); show(+b.dataset.i); });
  });
  if (!RM) {
    new IntersectionObserver(([en]) => { clearInterval(auto); auto = null; if (en.isIntersecting && !userPicked) auto = setInterval(() => show((cur + 1) % DATA.length), 5200); }, { threshold: .5 }).observe($('.viewer'));
  }

  /* ---------- mapa dos sintomas ---------- */
  const S = {
    cabeca: { r: ['frontal'], reg: 'Região · lobo frontal e meninges', t: 'Dor de cabeça', d: 'Na maioria das vezes é uma cefaleia primária, como enxaqueca ou tensional. Investigamos padrão, frequência e sinais de alerta antes de pedir exame de imagem.', ex: 'Diário de dor · ressonância em casos selecionados' },
    memoria: { r: ['temporal', 'frontal'], reg: 'Região · lobos temporal e frontal', t: 'Esquecimento', d: 'Esquecer nomes de vez em quando é comum. Perder compromissos, repetir perguntas e se perder em lugares conhecidos merece avaliação, de preferência com um familiar junto.', ex: 'Testes cognitivos · exames de sangue · ressonância' },
    tremor: { r: ['tronco', 'cerebelo'], reg: 'Região · núcleos da base e cerebelo', t: 'Tremor', d: 'O tipo de tremor diz muito: em repouso, ao segurar um copo, ao estender os braços. A consulta inclui testes simples com as mãos e com a escrita.', ex: 'Exame neurológico · espiral de escrita · exames de sangue' },
    formiga: { r: ['parietal'], reg: 'Região · lobo parietal e nervos periféricos', t: 'Formigamento', d: 'Pode vir do nervo, da coluna ou do cérebro. Na maioria das vezes está nos nervos das mãos e pés, como no túnel do carpo ou no diabetes.', ex: 'ENMG · glicemia e vitamina B12' },
    tontura: { r: ['cerebelo', 'tronco'], reg: 'Região · cerebelo, tronco e labirinto', t: 'Tontura', d: 'Separamos vertigem (o mundo girando), desequilíbrio e sensação de desmaio. Cada uma tem causas e exames diferentes, e muitas vêm do ouvido interno.', ex: 'Manobras no consultório · audiometria · ressonância' },
    visao: { r: ['occipital'], reg: 'Região · lobo occipital', t: 'Visão embaçada', d: 'Quando o olho está saudável, a alteração pode estar no caminho da visão até o lobo occipital. Escotomas que brilham antes da dor são típicos da enxaqueca com aura.', ex: 'Avaliação com oftalmologista · campo visual · ressonância' },
    fala: { r: ['frontal', 'temporal'], reg: 'Região · áreas da linguagem (frontal e temporal)', t: 'Fala enrolada', d: 'Se começou de repente, é urgência: pode ser AVC. Ligue 192 e anote o horário. Quando é lenta e progressiva, a investigação é feita em consulta.', ex: 'Urgência: 192 · em consulta: ressonância e avaliação da linguagem' }
  };
  function setS(k) {
    const D = S[k];
    $$('.chip').forEach(c => c.classList.toggle('is-on', c.dataset.s === k));
    $$('.reg').forEach(r => r.classList.toggle('on', D.r.includes(r.dataset.r)));
    $('#mpReg').textContent = D.reg; $('#mpTit').textContent = D.t; $('#mpDesc').textContent = D.d; $('#mpEx').textContent = D.ex;
  }
  $$('.chip').forEach(c => c.addEventListener('click', () => setS(c.dataset.s)));
  setS('cabeca');

  /* ---------- rede neural que reage ao cursor ---------- */
  const cv = $('#rede'), cx = cv.getContext('2d'), sec = $('.rede');
  let W, H, nodes = [], mx = -999, my = -999, run = false, dpr = Math.min(devicePixelRatio || 1, 2), pulses = [];
  function size() {
    const r = sec.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(W * H / 7000); nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18, l: 0 }));
  }
  size(); addEventListener('resize', size);
  sec.addEventListener('pointermove', e => { const r = sec.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  sec.addEventListener('pointerleave', () => { mx = my = -999; });
  let autoT = 0;
  function draw(t) {
    cx.clearRect(0, 0, W, H);
    if (!HOVER || mx < -900) { autoT = t / 1000; if (!HOVER) { mx = W * (.5 + .35 * Math.sin(autoT * .4)); my = H * (.5 + .3 * Math.sin(autoT * .7)); } }
    const R = 120;
    for (const a of nodes) {
      if (!RM) { a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1; }
      const d = Math.hypot(a.x - mx, a.y - my); a.l += ((d < 180 ? 1 - d / 180 : 0) - a.l) * .08;
    }
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < R) {
        const l = Math.max(a.l, b.l), al = (1 - d / R) * (.2 + l * .6);
        cx.strokeStyle = l > .05 ? `rgba(240,166,74,${al})` : `rgba(127,183,214,${al * .9})`; cx.lineWidth = .8; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
        if (!RM && l > .4 && Math.random() < .004) pulses.push({ a, b, t: 0 });
      }
    }
    for (const a of nodes) { cx.fillStyle = a.l > .05 ? `rgba(255,214,160,${.35 + a.l * .65})` : 'rgba(169,182,199,.35)'; cx.beginPath(); cx.arc(a.x, a.y, 1.3 + a.l * 2, 0, 7); cx.fill(); }
    pulses = pulses.filter(p => (p.t += .03) < 1);
    for (const p of pulses) { const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t; cx.fillStyle = 'rgba(255,226,184,.95)'; cx.beginPath(); cx.arc(x, y, 2.4, 0, 7); cx.fill(); }
    if (run && !RM) requestAnimationFrame(draw);
  }
  new IntersectionObserver(([en]) => { const w = run; run = en.isIntersecting; if (run && !w) requestAnimationFrame(draw); }).observe(sec);
  draw(0);

  /* ---------- rastro do cursor: traço de EEG que segue o mouse ---------- */
  if (HOVER && !RM) {
    const tc = document.createElement('canvas'); tc.className = 'trail'; tc.setAttribute('aria-hidden', 'true'); document.body.appendChild(tc);
    const tx = tc.getContext('2d'); let pts = [], tw, th, alive = false, last = 0;
    const tsize = () => { tw = innerWidth; th = innerHeight; tc.width = tw * dpr; tc.height = th * dpr; tx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    tsize(); addEventListener('resize', tsize);
    addEventListener('pointermove', e => { pts.push({ x: e.clientX, y: e.clientY, t: performance.now() }); if (!alive) { alive = true; requestAnimationFrame(trail); } }, { passive: true });
    function trail(now) {
      tx.clearRect(0, 0, tw, th);
      pts = pts.filter(p => now - p.t < 520);
      if (pts.length > 1) {
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i], age = (now - b.t) / 520;
          const j = Math.sin((b.t / 18) + i) * 2.2 * (1 - age); // leve oscilação, como um traçado de EEG
          tx.strokeStyle = `rgba(240,166,74,${(1 - age) * .85})`; tx.lineWidth = 2.2 * (1 - age) + .4; tx.lineCap = 'round';
          tx.beginPath(); tx.moveTo(a.x, a.y); tx.lineTo(b.x + j, b.y - j); tx.stroke();
        }
        const h = pts[pts.length - 1];
        tx.fillStyle = 'rgba(255,214,160,.95)'; tx.beginPath(); tx.arc(h.x, h.y, 3, 0, 7); tx.fill();
        tx.fillStyle = 'rgba(240,166,74,.18)'; tx.beginPath(); tx.arc(h.x, h.y, 12, 0, 7); tx.fill();
      }
      if (pts.length) requestAnimationFrame(trail); else { alive = false; tx.clearRect(0, 0, tw, th); }
    }
  }

  /* ---------- revelação ---------- */
  const rvs = $$('.sec-head, .intro-t, .intro-dl, .v-stage, .mp-stage, .split-txt, .eq, .samu li, .faq-cols, .ct-grid>*');
  rvs.forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  rvs.forEach(el => io.observe(el));
  $('#form').addEventListener('submit', e => { e.preventDefault(); $('#formOk').hidden = false; });
})();

/* TRANSIÇÕES v2 · Nervura Neurologia · palavras que acendem como sinapses
   Entradas de textos, imagens e cartões + traço de passagem entre seções, com assinatura própria do nicho.
   Só roda com JS e sem prefers-reduced-motion; o conteúdo nunca fica escondido sem JS. */
(() => {
  const C = {"step": 0.09, "settle": 2.8, "words": true, "imgFilter": "grayscale(1) contrast(1.25) brightness(.8)", "divider": "<svg viewBox=\"0 0 1200 28\"><path class=\"ln\" pathLength=\"1\" style=\"--ld:0.00s\" d=\"M0 14 L180 6 L330 20 L520 10 L640 18 L820 8 L1000 16 L1200 14\"/><circle class=\"dot\" cx=\"180\" cy=\"6\" r=\"4\" style=\"--ld:0.32s\"/><circle class=\"dot\" cx=\"330\" cy=\"20\" r=\"4\" style=\"--ld:0.49s\"/><circle class=\"dot\" cx=\"520\" cy=\"10\" r=\"4\" style=\"--ld:0.66s\"/><circle class=\"dot\" cx=\"640\" cy=\"18\" r=\"4\" style=\"--ld:0.83s\"/><circle class=\"dot\" cx=\"820\" cy=\"8\" r=\"4\" style=\"--ld:1.00s\"/><circle class=\"dot\" cx=\"1000\" cy=\"16\" r=\"4\" style=\"--ld:1.17s\"/></svg>", wordDelay: (i, n) => ((i * 7) % n) * .07 + Math.random() * .05, cardDelay: (n) => [0, .22, .08, .3, .14, .36, .04][n % 7]};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const html = document.documentElement;
  html.classList.add('fx');
  const mob = matchMedia('(max-width: 760px)').matches;
  const SKIP = '.hero, body > header, nav, footer, .nav, .wa, .whats, .wpp, [class*="whatsapp"], canvas, video, iframe, [data-nofx], [class*="marquee"], [class*="ticker"], [aria-hidden="true"]' + (C.skip ? ', ' + C.skip : '');
  const pinned = el => { for (let p = el; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p).position; if (s === 'sticky' || s === 'fixed') return true; } return false; };
  const F0 = new Map();
  if (C.imgFilter) document.querySelectorAll('section img').forEach(i => F0.set(i, getComputedStyle(i).filter));
  const sections = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section') && !s.matches(SKIP) && !s.closest(SKIP));

  // o sistema antigo de revelação (fade genérico) sai de cena fora da hero
  sections.forEach(s => s.querySelectorAll('.rv, .reveal').forEach(el => { el.classList.remove('rv', 'reveal'); el.style.transitionDelay = ''; }));
  sections.forEach(s => s.classList.remove('rv', 'reveal'));

  const items = []; // {el, kind}
  const taken = new Set();
  const isTaken = el => { for (const t of taken) if (t !== el && t.contains(el)) return true; return false; };

  sections.forEach(sec => {
    // 1. cartões: grupos de 3+ irmãos parecidos com imagem ou título
    const groups = [];
    sec.querySelectorAll('*').forEach(p => {
      const ch = [...p.children].filter(c => !['SCRIPT', 'TEMPLATE', 'BR'].includes(c.tagName));
      if (ch.length < 3 || p.closest(SKIP)) return;
      const sig = c => c.tagName + '.' + (c.classList[0] || '');
      const cnt = {}; ch.forEach(c => cnt[sig(c)] = (cnt[sig(c)] || 0) + 1);
      const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
      if (best[1] < 3 || best[1] < ch.length * .7) return;
      const cards = ch.filter(c => sig(c) === best[0]);
      if (!cards.every(c => c.querySelector('img, h3, h4, strong, summary, dt') && c.getBoundingClientRect().height > 50)) return;
      if (cards.some(c => pinned(c))) return;
      if (groups.some(g => g.some(c => c.contains(p)))) return;
      groups.push(cards);
    });
    groups.forEach(g => g.forEach((c, i) => { if (!isTaken(c)) { c.classList.add('fx-c'); c.style.setProperty('--n', i); taken.add(c); items.push({ el: c, kind: 'c', i }); } }));

    // 2. imagens soltas (fora de cartões, fundos fixos e áreas presas)
    sec.querySelectorAll('img').forEach(img => {
      if (img.closest(SKIP) || isTaken(img) || pinned(img)) return;
      let w = img.parentElement; if (w.tagName === 'PICTURE') w = w.parentElement;
      const ws = getComputedStyle(img);
      if (ws.position === 'absolute' && w === sec) return;
      const r = w.getBoundingClientRect(), rs = sec.getBoundingClientRect();
      if (r.width * r.height > rs.width * rs.height * .85) return; // foto de fundo da seção
      let target = w;
      if (w === sec || w.querySelector('h1, h2, h3, p, a, button') ) target = img;
      if (isTaken(target) || taken.has(target)) return;
      target.classList.add('fx-i'); if (target === img) target.classList.add('fx-self');
      if (getComputedStyle(target).clipPath !== 'none') target.classList.add('fx-noclip');
      taken.add(target); items.push({ el: target, kind: 'i' });
    });

    // 3. textos: títulos, parágrafos, listas de dados, botões e formulários, em cascata
    sec.querySelectorAll('h2, h3, h4, p, li, blockquote, dl, form, ' + (C.extraText || '.eyebrow') + ', a[class*="btn"], a[class*="cta"], button[class*="btn"]').forEach(el => {
      if (el.closest(SKIP) || isTaken(el) || taken.has(el) || pinned(el)) return;
      if (el.closest('form') && el.tagName !== 'FORM') return;
      if (!el.textContent.trim() && el.tagName !== 'FORM') return;
      if (el.tagName === 'H2' && C.words) splitWords(el);
      else el.classList.add('fx-t');
      taken.add(el); items.push({ el, kind: el.classList.contains('fx-ws') ? 'w' : 't' });
    });
  });

  function splitWords(h) {
    h.classList.add('fx-ws');
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(t => { if (!t) return; if (/^\s+$/.test(t)) frag.append(t); else { const s = document.createElement('span'); s.className = 'fx-w'; s.textContent = t; frag.append(s); } });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !/^(BR|SVG|IMG)$/i.test(n.tagName)) {
          const cs = getComputedStyle(n);
          if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text' || cs.display === 'block') { n.classList.add('fx-w'); return; }
          walk(n);
        }
      });
    };
    walk(h);
    [...h.querySelectorAll('.fx-w')].forEach((w, i, all) => w.style.setProperty('--wd', C.wordDelay(i, all.length) + 's'));
  }

  // filtro de cor de cada foto preservado: a entrada soma o efeito ao filtro original
  if (C.imgFilter) document.querySelectorAll('.fx-i img, img.fx-i, .fx-c img').forEach(img => {
    const f = F0.get(img); img.style.setProperty('--f0', (f && f !== 'none' ? f + ' ' : '') + C.imgFilter);
  });

  // 4. traço de passagem entre seções
  let nDiv = 0;
  sections.forEach((sec, k) => {
    if (nDiv >= (C.maxDiv || 7) || k === 0 && C.skipFirstDiv) return;
    if (sec.matches(C.noDiv || '.fixo, .window, .janela, .sky')) return;
    if (!sec.querySelector('h2')) return;
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    const box = document.createElement('div');
    box.className = 'fx-div'; box.setAttribute('aria-hidden', 'true');
    box.innerHTML = C.divider;
    sec.prepend(box); nDiv++;
    items.push({ el: box, kind: 'd' });
  });

  // entrada: os elementos que chegam juntos entram em cascata, na ordem do texto
  const step = C.step * (mob ? .7 : 1);
  const show = (el, d) => {
    el.style.transitionDelay = d + 's';
    el.style.setProperty('--dl', d + 's');
    el.classList.add('fx-on');
    setTimeout(() => { el.classList.add('fx-done'); el.style.transitionDelay = ''; }, (d + C.settle) * 1000);
  };
  // elementos recortados (clip-path) são observados pelo pai, porque o recorte zera a área visível
  const proxyOf = el => ((el.classList.contains('fx-i') && !el.classList.contains('fx-noclip')) || (C.textClip && el.classList.contains('fx-t'))) ? el.parentElement : el;
  const watch = new Map();
  items.forEach(({ el }) => { const p = proxyOf(el); if (!watch.has(p)) watch.set(p, []); watch.get(p).push(el); });
  const io = new IntersectionObserver(es => {
    const ins = es.filter(e => e.isIntersecting).flatMap(e => { io.unobserve(e.target); return watch.get(e.target) || []; })
      .sort((a, b) => a.compareDocumentPosition(b) & 2 ? 1 : -1);
    ins.forEach((el, i) => {
      const n = el.classList.contains('fx-c') ? C.cardDelay(+el.style.getPropertyValue('--n') || 0) : Math.min(i, 7) * step;
      show(el, n);
    });
  }, { threshold: .14, rootMargin: '0px 0px -7% 0px' });
  watch.forEach((_, p) => io.observe(p));
  // quem chega por âncora já encontra o que ficou acima pronto
  requestAnimationFrame(() => watch.forEach((els, p) => { if (p.getBoundingClientRect().bottom < 0) { io.unobserve(p); els.forEach(el => show(el, 0)); } }));
})();
