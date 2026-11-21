/* Acto 2: algo no cuadra */
(function () {
  const { calma, tactil, azar, clamp } = LB;

  /* Letras que se tuercen solas */
  function letras() {
    document.querySelectorAll('[data-glitch]').forEach(el => {
      const txt = el.textContent.trim();
      el.setAttribute('aria-label', txt);
      el.innerHTML = txt.split(' ').map(p => `<span class="w" aria-hidden="true">${[...p].map(c => `<span class="l">${c}</span>`).join('')}</span>`).join(' ');
      const ls = el.querySelectorAll('.l');
      const caida = ls[Math.floor(ls.length * 0.62)];
      if (caida) caida.classList.add('caida');
    });
    if (calma) return;
    const vivos = new Set();
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? vivos.add(e.target) : vivos.delete(e.target)));
    document.querySelectorAll('[data-glitch]').forEach(el => io.observe(el));
    const giros = [
      [{ transform: 'none' }, { transform: 'translateY(0.2em) rotate(9deg)' }, { transform: 'none' }],
      [{ transform: 'none' }, { transform: 'scaleX(-1)' }, { transform: 'none' }],
      [{ transform: 'none' }, { transform: 'translateX(0.25em) skewX(-14deg)' }, { transform: 'none' }]
    ];
    setInterval(() => {
      if (LB.acto < 2) return;
      vivos.forEach(el => {
        const ls = el.querySelectorAll('.l');
        const n = LB.acto >= 3 ? 3 : 1;
        for (let k = 0; k < n; k++) {
          const l = ls[Math.floor(Math.random() * ls.length)];
          l.animate(giros[Math.floor(Math.random() * giros.length)], { duration: 420, easing: 'steps(3)' });
        }
      });
    }, 1100);
  }

  /* Siete reseñas: la misma cara, la misma frase que se va torciendo, fechas que todavía no han llegado */
  const RESENAS = [
    'Aquí somos muy felices. No queremos irnos nunca.',
    'Aquí somos muy felices. No queremos irnos nunca.',
    'Aquí somos muy felices. No queremos irnos.',
    'Aquí somos muy felices. No podemos irnos.',
    'Aquí somos muy felices. No nos dejan irnos.',
    'Aquí somos muy felices. Aquí somos muy felices. Aquí somos',
    'Aquí vas a ser muy feliz. No vas a querer irte nunca.'
  ];
  function opiniones() {
    const pista = document.getElementById('pista');
    const anio = new Date().getFullYear();
    const saltos = [1, 5, 12, 20, 33, 51, null];
    pista.innerHTML = saltos.map((s, i) => `
      <article class="resena">
        <div class="resena-cara">${LB.caras.retrato('marta', { sonrisa: 0.35 + i * 0.17, vacio: s === null })}</div>
        <p class="estrellas" aria-label="Cinco estrellas">★★★★★</p>
        <blockquote><p>${RESENAS[i]}</p></blockquote>
        <p class="firma">Marta G. · casa 14<br><time>${s === null ? '12 de marzo de —' : '12 de marzo de ' + (anio + s)}</time></p>
      </article>`).join('');
    pista.querySelectorAll('.cara').forEach(c => LB.caras.parpadear(c, 0.6));
    if (calma) return;
    gsap.to(pista, {
      x: () => -(pista.scrollWidth - innerWidth + 2 * parseFloat(getComputedStyle(pista.parentElement).paddingLeft)),
      ease: 'none',
      scrollTrigger: { trigger: '.opiniones', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true }
    });
  }

  /* Vecinos: te siguen con la mirada hasta que todos miran detrás de ti */
  const VECINOS = [['marta', 'Marta'], ['joaquin', 'Joaquín'], ['lucia', 'Lucía'], ['ernesto', 'Ernesto'], ['pilar', 'Pilar'], ['javi', 'Javi']];
  function vecinos() {
    const ul = document.getElementById('rejilla-caras');
    const detras = document.getElementById('detras');
    const pintar = (fase2) => {
      ul.innerHTML = VECINOS.map(([id, nombre]) => `<li data-mira="vecino:${nombre}"><div class="vecino-cara">${LB.caras.retrato(id, fase2 ? { sonrisa: 1.25 } : {})}</div><p>${nombre} · casa 14</p></li>`).join('');
      ul.querySelectorAll('.cara').forEach(c => { LB.caras.parpadear(c, 0.7); if (fase2) LB.caras.mirar(c, 0, 0, true); });
    };
    pintar(false);
    let fase2 = false;
    const objetivo = { x: innerWidth / 2, y: innerHeight / 2 };
    const mirarTodos = () => { if (!fase2) ul.querySelectorAll('.cara').forEach(c => LB.caras.mirar(c, objetivo.x, objetivo.y)); };
    let pend = false;
    const mover = (x, y) => {
      objetivo.x = x; objetivo.y = y;
      if (pend) return; pend = true;
      requestAnimationFrame(() => { pend = false; mirarTodos(); });
    };
    addEventListener('pointermove', e => mover(e.clientX, e.clientY), { passive: true });
    addEventListener('touchstart', e => mover(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    ScrollTrigger.create({
      trigger: '.vecinos', start: 'top top', end: 'bottom bottom',
      onUpdate: s => {
        if (tactil) mover(innerWidth / 2, innerHeight * (0.2 + s.progress * 0.8));
        const quiere = s.progress > 0.52;
        if (quiere !== fase2) {
          fase2 = quiere;
          pintar(fase2);
          detras.classList.toggle('visible', fase2);
          if (fase2) LB.marta('detras', {}, { urgente: true, dura: 5000 });
        }
      }
    });
  }

  /* Vecinos que se han ido: el contador duda y se queda en cero */
  function cero() {
    const num = document.getElementById('cero-numero');
    if (calma) return;
    ScrollTrigger.create({
      trigger: '.cero', start: 'top 60%', once: true,
      onEnter: () => {
        let k = 0;
        const id = setInterval(() => {
          num.textContent = k < 14 ? String(Math.floor(Math.random() * 32) + 1) : '0';
          if (++k > 14) clearInterval(id);
        }, 90);
      }
    });
  }

  /* Cámaras que te siguen */
  function domos() {
    const lentes = [...document.querySelectorAll('.domo')].map(s => ({ s, l: s.querySelector('.lente') }));
    const apuntar = (x, y) => lentes.forEach(({ s, l }) => {
      const r = s.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height * 0.42);
      const d = Math.hypot(dx, dy) || 1;
      l.setAttribute('transform', `translate(${(dx / d * 15).toFixed(1)} ${clamp(dy / d * 12, -2, 12).toFixed(1)})`);
    });
    let pend = false;
    const mover = (x, y) => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; apuntar(x, y); }); };
    addEventListener('pointermove', e => mover(e.clientX, e.clientY), { passive: true });
    addEventListener('touchstart', e => mover(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    addEventListener('scroll', () => { if (tactil || !LB.puntero.movido) mover(innerWidth / 2, innerHeight * 0.9); }, { passive: true });
  }

  /* Circuito cerrado: cuatro cámaras, una te enfoca a ti. Los rótulos de la 64 son tuyos y van en directo. */
  const ruido = [];
  function rotulos(tipo, t) {
    if (tipo === 'pinar') return (t % 5600) < 1500 ? ['CAM 03 · PINAR', 'MOVIMIENTO'] : ['CAM 03 · PINAR'];
    if (tipo === 'salon') return ['CAM 07 · CASA 14 · SALÓN', 'PERSONAS: 5'];
    if (tipo === 'entrada') return ['CAM 12 · ENTRADA', 'SALIDAS HOY: 0'];
    const S = LB.sabe, s = Math.floor((Date.now() - LB.t0) / 1000);
    const l = ['CAM 64 · TÚ' + (S.dispositivo ? ' · ' + S.dispositivo.corto : '')];
    let dentro = 'DENTRO ' + LB.dos(Math.floor(s / 60)) + ':' + LB.dos(s % 60);
    if (S.bateria && (!S.bateria.cargando || S.bateria.nivel < 100)) dentro += ' · BAT ' + S.bateria.nivel + ' %';
    l.push(dentro);
    if (LB.quieto > 3000) l.push('SIN MOVIMIENTO ' + Math.floor(LB.quieto / 1000) + ' S');
    return l;
  }
  function prepararRuido() {
    for (let k = 0; k < 4; k++) {
      const c = document.createElement('canvas'); c.width = 160; c.height = 120;
      const x = c.getContext('2d'), img = x.createImageData(160, 120);
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      x.putImageData(img, 0, 0); ruido.push(c);
    }
  }
  function figura(ctx, x, y, alto, color, ladeo) {
    const a = alto, w = a * 0.11;
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = color; ctx.strokeStyle = color;
    ctx.beginPath(); ctx.ellipse(ladeo * a * 0.05, -a * 0.94, w * 0.42, w * 0.56, ladeo, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-w / 2, -a * 0.86, w, a * 0.46);
    ctx.lineWidth = w * 0.28; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w / 2, -a * 0.84); ctx.lineTo(-w * 0.9, -a * 0.2); ctx.moveTo(w / 2, -a * 0.84); ctx.lineTo(w * 0.95, -a * 0.18);
    ctx.moveTo(-w * 0.25, -a * 0.42); ctx.lineTo(-w * 0.32, 0); ctx.moveTo(w * 0.25, -a * 0.42); ctx.lineTo(w * 0.3, 0); ctx.stroke();
    ctx.restore();
  }
  const ESCENAS = {
    pinar(ctx, w, h, t, c) {
      ctx.fillStyle = '#1a221e'; ctx.fillRect(0, h * 0.62, w, h);
      ctx.fillStyle = 'rgba(160,176,166,0.16)'; ctx.fillRect(0, h * 0.45, w, h * 0.16);
      const ciclo = Math.floor(t / 5600), fase = t % 5600;
      const tr = [0.06, 0.19, 0.3, 0.44, 0.57, 0.69, 0.83, 0.94];
      if (fase < 1500) figura(ctx, w * tr[(ciclo * 3) % tr.length] + w * 0.06, h * (0.66 + Math.min(ciclo, 4) * 0.05), h * (0.32 + Math.min(ciclo, 4) * 0.1), 'rgba(205,214,204,0.78)', 0.25);
      tr.forEach((x, i) => { ctx.fillStyle = i % 2 ? '#2b342f' : '#36403a'; ctx.fillRect(w * x, 0, w * (0.03 + (i % 3) * 0.02), h * 0.68); });
    },
    salon(ctx, w, h, t) {
      ctx.fillStyle = '#26302b'; ctx.fillRect(0, 0, w, h * 0.66);
      ctx.fillStyle = '#1b221f'; ctx.fillRect(0, h * 0.66, w, h);
      ctx.fillStyle = '#7d8d84'; ctx.fillRect(w * 0.58, h * 0.16, w * 0.26, h * 0.34);
      ctx.fillStyle = '#121714'; ctx.fillRect(w * 0.1, h * 0.52, w * 0.4, h * 0.2);
      const paso = Math.floor(t / 4200) % 6;
      if (paso < 5) figura(ctx, w * (0.86 - paso * 0.07), h * (0.7 + paso * 0.07), h * (0.42 + paso * 0.15), '#040605', 0.35 + paso * 0.1);
    },
    entrada(ctx, w, h, t) {
      ctx.fillStyle = '#2b3530'; ctx.fillRect(0, h * 0.7, w, h);
      ctx.fillStyle = '#56645c'; ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.7); ctx.lineTo(w * 0.6, h * 0.7); ctx.lineTo(w * 0.9, h); ctx.lineTo(w * 0.1, h); ctx.fill();
      ctx.fillStyle = '#0c100e';
      for (let i = 0; i < 14; i++) ctx.fillRect(w * (0.08 + i * 0.062), h * 0.24, w * 0.012, h * 0.5);
      ctx.fillRect(w * 0.06, h * 0.24, w * 0.86, h * 0.025);
      if (t % 7300 < 1100) {
        ctx.fillStyle = 'rgba(214,220,210,0.85)';
        [0.37, 0.56].forEach(x => { ctx.beginPath(); ctx.ellipse(w * x, h * 0.45, w * 0.022, h * 0.04, 0, 0, Math.PI * 2); ctx.fill(); for (let d = 0; d < 4; d++) ctx.fillRect(w * (x - 0.03), h * (0.4 + d * 0.022), w * 0.06, h * 0.012); });
      }
    },
    tu(ctx, w, h, t, c) {
      ctx.fillStyle = '#202925'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#151b18'; ctx.fillRect(0, h * 0.7, w, h);
      ctx.fillStyle = '#a9bcb0'; ctx.fillRect(w * 0.34, h * 0.28, w * 0.32, h * 0.24);
      ctx.fillStyle = '#e6e2d9'; ctx.fillRect(w * 0.36, h * 0.3, w * 0.13, h * 0.2);
      ctx.fillStyle = '#5e7a6a'; ctx.fillRect(w * 0.5, h * 0.3, w * 0.14, h * 0.2);
      ctx.fillStyle = '#2a2f2c'; ctx.fillRect(w * 0.47, h * 0.52, w * 0.06, h * 0.08); ctx.fillRect(w * 0.18, h * 0.6, w * 0.64, h * 0.05);
      const p = c.presencia || 0;
      if (p > 0.02) {
        const salto = Math.floor(t / 125) % 7 === 0 ? 0.012 : 0;
        ctx.globalAlpha = Math.min(1, p * 1.2);
        figura(ctx, w * (0.68 + salto), h * 1.02, h * (0.9 + p * 0.25), '#030404', 0.5 + Math.sin(t / 900) * 0.05);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = '#070908';
      ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.66, w * 0.07, h * 0.11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.28, h); ctx.quadraticCurveTo(w * 0.3, h * 0.76, w * 0.5, h * 0.75); ctx.quadraticCurveTo(w * 0.7, h * 0.76, w * 0.72, h); ctx.fill();
    }
  };
  function camaras() {
    prepararRuido();
    const lineas = document.createElement('canvas'); lineas.width = 4; lineas.height = 3;
    const lx = lineas.getContext('2d'); lx.fillStyle = 'rgba(0,0,0,0.22)'; lx.fillRect(0, 0, 4, 1);
    const cams = [...document.querySelectorAll('[data-cam]')].map(cv => ({ cv, ctx: cv.getContext('2d'), tipo: cv.dataset.cam, presencia: 0, sacudida: 0 }));
    let patron = null;
    const medir = () => cams.forEach(c => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      c.w = c.cv.width = Math.round(c.cv.clientWidth * dpr);
      c.h = c.cv.height = Math.round(c.cv.clientHeight * dpr);
    });
    medir(); addEventListener('resize', medir);
    ScrollTrigger.create({
      trigger: '.seguridad', start: 'top 70%', end: 'bottom 30%',
      onUpdate: s => { cams[3].presencia = calma ? (s.progress > 0.5 ? 1 : 0) : LB.tramo(s.progress, 0.15, 0.85); }
    });
    let visible = false, ultimo = 0;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(document.querySelector('.monitores'));
    const pintar = (t) => {
      requestAnimationFrame(pintar);
      if (!visible || t - ultimo < (calma ? 1000 : 83)) return;
      ultimo = t;
      const d = new Date();
      const sello = `${LB.dos(d.getDate())}-${LB.dos(d.getMonth() + 1)}-${d.getFullYear()} ${LB.dos(d.getHours())}:${LB.dos(d.getMinutes())}:${LB.dos(d.getSeconds())}`;
      cams.forEach(c => {
        const { ctx, w, h } = c;
        if (!w) return;
        if (!patron) patron = ctx.createPattern(lineas, 'repeat');
        ctx.save();
        if (!calma && Math.random() < 0.012) c.sacudida = 3;
        if (c.sacudida > 0) { ctx.translate(0, (Math.random() - 0.5) * h * 0.12); c.sacudida--; }
        ESCENAS[c.tipo](ctx, w, h, t, c);
        ctx.restore();
        ctx.globalAlpha = 0.14; ctx.drawImage(ruido[Math.floor(Math.random() * 4)], 0, 0, w, h); ctx.globalAlpha = 1;
        ctx.fillStyle = patron; ctx.fillRect(0, 0, w, h);
        const fs = Math.max(11, Math.round(h * 0.058));
        ctx.font = `${fs}px ui-monospace, Menlo, Consolas, monospace`;
        ctx.fillStyle = '#d9e3d6';
        rotulos(c.tipo, t).forEach((r, k) => ctx.fillText(r, fs * 0.8, fs * (1.6 + k * 1.3)));
        const tw = ctx.measureText(sello).width;
        ctx.fillText(sello, w - tw - fs * 0.8, h - fs * 0.8);
        if (Math.floor(t / 1000) % 2 === 0) { ctx.fillStyle = '#c0281f'; ctx.beginPath(); ctx.arc(w - fs * 1.4, fs * 1.25, fs * 0.36, 0, Math.PI * 2); ctx.fill(); }
      });
    };
    requestAnimationFrame(pintar);
  }

  /* La asesora saluda al entrar en el acto 2 (su cara se apaga en el CSS según el acto) */
  function asesora() {
    let primera = true;
    LB.alCambiarActo((n) => {
      if (n === 2 && primera) {
        primera = false;
        if (Date.now() - LB.t0 > 20000) setTimeout(() => LB.marta('acto2', {}, { urgente: true }), 1200);
      }
    });
  }

  /* 64 cámaras, y la 64 te graba desde que entraste */
  function seguridad() {
    const p = document.getElementById('seguridad-texto');
    if (p) p.textContent = `64 cámaras. Ningún punto ciego. La 64 te graba desde ${LB.las(new Date(LB.t0))}, cuando entraste.`;
  }

  LB.acto2 = function () {
    seguridad();
    letras();
    opiniones();
    vecinos();
    cero();
    domos();
    camaras();
    asesora();
  };
})();
