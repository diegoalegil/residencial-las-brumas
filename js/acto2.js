/* Acto 2: algo no cuadra */
(function () {
  const { calma, azar } = LB;

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
    /* La misma foto, cada vez un poco más cerca; la última es de 1987 y tiene la misma cara */
    pista.innerHTML = saltos.map((s, i) => `
      <article class="resena">
        <div class="resena-cara">${s === null
          ? '<img src="img/marta-1987.webp" alt="Foto antigua con la fecha 14 de marzo de 1987 impresa en la esquina: Marta delante de la casa 14, con la misma cara y la misma rebeca que hoy." width="1254" height="1254" loading="lazy" decoding="async">'
          : `<img src="img/marta.webp" alt="Foto de Marta, sonriendo." width="1254" height="1254" loading="lazy" decoding="async" style="--cerca: ${(1 + i * 0.14).toFixed(2)}">`}</div>
        <p class="estrellas" aria-label="Cinco estrellas">★★★★★</p>
        <blockquote><p>${RESENAS[i]}</p></blockquote>
        <p class="firma">Marta G. · casa 14<br><time>${s === null ? '12 de marzo de —' : '12 de marzo de ' + (anio + s)}</time></p>
      </article>`).join('');
    if (calma) return;
    gsap.to(pista, {
      x: () => -(pista.scrollWidth - innerWidth + 2 * parseFloat(getComputedStyle(pista.parentElement).paddingLeft)),
      ease: 'none',
      scrollTrigger: { trigger: '.opiniones', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true }
    });
  }

  /* Vecinos: nueve fotos de carné que miran a la cámara, hasta que todos miran por encima de tu hombro.
     Cada uno es un recorte de la misma rejilla (vecinos.webp / vecinos-detras.webp). */
  const VECINOS = [['Amparo', 0, 0], ['Joaquín', 1, 0], ['Elena', 2, 0], ['Javi', 0, 1], ['Ernesto', 1, 1], ['Adrián', 2, 1], ['Pilar', 0, 2], ['Tomás', 1, 2], ['Maribel', 2, 2]];
  const COL = ['-3.535%', '-108.333%', '-213.131%'], FIL = ['-3.535%', '-108.081%', '-212.879%'];
  function vecinos() {
    const ul = document.getElementById('rejilla-caras');
    const detras = document.getElementById('detras');
    const foto = (src, clase) => `<img class="${clase}" src="img/${src}.webp" alt="" width="1254" height="1254" loading="lazy" decoding="async">`;
    ul.innerHTML = VECINOS.map(([nombre, c, f]) => `<li data-mira="vecino:${nombre}"><div class="vecino-cara" style="--x: ${COL[c]}; --y: ${FIL[f]}">${foto('vecinos', 'mira-camara')}${foto('vecinos-detras', 'mira-detras')}</div><p>${nombre} · casa 14</p></li>`).join('');
    const celdas = [...ul.children];
    let fase2 = false, esperas = [];
    /* Corte seco, cada uno a su tiempo (todos a la vez con movimiento reducido) */
    const girar = (si) => {
      esperas.forEach(clearTimeout); esperas = [];
      celdas.forEach(li => {
        const f = () => li.classList.toggle('mira', si);
        if (calma) f(); else esperas.push(setTimeout(f, azar(0, 900)));
      });
    };
    ScrollTrigger.create({
      trigger: '.vecinos', start: 'top top', end: 'bottom bottom',
      onEnter: () => LB.precargar(ul.querySelectorAll('.mira-detras')),
      onUpdate: s => {
        const quiere = s.progress > 0.52;
        if (quiere !== fase2) {
          fase2 = quiere;
          girar(fase2);
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

  /* Circuito cerrado: cuatro cámaras, una te enfoca a ti. Los rótulos de la 64 son tuyos y van en directo. */
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
  function camaras() {
    const caja = document.querySelector('.monitores');
    const cams = [...caja.querySelectorAll('[data-cam]')].map(m => ({ m, tipo: m.dataset.cam, rotulo: m.querySelector('.osd-rotulo'), hora: m.querySelector('.osd-hora') }));
    const tu = caja.querySelector('[data-cam="tu"]');
    const d2 = LB.dos;
    let visible = false, reloj = 0;
    /* Rótulos y hora con segundos, una vez por segundo y solo mientras se ven */
    const latir = () => {
      const d = new Date(), t = performance.now();
      const sello = `${d2(d.getDate())}-${d2(d.getMonth() + 1)}-${d.getFullYear()} ${d2(d.getHours())}:${d2(d.getMinutes())}:${d2(d.getSeconds())}`;
      cams.forEach(c => {
        const txt = rotulos(c.tipo, t).join('\n');
        if (c.rotulo.textContent !== txt) c.rotulo.textContent = txt;
        c.hora.textContent = sello;
        if (!calma && Math.random() < 0.035) { c.m.classList.add('salto'); setTimeout(() => c.m.classList.remove('salto'), 240); }
      });
      reloj = visible ? setTimeout(latir, 1000 - new Date().getMilliseconds()) : 0;
    };
    latir();
    new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      caja.classList.toggle('vivo', visible && !calma);
      if (visible && !reloj) latir();
    }, { rootMargin: '100px 0px' }).observe(caja);

    /* La 64: la puerta de detrás está vacía hasta que avanzas (a la vez que el relé del sonido).
       Si la puerta aún no se ve, espera a que se vea: está en la mitad de arriba de la imagen,
       así que basta con ver el 45 % de la cámara (en la mayoría de móviles coincide con el relé). */
    let pasa = false, enVista = false, hecho = false;
    const aparecer = () => {
      if (hecho || !pasa || !enVista) return;
      hecho = true;
      if (calma) { tu.classList.add('aparece'); return; }
      tu.classList.add('corte');
      setTimeout(() => { tu.classList.add('aparece'); tu.classList.remove('corte'); }, 200);
    };
    new IntersectionObserver(es => { enVista = es[0].intersectionRatio >= 0.45; aparecer(); }, { threshold: [0, 0.45, 1] }).observe(tu);
    ScrollTrigger.create({
      trigger: '.seguridad', start: 'top 60%', end: 'bottom 30%',
      onEnter: () => LB.precargar(tu.querySelectorAll('.cam-despues')),
      onUpdate: s => { if (LB.tramo(s.progress, 0.15, 0.85) >= 0.5) { pasa = true; aparecer(); } }
    });
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
    camaras();
    asesora();
  };
})();
