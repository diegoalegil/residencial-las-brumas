/* Piezas comunes: actos, tiempo, puntero, vigilancia y la asesora */
(function () {
  const raiz = document.documentElement;
  const calma = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tactil = matchMedia('(hover: none), (pointer: coarse)').matches;
  const t0 = Date.now();
  if (calma) raiz.classList.add('calma');

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const azar = (a, b) => a + Math.random() * (b - a);
  const tramo = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const dos = n => String(n).padStart(2, '0');

  /* Puntero y actividad */
  const puntero = { x: innerWidth * 0.5, y: innerHeight * 0.4, movido: false };
  let ultimaActividad = Date.now();
  const actividad = () => { ultimaActividad = Date.now(); avisoQuieto = false; };
  addEventListener('pointermove', e => {
    puntero.x = e.clientX; puntero.y = e.clientY; puntero.movido = true; actividad();
  }, { passive: true });
  ['scroll', 'keydown', 'pointerdown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, actividad, { passive: true }));

  /* Velocidad de scroll (px/s, suavizada) */
  let yPrev = scrollY, tPrev = performance.now(), velocidad = 0, atras = 0;
  addEventListener('scroll', () => {
    const t = performance.now(), dt = t - tPrev;
    if (dt > 0) {
      const v = Math.abs(scrollY - yPrev) / dt * 1000;
      velocidad = velocidad * 0.7 + v * 0.3;
    }
    if (scrollY < yPrev - 400) atras++;
    yPrev = scrollY; tPrev = t;
  }, { passive: true });

  /* Hora local y tiempo dentro (solo en este navegador) */
  function hora() { const d = new Date(); return dos(d.getHours()) + ':' + dos(d.getMinutes()); }
  function tiempoDentro() {
    const s = Math.floor((Date.now() - t0) / 1000), m = Math.floor(s / 60), r = s % 60;
    const seg = r + (r === 1 ? ' segundo' : ' segundos');
    return m === 0 ? seg : m + (m === 1 ? ' minuto' : ' minutos') + ' y ' + seg;
  }

  /* Actos, título y favicon */
  const titulos = {
    1: 'Residencial Las Brumas · Tu nuevo hogar te está esperando',
    2: 'Las Brumas · Te estamos esperando',
    3: 'Te estamos viendo',
    4: 'No cierres',
    5: 'Ya estás dentro'
  };
  let acto = 1;
  const oyentes = [];
  function icono(href) {
    const l = document.getElementById('icono');
    if (l && l.getAttribute('href') !== href) l.setAttribute('href', href);
  }
  function fijarActo(n) {
    if (n === acto) return;
    const antes = acto;
    acto = n;
    raiz.dataset.acto = n;
    if (!document.hidden) document.title = titulos[n];
    icono(n >= 3 ? 'ojo.svg' : 'favicon.svg');
    oyentes.forEach(f => f(n, antes));
  }

  let salida = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      salida = Date.now();
      if (acto >= 2) document.title = acto >= 4 ? 'No cierres' : 'Te estamos viendo';
    } else {
      document.title = titulos[acto];
      if (acto >= 2 && Date.now() - salida > 1200) avisar('¿A dónde has ido? Seguimos aquí.', { urgente: true });
    }
  });

  /* La asesora: un aviso flotante que empieza siendo amable */
  const caja = document.getElementById('asesora');
  const texto = document.getElementById('asesora-mensaje');
  let temporizador = 0, cerradoA = 0;
  function avisar(msg, opciones = {}) {
    if (!caja) return;
    if (!opciones.urgente && Date.now() - cerradoA < 4000) return;
    clearTimeout(temporizador);
    texto.textContent = msg;
    caja.hidden = false;
    caja.classList.add('fuera');
    requestAnimationFrame(() => requestAnimationFrame(() => caja.classList.remove('fuera')));
    temporizador = setTimeout(ocultar, opciones.dura || 7000);
  }
  function ocultar() {
    caja.classList.add('fuera');
    setTimeout(() => { if (caja.classList.contains('fuera')) caja.hidden = true; }, 380);
  }
  if (caja) caja.querySelector('.asesora-cerrar').addEventListener('click', () => { cerradoA = Date.now(); ocultar(); });

  /* Vigilancia: solo mira lo que pasa en esta pestaña */
  let avisoQuieto = false, ultimoRapido = 0, ultimoTiempo = Date.now();
  setInterval(() => {
    if (performance.now() - tPrev > 250) velocidad *= 0.4;
    if (acto < 2 || acto >= 5 || LB.silencio) return;
    const ahora = Date.now();
    if (velocidad > 3800 && ahora - ultimoRapido > 25000) {
      ultimoRapido = ahora;
      avisar('Vas muy rápido. La última familia también corría.', { urgente: true });
    } else if (!avisoQuieto && ahora - ultimaActividad > 7000) {
      avisoQuieto = true;
      avisar('No te muevas. Te ha oído.', { urgente: true, dura: 6000 });
    } else if (ahora - ultimoTiempo > 95000) {
      ultimoTiempo = ahora;
      avisar('Llevas ' + tiempoDentro() + ' en Las Brumas.');
    }
  }, 500);

  /* Marca de visita: una sola fecha, sin nada personal */
  const CLAVE = 'lasbrumas-visita';
  let visitaAnterior = null;
  try {
    visitaAnterior = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    localStorage.setItem(CLAVE, JSON.stringify({ ultima: Date.now(), final: !!(visitaAnterior && visitaAnterior.final) }));
  } catch (e) { visitaAnterior = null; }
  function marcarFinal() {
    try { localStorage.setItem(CLAVE, JSON.stringify({ ultima: Date.now(), final: true })); } catch (e) { /* sin almacenamiento */ }
  }
  const vuelve = !!visitaAnterior && (new Date(visitaAnterior.ultima).toDateString() !== new Date().toDateString() || Date.now() - visitaAnterior.ultima > 6 * 3600e3);

  if (vuelve) {
    raiz.classList.add('vuelve');
    raiz.style.setProperty('--abre', '0.78');
    raiz.style.setProperty('--luz', '#f0cf8a');
  }

  window.LB = {
    raiz, calma, tactil, t0, clamp, lerp, azar, tramo, dos, puntero,
    hora, tiempoDentro, titulos, fijarActo, avisar, icono, marcarFinal, vuelve,
    visitaAnterior,
    get acto() { return acto; },
    get velocidad() { return velocidad; },
    get atras() { return atras; },
    get quieto() { return Date.now() - ultimaActividad; },
    alCambiarActo(f) { oyentes.push(f); },
    visita: null,
    silencio: false
  };
})();
