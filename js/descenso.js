/* Actos 4 y 5: el pasillo, la calma falsa, la figura y la vuelta al principio */
(function () {
  const { calma, tramo, clamp, azar, raiz } = LB;
  /* Susurros: algunos dicen lo que es verdad ahora mismo (la hora, tu batería, tu mano) */
  const S = () => LB.sabe;
  const SUSURROS = [
    [0.07, 0.15, () => '¿Lo oyes?', 0.12, 0.3], [0.13, 0.21, () => 'cuenta las puertas', 0.66, 0.22],
    [0.19, 0.27, () => 'siete', 0.2, 0.72],
    [0.24, 0.32, () => { const b = S().bateria; return b && !b.cargando ? `te queda el ${b.nivel} %` : 'no corras'; }, 0.55, 0.66],
    [0.3, 0.38, () => 'te ha oído', 0.08, 0.5], [0.36, 0.44, () => 'ocho', 0.78, 0.4],
    [0.41, 0.49, () => LB.sonLas(), 0.3, 0.18],
    [0.46, 0.53, () => LB.tactil ? 'no levantes el dedo' : 'quita la mano del ratón', 0.5, 0.8],
    [0.7, 0.78, () => 'no te gires', 0.1, 0.24], [0.75, 0.83, () => 'hay sitio para ti', 0.6, 0.74]
  ];
  const CENTRO = [[0.58, 0.635, 'Ya está.'], [0.6, 0.655, 'Ya está. Ya pasó.'], [0.915, 1.01, 'Ya estás dentro.']];

  /* El pasillo son cinco fotos del mismo sitio (noche, figura al fondo, luz, figura cerca y la cara).
     Las cuatro lámparas no se ven: deciden cuánta sombra cae encima, y las fotos solo cambian a oscuras. */
  let caja, fotos = {}, sombra, W = 0, H = 0;
  let Pobj = 0, P = 0, activo = false;
  const lamp = [0, 1, 2, 3].map(() => ({ on: true, hasta: 0, nivel: 1 }));
  let caraVisible = false, caraCambio = 0, ultimoChillido = 0;
  let quiere = 'noche', vista = 'noche', saltoQuiere = 0, saltoVista = 0;
  const facil = gsap.parseEase('power1.inOut');

  /* Dónde cae un punto de la foto (u, v) dentro de la pantalla con object-fit: cover; sirve de centro del zoom */
  const ENFOQUE = { noche: [0.5, 0.43, 0.45], figura: [0.5, 0.43, 0.45], luz: [0.5, 0.43, 0.45], cerca: [0.49, 0.3, 0.25], cara: [0.5, 0.3, 0.12] };
  const origen = {};
  function medir() {
    W = caja.clientWidth; H = caja.clientHeight;
    Object.keys(ENFOQUE).forEach(k => {
      const [u, v, py] = ENFOQUE[k], s = Math.max(W / 1024, H / 1536), dw = 1024 * s, dh = 1536 * s;
      origen[k] = `${((W - dw) * 0.5 + u * dw).toFixed(1)}px ${((H - dh) * py + v * dh).toFixed(1)}px`;
      fotos[k].style.transformOrigin = origen[k];
    });
  }

  /* Lámparas que fallan: un solo apagón a la vez y como mucho uno cada 0,7 s, nada de destellos seguidos */
  function actualizarLamparas(t, fase) {
    lamp.forEach((l, i) => {
      if (fase === 'apagon') { l.nivel += (0 - l.nivel) * 0.25; return; }
      if (fase === 'calma' || calma) { l.nivel += ((fase === 'calma' ? 1.45 : 1.05) - l.nivel) * 0.2; l.on = true; return; }
      if (t > l.hasta) {
        const nervio = fase === 'figura' ? 0.5 : 1;
        if (l.on) {
          if (t > proximoApagon && lamp.every(o => o.on)) {
            l.on = false; l.hasta = t + azar(160, 520); proximoApagon = l.hasta + 700;
          } else l.hasta = t + azar(400, 1600) * nervio;
        } else { l.on = true; l.hasta = t + azar(1400, 5200) * nervio; }
      }
      const meta = l.on ? 0.92 + Math.sin(t / 90 + i) * 0.05 : 0.06;
      l.nivel += (meta - l.nivel) * 0.5;
    });
  }
  let proximoApagon = 0;
  /* Todas a la vez, para cambiar de foto sin que se vea el cambio */
  function apagarTodo(t, ms) { lamp.forEach(l => { l.on = false; l.hasta = t + ms; }); proximoApagon = Math.max(proximoApagon, t + ms + 700); }

  let mostrada = '';
  function mostrar(k) {
    if (k === mostrada) return;
    if (mostrada) fotos[mostrada].classList.remove('activa');
    if (k) fotos[k].classList.add('activa');
    mostrada = k;
  }
  let sombraPuesta = -1;
  function oscurecer(o) {
    const v = Math.round(clamp(o, 0, 1) * 100) / 100;
    if (v !== sombraPuesta) { sombra.style.opacity = v; sombraPuesta = v; }
  }
  const mover = (k, x, y, esc, giro = 0) => { fotos[k].style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${esc.toFixed(4)})${giro ? ` rotate(${giro}deg)` : ''}`; };

  /* Un fotograma */
  function pintar(t) {
    requestAnimationFrame(pintar);
    if (!activo || !W) return;
    const pesado = LB.acto === 4 && !calma;
    P += (Pobj - P) * (calma ? 1 : pesado ? 0.045 : 0.14);
    let fase = 'pasillo';
    if (P >= 0.5 && P < 0.575) fase = 'apagon';
    else if (P >= 0.575 && P < 0.66) fase = 'calma';
    else if (P >= 0.66 && P < 0.86) fase = 'figura';
    else if (P >= 0.86 && P < 0.905) fase = 'cara';
    else if (P >= 0.905) fase = 'negro';
    LB.oscuridad = { P, fase };

    if (fase === 'cara' && !calma) {
      if (!caraVisible && t - caraCambio > 700) { caraVisible = true; caraCambio = t; if (t - ultimoChillido > 3000) { ultimoChillido = t; if (LB.chillido) LB.chillido(); } }
    } else if (caraVisible && t - caraCambio > 700) { caraVisible = false; caraCambio = t; }
    fotos.cara.style.opacity = '';
    /* La cara, con flash, encima de todo y temblando */
    if (caraVisible) {
      const k = tramo(P, 0.86, 0.905), tb = (1 - k) * 10 + 3;
      mostrar('cara'); oscurecer(0);
      mover('cara', azar(-tb, tb), azar(-tb, tb), 1.04 + 0.21 * k, Math.floor(t / 110) % 5 === 0 ? 1.2 : 0);
      return;
    }
    if (fase === 'negro' || (fase === 'cara' && !calma)) { oscurecer(1); return; }

    actualizarLamparas(t, fase);
    const media = lamp.reduce((s, l) => s + l.nivel, 0) / lamp.length;
    LB.oscuridad.luz = media;
    const oscuro = 1 - Math.pow(clamp((media - 0.25) / 0.67, 0, 1), 1.4);

    /* Qué foto toca y cuánto zoom */
    let deseo = vista, salto = 0, esc = 1, k = 0;
    if (fase === 'pasillo') {
      const etapa = P < 0.2 ? 0 : P < 0.32 ? 1 : P < 0.44 ? 2 : 3;
      deseo = etapa ? 'figura' : 'noche'; salto = Math.max(0, etapa - 1) * 0.07;
      k = facil(tramo(calma ? Math.round(P * 14) / 14 : P, 0.04, 0.5));
      esc = 1 + 0.28 * k;
    } else if (fase === 'apagon') {
      deseo = vista; salto = saltoVista; k = 1; esc = 1.28;
    } else if (fase === 'calma') {
      deseo = 'luz';
    } else if (fase === 'figura') {
      const q = Math.floor(tramo(P, 0.66, 0.86) * 22) / 22;
      if (q < 0.42) { deseo = 'figura'; esc = 1 + 0.5 * q / 0.42; } else { deseo = 'cerca'; esc = 1 + 0.45 * (q - 0.42) / 0.58; }
    } else if (fase === 'cara') {
      deseo = 'cerca'; esc = 1.45;
    }
    /* Cambiar de foto solo a oscuras (en la calma y con movimiento reducido, al momento) */
    if (deseo !== quiere || salto !== saltoQuiere) {
      quiere = deseo; saltoQuiere = salto;
      if (!calma && fase !== 'calma' && fase !== 'apagon') apagarTodo(t, 380);
    }
    if (calma || fase === 'calma' || oscuro > 0.7) { vista = quiere; saltoVista = saltoQuiere; }
    mostrar(vista);
    oscurecer(oscuro);
    if (calma) {
      fotos[vista].style.transform = '';
      if (fase === 'cara') { fotos.cara.classList.add('activa'); fotos.cara.style.opacity = tramo(P, 0.86, 0.9); }
      else if (mostrada !== 'cara') fotos.cara.classList.remove('activa');
      return;
    }
    /* Andar: un balanceo leve y el paso */
    const x = Math.sin(t / 1900) * W * 0.004;
    const y = fase === 'pasillo' ? Math.sin(k * 52) * H * 0.003 : 0;
    mover(vista, x, y, (vista === 'figura' || vista === 'noche' ? esc + saltoVista : esc));
  }

  /* Textos: susurros y frases en el centro */
  function textos() {
    const caja = document.getElementById('susurros');
    caja.innerHTML = SUSURROS.map(s => `<span style="left:${s[3] * 100}%;top:${s[4] * 100}%"></span>`).join('');
    const spans = caja.querySelectorAll('span');
    const vivos = SUSURROS.map(() => false);
    const centro = document.getElementById('centro');
    const rotulo = document.getElementById('rotulo');
    const rotuloHora = document.getElementById('rotulo-hora');
    let ultimo = '';
    setInterval(() => {
      if (!activo) return;
      SUSURROS.forEach((s, i) => {
        const k = tramo(P, s[0], s[1]);
        const vivo = k > 0 && k < 1;
        if (vivo && !vivos[i]) {
          spans[i].textContent = s[2]();
          LB.avisa('lb:susurro', { indice: i, texto: spans[i].textContent });
        }
        vivos[i] = vivo;
        const o = vivo ? Math.sin(k * Math.PI) : 0;
        spans[i].style.opacity = o.toFixed(2);
        spans[i].style.transform = calma ? 'none' : `translateY(${(-k * 14).toFixed(1)}px)`;
      });
      if (rotuloHora) { const h = LB.hora(); rotuloHora.textContent = h.slice(0, 2) === '03' ? 'En tu reloj, también.' : `En tu reloj, ${LB.las()}.`; }
      const c = CENTRO.slice().reverse().find(([a, b]) => P >= a && P < b);
      const texto = c ? c[2] : '';
      if (texto !== ultimo) {
        ultimo = texto;
        if (texto) LB.avisa('lb:centro', { texto });
        if (texto === 'Ya estás dentro.' && !calma) {
          centro.textContent = ''; centro.classList.add('visible');
          let i = 0; const id = setInterval(() => { centro.textContent = texto.slice(0, ++i); if (i >= texto.length || ultimo !== texto) clearInterval(id); }, 110);
        } else { centro.textContent = texto; centro.classList.toggle('visible', !!texto); }
      }
      rotulo.style.opacity = P < 0.12 ? 1 : 0;
      LB.calmaFalsa = P >= 0.575 && P < 0.66;
    }, 50);
  }

  /* Scroll pesado y avance contra tu voluntad */
  function pesadez() {
    if (calma) return;
    let destino = null, raf = 0;
    const zona = () => LB.acto === 4 && P > 0.03 && P < 0.5;
    addEventListener('wheel', e => {
      if (!zona() || e.ctrlKey) return;
      e.preventDefault();
      if (destino === null) destino = scrollY;
      destino += e.deltaY * (e.deltaMode === 1 ? 16 : 1) * 0.32;
      if (!raf) raf = requestAnimationFrame(paso);
    }, { passive: false });
    function paso() {
      raf = 0;
      if (destino === null) return;
      const d = destino - scrollY;
      if (Math.abs(d) < 1) { destino = null; return; }
      scrollTo(0, scrollY + d * 0.1);
      raf = requestAnimationFrame(paso);
    }
    setInterval(() => {
      if (!zona() || P < 0.08 || P > 0.46 || LB.quieto < 4500 || document.hidden || destino !== null) return;
      const ini = scrollY, t0 = performance.now();
      const empuje = () => { const k = Math.min(1, (performance.now() - t0) / 1800); scrollTo(0, ini + 160 * k * k * (3 - 2 * k)); if (k < 1 && LB.quieto > 300) requestAnimationFrame(empuje); };
      empuje();
    }, 2500);
  }

  /* Bienvenido a casa: no te deja irte, un rato */
  function trampa() {
    const texto = document.getElementById('trampa-texto');
    const salir = document.getElementById('salir');
    const velo = document.getElementById('velo');
    const datos = document.getElementById('bienvenido-datos');
    const frases = ['¿A dónde vas?', 'Arriba ya no queda nadie.', 'Tu plato ya está en la mesa.', 'Lucía quiere que te quedes.'];
    const contar = () => {
      if (!datos) return;
      const S = LB.sabe, entrada = new Date(LB.t0), ya = new Date();
      const n = S.salidas;
      const horas = LB.hora(entrada) === LB.hora(ya)
        ? `Entraste a ${LB.las(entrada)} y todavía ${LB.sonLas(ya)}. Aquí el tiempo no pasa.`
        : `Entraste a ${LB.las(entrada)} y ya ${LB.sonLas(ya)}.`;
      const fuera = n === 0 ? 'No te fuiste ni una vez.' : n === 1 ? 'Te fuiste una vez y volviste.' : n === 2 ? 'Te fuiste dos veces y volviste las dos.' : `Te fuiste ${LB.veces(n)} y volviste todas.`;
      datos.textContent = horas + ' ' + fuera;
    };
    const final = document.getElementById('bienvenido');
    ScrollTrigger.create({ trigger: '.bienvenido', start: 'top 80%', onEnter: () => { contar(); final.classList.add('vista'); }, onEnterBack: contar });
    /* Mientras se ve el final, Marta sale arriba para no tapar «Salir de Las Brumas» */
    ScrollTrigger.create({ trigger: '.bienvenido', start: 'top 80%', end: 'bottom top', toggleClass: { targets: raiz, className: 'al-final' } });
    let activa = false, intentos = 0, yFin = 0, inicio = 0, tirando = false, reloj = 0;
    if (calma) salir.textContent = 'Volver al principio';
    function onScroll() {
      if (!activa || tirando) return;
      if (scrollY < yFin - 30) {
        tirando = true;
        texto.textContent = frases[Math.min(intentos, frases.length - 1)];
        intentos++;
        const desde = scrollY, t0 = performance.now();
        const tirar = () => {
          const k = Math.min(1, (performance.now() - t0) / 520);
          scrollTo(0, desde + (yFin - desde) * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(tirar); else { tirando = false; if (intentos >= 4) liberar(); }
        };
        requestAnimationFrame(tirar);
      }
    }
    function empezar() {
      LB.marcarFinal();
      if (calma || activa) return;
      activa = true; intentos = 0; inicio = Date.now(); LB.libre = false;
      yFin = document.documentElement.scrollHeight - innerHeight;
      addEventListener('scroll', onScroll, { passive: true });
      clearTimeout(reloj);
      reloj = setTimeout(liberar, 9000);
    }
    function liberar() {
      if (!activa && !calma) return;
      activa = false; clearTimeout(reloj);
      removeEventListener('scroll', onScroll);
      LB.libre = true;
      texto.textContent = 'Puedes irte. Te dejamos la puerta abierta, para cuando vuelvas.';
      setTimeout(regreso, calma ? 0 : 1600);
    }
    function regreso() {
      const hacer = () => {
        raiz.classList.add('regreso');
        LB.casaDeNoche();
        const verbo = document.querySelector('.titulo-hero .verbo');
        if (verbo) verbo.textContent = 'estaba';
        LB.titulos[1] = 'Residencial Las Brumas · Tu nuevo hogar te estaba esperando';
        LB.regreso = true;
        scrollTo(0, 0);
        LB.fijarActo(1);
        document.title = LB.titulos[1];
        ScrollTrigger.update();
        setTimeout(() => LB.marta('regreso', {}, { urgente: true, soloActo: 1 }), 2600);
      };
      if (calma) { hacer(); document.getElementById('titulo-hero').focus({ preventScroll: true }); return; }
      velo.classList.add('cubre');
      setTimeout(() => { hacer(); setTimeout(() => velo.classList.remove('cubre'), 400); }, 950);
    }
    salir.addEventListener('click', () => { if (calma) { regreso(); return; } if (!activa) { activa = true; } liberar(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && activa) liberar(); });
    ScrollTrigger.create({ trigger: '.bienvenido', start: 'bottom bottom+=2', onEnter: empezar });
  }

  LB.descenso = function () {
    caja = document.getElementById('pasillo');
    caja.querySelectorAll('img').forEach(img => { fotos[img.dataset.foto] = img; });
    sombra = caja.querySelector('.pasillo-sombra');
    medir();
    addEventListener('resize', medir);
    /* Las fotos del pasillo y del final, listas antes de llegar */
    LB.alCambiarActo(n => { if (n >= 3) LB.precargar('#pasillo img, .bienvenido-foto img, .foto-noche'); });
    ScrollTrigger.create({
      trigger: '#oscuridad', start: 'top top', end: 'bottom bottom',
      onUpdate: s => { Pobj = s.progress; },
      onToggle: s => { activo = s.isActive || s.progress > 0 && s.progress < 1; }
    });
    new IntersectionObserver(es => { activo = es[0].isIntersecting; }).observe(caja);
    let medido = false;
    LB.alCambiarActo(n => { if (n === 4 && !medido) { medido = true; ScrollTrigger.refresh(); } });
    textos();
    pesadez();
    trampa();
    requestAnimationFrame(pintar);
  };
})();
