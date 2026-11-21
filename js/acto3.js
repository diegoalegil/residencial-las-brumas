/* Acto 3: extraño de verdad */
(function () {
  const { calma, tactil, tramo, raiz } = LB;

  function semilla(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  /* Son las 05:40: la hora de verdad, y tres cosas que se saben de ella */
  function hora() {
    const S = LB.sabe;
    const caja = document.getElementById('hora-texto');
    const preg = document.getElementById('hora-pregunta');
    const pie = document.getElementById('hora-pie');
    const ponerHora = () => { caja.textContent = cap(LB.sonLas()) + '.'; };
    ponerHora();
    const h = new Date().getHours();
    preg.textContent = h === 3 ? '¿Tú también lo oyes subir?'
      : h < 6 ? '¿Por qué no duermes?'
      : h < 13 ? '¿Has dormido algo? Nosotros no.'
      : h < 20 ? 'Todavía es de día. No va a durar.'
      : h < 22 ? 'Ya van a apagar las farolas.'
      : '¿No deberías estar en la cama?';
    const lineas = () => {
      const hh = new Date().getHours(), f = S.franja();
      const momento = { madrugada: 'es de madrugada', manana: 'es por la mañana', tarde: 'es por la tarde', noche: 'es de noche' }[f];
      const segunda = hh === 3 ? 'Son las tres. A esta hora sube la escalera.'
        : (S.zona && S.zona.canarias ? 'En Canarias ' + momento : cap(momento)) + '. En la casa 14 siempre son las tres.';
      const tercera = S.nocturno()
        ? (S.telefono ? 'Baja el brillo. Así no se te ve la cara desde el pasillo.' : '¿Quién más está despierto en tu casa?')
        : 'Cuando se haga de noche, acuérdate de esto.';
      return [`Llevas ${LB.tiempoDentro()} en Las Brumas. Nadie te ha visto entrar.`, segunda, tercera];
    };
    let paso = 0;
    const ponerPie = () => { const l = lineas(); pie.textContent = calma ? l[0] + ' ' + l[1] : l[paso]; };
    let visible = false;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(document.querySelector('.hora'));
    setInterval(() => { if (!visible) return; ponerHora(); ponerPie(); }, 1000);
    ponerPie();

    const txt = preg.textContent;
    preg.setAttribute('aria-label', txt);
    preg.innerHTML = txt.split(' ').map(p => `<span class="w" aria-hidden="true">${[...p].map(c => `<span class="l">${c}</span>`).join('')}</span>`).join(' ');
    if (calma) return;
    ScrollTrigger.create({
      trigger: '.hora', start: 'top top', end: 'bottom bottom',
      onUpdate: st => { const n = st.progress < 0.38 ? 0 : st.progress < 0.72 ? 1 : 2; if (n !== paso) { paso = n; ponerPie(); } }
    });
    const r = semilla(7);
    const ls = preg.querySelectorAll('.l');
    gsap.timeline({ scrollTrigger: { trigger: '.hora', start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
      .to('.hora', { backgroundColor: '#6c7766', ease: 'none', duration: 1 }, 0)
      .to(ls, {
        x: () => (r() - 0.5) * innerWidth * 0.5,
        y: () => (r() - 0.2) * innerHeight * 0.6,
        rotation: () => (r() - 0.5) * 160,
        opacity: 0.18, ease: 'power2.in', duration: 0.7, stagger: { each: 0.01, from: 'random' }
      }, 0.3);
  }

  /* Más preguntas frecuentes: las respuestas son verdad ahora mismo */
  function saben() {
    const S = LB.sabe;
    const caja = document.getElementById('texto-saben');
    const quien = () => {
      const como = S.como();
      const r = S.reloj();
      const ahi = (como ? 'Y sabemos' : 'Sabemos') + ' qué hora es ahí: ' + r.charAt(0).toLowerCase() + r.slice(1);
      return 'No nos hace falta tu nombre.' + (como ? ` Sabemos que nos miras ${como}.` : '') + ' ' + ahi;
    };
    const cuanto = () => {
      const n = S.salidas;
      if (!n) return `${cap(LB.tiempoDentro())}. No te has ido a otra pestaña ni una vez. Buena señal.`;
      return `${cap(LB.tiempoDentro())}. Te fuiste a otra pestaña ${LB.veces(n)}, ${LB.duracion(S.fuera)} en total, y ${n === 1 ? 'volviste' : 'volviste siempre'}.`;
    };
    const bateria = () => {
      const b = S.bateria;
      if (!b) return null;
      if (b.cargando) return 'Lo tienes enchufado. Tienes todo el tiempo del mundo.';
      if (b.inicial - b.nivel >= 1) return `Entraste con el ${b.inicial} % y te queda el ${b.nivel} %. Haz la cuenta.`;
      return `Te queda el ${b.nivel} %. De sobra: esto no tarda.`;
    };
    const escribir = () => {
      const v = LB.visita;
      const bat = bateria();
      const o = S.origen;
      const items = [
        ['¿Saben quién soy?', quien()],
        ['¿Cuánto tiempo llevo aquí?', cuanto()],
        ['¿Puedo cancelar la visita?', v ? `La visita del ${v.dia} a las ${v.hora} no se puede cancelar. Ya ha empezado: llegaste antes.` : 'No reservaste ninguna. Te reservamos una igualmente: hoy, a las 03:00. Marta ya está en la puerta.'],
        o && ['¿Cómo llegué hasta aquí?', `Desde ${o.nombre}. ${o.buscador ? 'Buscabas otra cosa y nos encontraste a nosotros.' : 'Alguien quería que vinieras.'}`],
        ['¿Por qué la casa piloto es tan barata?', `Porque no se paga con dinero. Se paga con tiempo, y tú ya llevas ${LB.minutos()} pagando.`],
        ['¿Qué pasó con la familia anterior?', 'Nada. Siguen en la casa 14. Por la noche se les oye poner la mesa. Ahora ponen un plato más.'],
        ['¿Por qué los perros no quieren entrar?', 'Porque miran hacia donde tú no miras: arriba, al final de la escalera.'],
        bat && ['¿Me da tiempo a terminar?', bat],
        !S.sonido && ['¿Por qué no se oye nada?', 'Tienes el sonido apagado. Mejor: así, lo que oigas ahora mismo viene de tu casa.'],
        ['¿Quién más está leyendo esto?', 'Contigo, dos. No te gires todavía.'],
        ['¿Cómo salgo de aquí?', S.subidas >= 2 ? `Subiendo, no: ya lo intentaste ${LB.veces(S.subidas)}. Sigue bajando. Abajo te están esperando.` : 'No hace falta. Ya estás en casa.']
      ].filter(Boolean);
      caja.innerHTML = items.map(([p, r]) => `<p><strong>${esc(p)}</strong> ${esc(r)}</p>`).join('');
    };
    escribir();
    const reescribir = () => { const antes = caja.offsetHeight; escribir(); if (caja.offsetHeight !== antes) ScrollTrigger.refresh(); };
    ScrollTrigger.create({ trigger: '.saben', start: 'top bottom', onEnter: reescribir, onEnterBack: reescribir });
  }

  /* Notas de voz de la familia anterior (el texto está en guion.js) */
  function notas() {
    const lista = document.getElementById('lista-notas');
    const NOTAS = LB.guion.notas;
    const r = semilla(3);
    lista.innerHTML = NOTAS.map((n, i) => {
      const ultima = i === NOTAS.length - 1;
      const barras = Array.from({ length: 34 }, (_, k) => {
        const base = ultima ? 0.18 + 0.12 * Math.sin(k / 2.2) : 0.2 + r() * (0.45 + i * 0.06);
        return `<span style="height:${Math.round(Math.min(1, base) * 100)}%"></span>`;
      }).join('');
      const texto = (n.acotacion ? `(${n.acotacion}) ` : '') + n.texto;
      return `<article class="nota-voz" data-paso="${i}" data-quien="${esc(n.quien)}">
        <p class="nota-meta">${esc(n.quien)} · ${esc(n.fecha)} · ${esc(n.hora)} · ${esc(n.duracion)} <span class="nota-estado">No enviada</span></p>
        <div class="onda" aria-hidden="true">${barras}</div>
        <p class="nota-texto" data-texto="${esc(texto)}">${esc(texto)}</p>
      </article>`;
    }).join('');
    lista.querySelectorAll('.nota-texto').forEach((p, i) => {
      const completo = p.dataset.texto;
      let ya = null, aun = null;
      if (!calma) {
        p.innerHTML = '<span class="ya"></span><span class="aun"></span>';
        ya = p.firstChild; aun = p.lastChild;
        aun.textContent = completo;
      }
      ScrollTrigger.create({
        trigger: p, start: 'top 82%', once: true,
        onEnter: () => {
          const n = NOTAS[i];
          LB.avisa('lb:nota', { indice: i, quien: n.quien, fecha: n.fecha, hora: n.hora, duracion: n.duracion, acotacion: n.acotacion, texto: n.texto, ultima: i === NOTAS.length - 1 });
          if (calma) return;
          let k = 0;
          const id = setInterval(() => { k += 2; ya.textContent = completo.slice(0, k); aun.textContent = completo.slice(k); if (k >= completo.length) clearInterval(id); }, 28);
        }
      });
    });
  }

  /* Carteles de «Se busca»: la foto de cada uno es un recorte en fotocopia (de su dibujo, en el caso de Lucía) */
  const CARTELES = [
    ['lucia', '¿Has visto a Lucía?', '6 años. Casa 14. Desaparecida el 19 de marzo de 2025 con sus padres y su hermano Dani, de 3. Si la oyes llamarte desde el pinar, no contestes.',
      'dibujos', 1536, 1024, '426.667%', '-288.889%', '-80.556%', 'En lugar de una foto, un trozo de su dibujo: ella en la cama y una mano gris enorme sobre su cabeza.'],
    ['ernesto', 'Se busca', 'Ernesto B., 71 años. Casa 14. Salió con el perro por el pinar el 2 de noviembre de 2011. El perro volvió solo y no quiso entrar.',
      'vecinos', 1254, 1254, '316.667%', '-108.333%', '-108.081%', 'Foto de carné de Ernesto: un hombre mayor, calvo, con jersey oscuro.'],
    ['joaquin', 'Se busca', 'Joaquín M., 44 años. Casa 14. Visto por última vez el 12 de marzo de 1987, el día que les dieron las llaves. Su mujer, Marta, no lo ha denunciado: dice que sigue en casa.',
      'vecinos', 1254, 1254, '316.667%', '-108.333%', '-3.535%', 'Foto de carné de Joaquín: pelo rizado y cazadora de cuero.']
  ];
  function carteles() {
    const caja = document.getElementById('carteles');
    caja.innerHTML = CARTELES.map(([id, tit, txt, src, fw, fh, ancho, x, y, alt], i) => `
      <article class="cartel" data-mira="cartel:${id}" style="--giro:${[-3, 2.4, -1.4][i]}deg">
        <h3>${tit}</h3>
        <div class="cartel-foto"><img src="img/${src}.webp" alt="${esc(alt)}" width="${fw}" height="${fh}" loading="lazy" decoding="async" style="width: ${ancho}; left: ${x}; top: ${y}"></div>
        <p>${txt}</p>
        <div class="tiras" aria-hidden="true">${'<span>Casa 14</span>'.repeat(6)}</div>
      </article>`).join('');
    const tablon = document.getElementById('tablon');
    if (tablon) tablon.textContent = `Queda un hueco en el tablón. Ya tiene puesta la fecha de hoy: ${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' }).format(new Date())}.`;
  }

  /* La llamada (el texto está en guion.js). Las frases van apareciendo; si no caben, las primeras se van por arriba. */
  function llamada() {
    const LINEAS = LB.guion.llamada;
    const ol = document.getElementById('transcripcion');
    const sr = document.getElementById('transcripcion-sr');
    const linea = l => (l.acotacion ? `(${esc(l.acotacion)}) ` : '') + esc(l.texto);
    ol.innerHTML = LINEAS.map(l => `<li class="${l.quien ? '' : 'fin'}">${l.quien ? `<span class="quien">${esc(l.quien)}</span>` : ''}<span>${linea(l)}</span></li>`).join('');
    if (sr) sr.innerHTML = LINEAS.map(l => `<li>${l.quien ? esc(l.quien) + ': ' : ''}${linea(l)}</li>`).join('');
    const lis = [...ol.querySelectorAll('li')];
    let dichas = 0;
    const anunciar = n => {
      for (; dichas < n; dichas++) {
        const l = LINEAS[dichas];
        LB.avisa('lb:llamada', { indice: dichas, quien: l.quien, voz: l.voz, acotacion: l.acotacion || '', texto: l.texto, fin: !l.quien });
      }
    };
    const seccion = document.querySelector('.llamada');
    if (calma) {
      lis.forEach(li => li.classList.add('vista'));
      seccion.classList.add('final');
      ScrollTrigger.create({ trigger: '.llamada', start: 'top 60%', once: true, onEnter: () => anunciar(lis.length) });
      return;
    }
    let ultimo = -1;
    const colocar = n => {
      lis.forEach((li, i) => { li.classList.toggle('vista', i < n); li.classList.remove('pasada'); });
      for (let i = 0; i < n - 1 && ol.scrollHeight > ol.clientHeight + 1; i++) lis[i].classList.add('pasada');
    };
    ScrollTrigger.create({
      trigger: '.llamada', start: 'top top', end: 'bottom bottom',
      onEnter: () => LB.precargar('.llamada-fondo img'),
      onUpdate: st => {
        const n = Math.floor(tramo(st.progress, 0.04, 0.76) * lis.length + 0.5);
        if (n === ultimo) return;
        ultimo = n;
        colocar(n);
        anunciar(n);
        /* Cuando termina la transcripción, se ve dónde acabó: la patrulla vacía delante de la casa */
        seccion.classList.toggle('final', n >= lis.length);
      }
    });
    addEventListener('resize', () => { if (ultimo >= 0) colocar(ultimo); });
  }

  /* El contrato se firma solo */
  function contrato() {
    const leido = document.getElementById('leido');
    let empezado = 0;
    ScrollTrigger.create({ trigger: '.documento', start: 'top 70%', once: true, onEnter: () => { empezado = Date.now(); } });
    ScrollTrigger.create({
      trigger: leido, start: 'top 88%', once: true,
      onEnter: () => {
        const d = new Date(), S = LB.sabe;
        const s = empezado ? Math.max(1, Math.round((Date.now() - empezado) / 1000)) : 0;
        const desde = S.dispositivo ? ', ' + S.dispositivo.desde : '';
        const tiempo = !s ? '' : s < 4 ? `, en ${s} ${s === 1 ? 'segundo' : 'segundos'}. Sin leerlo. Firmado igual.` : `, en ${s} segundos. Firmado.`;
        leido.textContent = `Leído el ${d.toLocaleDateString('es-ES')} a ${LB.las(d)}${desde}${tiempo || '. Firmado.'}`;
        leido.classList.add('listo');
      }
    });
    ScrollTrigger.create({
      trigger: '.firmas', start: 'top 85%', once: true,
      onEnter: () => document.querySelectorAll('.firma-trazo').forEach((f, i) => setTimeout(() => f.classList.add('firmada'), i * 900))
    });
  }

  /* El cristal (foto de cristal.webp): un velo de vaho encima que respira y se va abriendo.
     Primero se lee «NO ENTRES» (al revés, de derecha a izquierda), luego golpean las dos manos
     y al final alguien escribe «YA ES TARDE» con el dedo. Las posiciones son fracciones de la foto. */
  function cristal() {
    const pieCristal = document.getElementById('cristal-pie');
    if (pieCristal) pieCristal.textContent = tactil
      ? 'Alguien respiró contra el cristal. Desde dentro. Tú lo estás tocando desde fuera.'
      : 'Alguien respiró contra el cristal. Desde dentro. A la altura de tu cara.';
    const cv = document.getElementById('vaho');
    const ctx = cv.getContext('2d');
    const nube = document.createElement('canvas'); nube.width = nube.height = 256;
    const nx = nube.getContext('2d');
    const g = nx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(178,184,176,0.55)'); g.addColorStop(0.55, 'rgba(178,184,176,0.22)'); g.addColorStop(1, 'rgba(178,184,176,0)');
    nx.fillStyle = g; nx.fillRect(0, 0, 256, 256);
    const r = semilla(5);
    const manchas = Array.from({ length: 12 }, () => ({ x: (r() - 0.5) * 0.8, y: (r() - 0.5) * 0.7, s: 0.22 + r() * 0.2 }));
    const manos = [{ x: 0.245, y: 0.40, umbral: 0.42, t: 0 }, { x: 0.70, y: 0.40, umbral: 0.54, t: 0 }];
    let w = 0, h = 0, p = 0, visible = false, pintado = '';
    const medir = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = cv.width = Math.round(cv.clientWidth * dpr);
      h = cv.height = Math.round(cv.clientHeight * dpr);
      pintado = '';
    };
    medir(); addEventListener('resize', medir);
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) medir(); }).observe(cv);
    ScrollTrigger.create({
      trigger: '.cristal', start: 'top top', end: 'bottom bottom',
      onEnter: () => LB.precargar('.cristal-foto img'),
      onUpdate: s => {
        p = s.progress;
        manos.forEach(m => {
          if (p > m.umbral && !m.t) { m.t = performance.now(); if (LB.golpe) LB.golpe(); }
          if (p < m.umbral - 0.04) m.t = 0;
        });
        pieCristal.style.opacity = p < 0.3 ? 1 : 0;
      }
    });
    /* Hueco suave en el velo (destination-out) */
    function hueco(cx, cy, rx, ry, fuerza) {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(rx, ry);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      gr.addColorStop(0, `rgba(0,0,0,${fuerza})`); gr.addColorStop(0.45, `rgba(0,0,0,${fuerza * 0.75})`); gr.addColorStop(0.75, `rgba(0,0,0,${fuerza * 0.3})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    /* Letras escritas con el dedo desde dentro: se leen al revés y aparecen de derecha a izquierda */
    function frase(texto, y, tam, avance) {
      if (avance <= 0) return;
      ctx.save();
      ctx.translate(w / 2, y); ctx.scale(-1, 1);
      ctx.font = `600 ${tam}px "STIX Two Text", serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const ancho = ctx.measureText(texto).width;
      ctx.beginPath(); ctx.rect(-ancho / 2 - 10, -tam, (ancho + 20) * avance, tam * 2); ctx.clip();
      ctx.lineWidth = tam * 0.06; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = tam * 0.12;
      ctx.fillStyle = ctx.strokeStyle = 'rgba(8,10,9,0.62)';
      ctx.strokeText(texto, 0, 0); ctx.fillText(texto, 0, 0);
      ctx.restore();
    }
    const pintar = (t) => {
      requestAnimationFrame(pintar);
      if (!visible || !w) return;
      /* Con movimiento reducido no respira y todo cambia por tramos: solo se repinta si algo cambia */
      const clave = calma ? [w, h, p < 0.15, p < 0.4, p < 0.7, manos[0].t > 0, manos[1].t > 0].join() : '';
      if (calma && clave === pintado) return;
      pintado = clave;
      const resp = calma ? 0.6 : 0.5 - 0.5 * Math.cos(t / 1000 * Math.PI * 2 / 3.8);
      const velo = calma ? (p < 0.4 ? 0.88 : p < 0.7 ? 0.62 : 0.4) : 0.92 - 0.57 * tramo(p, 0.05, 0.9);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgba(4,5,5,${velo.toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
      const base = Math.min(w, h);
      ctx.globalAlpha = 0.1 + 0.2 * resp;
      manchas.forEach(m => {
        const rad = base * m.s * (0.95 + 0.3 * resp) * (0.9 + p * 0.4);
        ctx.drawImage(nube, w * (0.5 + m.x) - rad, h * (0.5 + m.y) - rad, rad * 2, rad * 2);
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-out';
      /* «NO ENTRES» de la foto: se despeja de derecha a izquierda */
      const a = calma ? (p > 0.15 ? 1 : 0) : tramo(p, 0.1, 0.36);
      if (a > 0) {
        /* como un dedo que limpia: huecos suaves en fila, de x = 0,85 hacia la izquierda */
        const n = Math.ceil(14 * a);
        for (let k = 0; k < n; k++) {
          const f = Math.min(1, 14 * a - k);
          hueco(w * (0.85 - k * 0.05), h * 0.69, w * 0.075, h * 0.085, 0.8 * f);
        }
      }
      /* Las manos: al golpear, el hueco se abre de golpe y se asienta (280 ms) */
      const ahora = performance.now();
      manos.forEach(m => {
        if (!m.t) return;
        const e = calma ? 1 : Math.min(1, (ahora - m.t) / 280);
        const k = 1 + 0.14 * (1 - e * (2 - e));
        hueco(w * m.x, h * m.y, w * 0.19 * k, h * 0.27 * k, 0.9);
      });
      ctx.globalCompositeOperation = 'source-over';
      frase('YA ES TARDE', h * 0.89, Math.min(w * 0.12, h * 0.07), calma ? (p > 0.7 ? 1 : 0) : tramo(p, 0.66, 0.92));
    };
    requestAnimationFrame(pintar);
  }

  /* Rastro del puntero y puntero que llega tarde */
  function rastro() {
    if (calma || tactil) return;
    const cv = document.getElementById('rastro');
    const ctx = cv.getContext('2d');
    const pts = [];
    let w = 0, h = 0, dpr = 1;
    const falso = { x: innerWidth / 2, y: innerHeight / 2 };
    const medir = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr; };
    medir(); addEventListener('resize', medir);
    addEventListener('pointermove', e => { if (LB.acto >= 3) pts.push({ x: e.clientX, y: e.clientY, t: performance.now() }); }, { passive: true });
    let limpio = true;
    const pintar = (t) => {
      requestAnimationFrame(pintar);
      const lento = LB.acto >= 4 && !LB.libre;
      raiz.classList.toggle('puntero-lento', lento);
      if (LB.acto < 3 || LB.libre) { if (!limpio) { ctx.clearRect(0, 0, w, h); limpio = true; } pts.length = 0; return; }
      limpio = false;
      ctx.clearRect(0, 0, w, h);
      while (pts.length && t - pts[0].t > 1100) pts.shift();
      const claro = LB.acto >= 4;
      pts.forEach(pt => {
        const a = 1 - (t - pt.t) / 1100;
        ctx.fillStyle = claro ? `rgba(214,208,196,${(a * 0.22).toFixed(3)})` : `rgba(110,18,12,${(a * 0.42).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(pt.x * dpr, pt.y * dpr, (3 + a * 9) * dpr, 0, Math.PI * 2); ctx.fill();
      });
      if (lento) {
        falso.x += (LB.puntero.x - falso.x) * 0.06;
        falso.y += (LB.puntero.y - falso.y) * 0.06;
        ctx.save(); ctx.translate(falso.x * dpr, falso.y * dpr); ctx.scale(dpr, dpr);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 18); ctx.lineTo(4.6, 13.6); ctx.lineTo(7.8, 20.6); ctx.lineTo(10.4, 19.4); ctx.lineTo(7.4, 12.6); ctx.lineTo(13, 12.6); ctx.closePath();
        ctx.fillStyle = '#f1ede4'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#050505'; ctx.stroke(); ctx.restore();
      } else { falso.x = LB.puntero.x; falso.y = LB.puntero.y; }
    };
    requestAnimationFrame(pintar);
  }

  /* Aberración de color que crece (el grano usa la textura de comun.js) */
  function grano() {
    if (calma) { raiz.style.setProperty('--aberr', '1.5'); return; }
    gsap.fromTo(raiz, { '--aberr': 0 }, { '--aberr': 5, ease: 'none', scrollTrigger: { trigger: '.acto-3', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  LB.acto3 = function () {
    hora();
    saben();
    notas();
    carteles();
    llamada();
    contrato();
    cristal();
    rastro();
    grano();
  };
})();
