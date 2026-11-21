/* Piezas comunes: actos, tiempo, puntero, visitas y la asesora */
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
  const avisa = (nombre, detalle) => document.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));

  /* Puntero y actividad */
  const puntero = { x: innerWidth * 0.5, y: innerHeight * 0.4, movido: false };
  let ultimaActividad = Date.now();
  const actividad = () => { ultimaActividad = Date.now(); };
  addEventListener('pointermove', e => {
    puntero.x = e.clientX; puntero.y = e.clientY; puntero.movido = true; actividad();
  }, { passive: true });
  ['scroll', 'keydown', 'pointerdown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, actividad, { passive: true }));

  /* Velocidad de scroll (px/s, suavizada) */
  let yPrev = scrollY, tPrev = performance.now(), velocidad = 0;
  addEventListener('scroll', () => {
    const t = performance.now(), dt = t - tPrev;
    if (dt > 0) {
      const v = Math.abs(scrollY - yPrev) / dt * 1000;
      velocidad = velocidad * 0.7 + v * 0.3;
    }
    yPrev = scrollY; tPrev = t;
  }, { passive: true });
  setInterval(() => { if (performance.now() - tPrev > 250) velocidad *= 0.4; }, 500);

  /* Hora local y duraciones, en palabras (solo en este navegador) */
  const NUM = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
  function hora(d = new Date()) { return dos(d.getHours()) + ':' + dos(d.getMinutes()); }
  function las(d = new Date()) { return (d.getHours() === 1 ? 'la ' : 'las ') + hora(d); }
  function sonLas(d = new Date()) { return (d.getHours() === 1 ? 'es ' : 'son ') + las(d); }
  function duracion(ms) {
    const s = Math.floor(ms / 1000);
    if (!(s >= 1)) return '';
    const m = Math.floor(s / 60), r = s % 60;
    const seg = r + (r === 1 ? ' segundo' : ' segundos');
    if (m === 0) return seg;
    const min = m + (m === 1 ? ' minuto' : ' minutos');
    return r === 0 ? min : min + ' y ' + seg;
  }
  function tiempoDentro() { return duracion(Math.max(1000, Date.now() - t0)); }
  function minutos() { const m = Math.floor((Date.now() - t0) / 60000); return m < 1 ? tiempoDentro() : m + (m === 1 ? ' minuto' : ' minutos'); }
  function veces(n) { return n === 1 ? 'una vez' : (NUM[n] || n) + ' veces'; }

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
    if (n > visitas.acto) { visitas.acto = n; guardar(); }
    oyentes.forEach(f => f(n, antes));
    avisa('lb:acto', { acto: n, antes });
  }

  /* La asesora: un aviso flotante que empieza siendo amable.
     Ningún mensaje se quita antes de poder leerlo: si llega otro, espera su turno. */
  const caja = document.getElementById('asesora');
  const texto = document.getElementById('asesora-mensaje');
  let reloj = 0, espera = 0, cerradoA = 0, desde = 0, minimo = 0, ultimoAviso = 0, cierres = 0, pendiente = null;
  const visible = () => !!caja && !caja.hidden && !caja.classList.contains('fuera');
  function avisar(msg, op = {}) {
    if (!caja || typeof msg !== 'string' || !msg.trim() || /undefined|NaN|null|\[object/.test(msg)) return false;
    if (!op.urgente && Date.now() - cerradoA < 4000) return false;
    if (visible()) {
      if (op.urgente || !pendiente) pendiente = [msg, op];
      clearTimeout(espera);
      espera = setTimeout(sacar, Math.max(300, minimo - (Date.now() - desde)));
      return true;
    }
    mostrar(msg, op);
    return true;
  }
  function sacar() {
    if (!pendiente) return;
    const [m, o] = pendiente;
    if (visible() && (!o.urgente || Date.now() - desde < minimo)) return;
    pendiente = null;
    mostrar(m, o);
  }
  function mostrar(msg, op) {
    clearTimeout(reloj); clearTimeout(espera);
    texto.textContent = msg;
    caja.hidden = false;
    caja.classList.add('fuera');
    requestAnimationFrame(() => requestAnimationFrame(() => caja.classList.remove('fuera')));
    desde = ultimoAviso = Date.now();
    minimo = clamp(1800 + msg.length * 45, 3200, 6500);
    reloj = setTimeout(ocultar, op.dura || clamp(3200 + msg.length * 60, 6500, 11000));
    avisa('lb:marta', { id: op.id || null, texto: msg, acto });
  }
  function ocultar() {
    caja.classList.add('fuera');
    setTimeout(() => { if (caja.classList.contains('fuera')) { caja.hidden = true; sacar(); } }, 380);
  }
  if (caja) caja.querySelector('.asesora-cerrar').addEventListener('click', () => {
    cerradoA = Date.now(); pendiente = null; cierres++;
    clearTimeout(reloj); clearTimeout(espera); ocultar();
    avisa('lb:marta-cerrada', { veces: cierres, acto });
  });
  function marta(id, x = {}, op = {}) {
    const f = LB.guion && LB.guion.marta[id];
    if (!f) return false;
    let msg = null;
    try { msg = f(LB.sabe, x); } catch (e) { msg = null; }
    return msg ? avisar(msg, Object.assign({ id }, op)) : false;
  }

  /* Visitas: cuándo viniste por primera y por última vez, cuántas veces y hasta dónde llegaste. Nada más. */
  const CLAVE = 'lasbrumas-visita';
  const ahora = Date.now();
  let previa = null, nueva = true;
  const visitas = { primera: ahora, ultima: ahora, veces: 1, final: false, acto: 1 };
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(visitas)); } catch (e) { /* sin almacenamiento */ } }
  try {
    const p = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (p && typeof p.ultima === 'number' && p.ultima <= ahora) {
      previa = {
        primera: typeof p.primera === 'number' ? p.primera : p.ultima,
        ultima: p.ultima,
        veces: Math.max(1, Math.floor(Number(p.veces)) || 1),
        final: !!p.final,
        acto: clamp(Math.floor(Number(p.acto)) || 1, 1, 5)
      };
      nueva = ahora - previa.ultima > 30 * 60e3;
      Object.assign(visitas, { primera: previa.primera, veces: previa.veces + (nueva ? 1 : 0), final: previa.final, acto: 1 });
    }
  } catch (e) { previa = null; }
  guardar();
  const dejar = () => { visitas.ultima = Date.now(); guardar(); };
  addEventListener('pagehide', dejar);
  document.addEventListener('visibilitychange', () => { if (document.hidden) dejar(); });
  function marcarFinal() { visitas.final = true; dejar(); }
  let tipoCarga = '';
  try { const n = performance.getEntriesByType('navigation')[0]; tipoCarga = n ? n.type : ''; } catch (e) { tipoCarga = ''; }
  const recarga = !!previa && previa.acto >= 2 && (tipoCarga === 'reload' || !nueva);
  const vuelve = !!previa && (new Date(previa.ultima).toDateString() !== new Date().toDateString() || ahora - previa.ultima > 6 * 3600e3);

  if (vuelve) {
    raiz.classList.add('vuelve');
    raiz.style.setProperty('--abre', '0.78');
    raiz.style.setProperty('--luz', '#f0cf8a');
  }

  window.LB = {
    raiz, calma, tactil, t0, clamp, lerp, azar, tramo, dos, puntero, avisa,
    hora, las, sonLas, duracion, tiempoDentro, minutos, veces,
    titulos, fijarActo, avisar, marta, icono, marcarFinal,
    visitas, previa, nueva, recarga, vuelve,
    get acto() { return acto; },
    get velocidad() { return velocidad; },
    get quieto() { return Date.now() - ultimaActividad; },
    get ultimoAviso() { return ultimoAviso; },
    get avisando() { return visible(); },
    alCambiarActo(f) { oyentes.push(f); },
    visita: null,
    silencio: false
  };
})();
