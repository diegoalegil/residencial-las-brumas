/* Sonido: grabaciones y voces por capas que cambian en cada acto. Apagado hasta que lo enciendas (botón o tecla M).
   Los audios están en audio/ y solo se descargan al encenderlo. */
(function () {
  const boton = document.getElementById('sonido');
  const { calma, tramo, clamp } = LB;
  const PRE = 0.5;   // cada bucle lleva medio segundo de margen cíclico delante y detrás: va de PRE a PRE + duración

  /* Lo que hay */
  const CAMAS = {
    jingle: ['jingle', 38.4], caja: ['caja-musica', 32], pajaros: ['pajaros', 22], viento: ['viento', 24],
    zumbido: ['zumbido', 12], monitores: ['monitores', 8], casa: ['casa', 30], fluorescente: ['fluorescente', 4],
    linea: ['linea', 4], dron: ['dron', 32]
  };
  const EFECTOS = ['pop', 'rele-1', 'rele-2', 'rele-3', 'reloj-tic', 'reloj-tac', 'puerta-lejos-1', 'puerta-lejos-2', 'puerta-cuarto',
    'descolgar', 'comunicando', 'boli', 'sello', 'respiracion', 'golpe-mano', 'paso-1', 'paso-2', 'paso-3', 'paso-4', 'paso-5', 'paso-6',
    'paso-otro-1', 'paso-otro-2', 'paso-otro-3', 'paso-figura', 'crujido-1', 'crujido-2', 'crujido-3', 'latido', 'apagon', 'susto'];
  const dos = n => String(n).padStart(2, '0');
  const LLAMADA = Array.from({ length: 18 }, (_, i) => 'l-' + dos(i));
  const NOTAS = Array.from({ length: 9 }, (_, i) => 'nota-' + (i + 1));
  const SUSURROS = ['s-oyes', 's-cuenta', 's-siete', 's-nocorras', 's-oido', 's-ocho', 's-dedo', 's-raton', 's-gires', 's-sitio'];
  const CENTRO = { 'Ya está.': 'c-yaesta', 'Ya está. Ya pasó.': 'c-yapaso', 'Ya estás dentro.': 'c-dentro' };
  /* Marta, por el texto exacto de su mensaje: solo las frases fijas tienen voz, y solo cuando la web ya ha cambiado */
  const MARTA = {
    'No te des la vuelta.': 'm-detras',
    '¿Subiste el volumen? ¿Llevas auriculares? Entonces no oirías la puerta de tu cuarto.': 'm-sonido',
    'No te muevas. Está en el pasillo contigo.': 'm-quieto4',
    'Si no te mueves, no te ve. Eso decía Javi.': 'm-quieto3',
    'Escape no hace nada aquí.': 'm-escape',
    'No levantes el dedo. Así sabemos dónde estás.': 'm-dedo',
    '¿Qué buscas? Pregúntamelo a mí.': 'm-buscar',
    '¿Lo copias para enseñárselo a alguien? Que venga. Hay sitio.': 'm-copiar',
    'Puedes cerrarme las veces que quieras. Sigo aquí.': 'm-cerrar2',
    'Ya me cerraste cuatro veces. No me voy a ir.': 'm-cerrar4',
    'Hola otra vez. ¿Te enseño la casa piloto? Ya sabes el camino.': 'm-regreso',
    'Recargar la página no borra nada. Seguimos aquí.': 'm-recarga',
    'Seis veces. La salida no está arriba. Arriba ya no queda nadie.': 'm-subidas6'
  };
  const TRAMPA = {
    '¿A dónde vas?': 't-1', 'Arriba ya no queda nadie.': 't-2', 'Tu plato ya está en la mesa.': 't-3', 'Lucía quiere que te quedes.': 't-4',
    'Puedes irte. Te dejamos la puerta abierta, para cuando vuelvas.': 't-5'
  };
  const VOCES = NOTAS.concat(LLAMADA, SUSURROS, Object.values(CENTRO), Object.values(MARTA), Object.values(TRAMPA));
  /* Lo que hace falta antes según el acto en el que estés */
  const POR_ACTO = {
    1: ['jingle', 'pajaros', 'viento', 'pop', 'caja', 'm-recarga', 'm-regreso'],
    2: ['zumbido', 'monitores', 'rele-1', 'rele-2', 'rele-3', 'reloj-tic', 'sello', 'm-detras', 'm-sonido'],
    3: ['casa', 'reloj-tac', 'puerta-lejos-1', 'puerta-lejos-2', ...NOTAS, 'linea', 'descolgar', ...LLAMADA, 'comunicando', 'boli', 'respiracion', 'golpe-mano'],
    4: ['dron', 'fluorescente', 'paso-1', 'paso-2', 'paso-3', 'paso-4', 'paso-5', 'paso-6', 'paso-otro-1', 'paso-otro-2', 'paso-otro-3', 'latido', 'crujido-1', 'crujido-2', 'crujido-3', 'apagon', ...SUSURROS, 'c-yaesta', 'c-yapaso', 'paso-figura', 'susto', 'm-quieto4'],
    5: ['c-dentro', ...Object.values(TRAMPA)]
  };
  const ruta = n => CAMAS[n] ? `audio/camas/${CAMAS[n][0]}.mp3` : EFECTOS.includes(n) ? `audio/efectos/${n}.mp3` : `audio/voces/${n}.mp3`;
  const TODOS = Object.keys(CAMAS).concat(EFECTOS, VOCES);

  let ac = null, encendido = false, reloj = 0, salida, limite, camasBus, fxBus, vozBus;
  const bufs = {}, pedidos = {}, esperas = {}, fallidos = [];
  const registro = [];
  const apunta = s => { registro.push(`${(performance.now() / 1000).toFixed(1)} ${s}`); if (registro.length > 80) registro.shift(); };
  const ahora = () => ac.currentTime;
  /* Cada parámetro recuerda su último destino: la mezcla corre veinte veces por segundo y solo programa cambios de verdad */
  const destinos = new WeakMap();
  const rampa = (param, valor, tc = 0.2) => { destinos.set(param, [valor, tc]); param.setTargetAtTime(valor, ahora(), tc); };
  const fija = (param, valor, tc) => { const u = destinos.get(param); if (u && Math.abs(u[0] - valor) < 1e-4 && u[1] === tc) return; rampa(param, valor, tc); };
  const suelta = param => { destinos.delete(param); param.cancelScheduledValues(ahora()); };
  const ganancia = (v, destino) => { const g = ac.createGain(); g.gain.value = v; if (destino) g.connect(destino); return g; };
  const azar = (a, b) => a + Math.random() * (b - a);
  const elige = a => a[Math.floor(Math.random() * a.length)];

  /* Descarga: solo al encender, primero lo del acto en el que estás */
  function decodificar(ab) {
    return new Promise((ok, mal) => {
      let hecho = false;
      const bien = b => { if (!hecho) { hecho = true; ok(b); } }, fallo = e => { if (!hecho) { hecho = true; mal(e); } };
      try { const p = ac.decodeAudioData(ab, bien, fallo); if (p && p.then) p.then(bien, fallo); } catch (e) { fallo(e); }
    });
  }
  function pedir(n) {
    if (bufs[n] || pedidos[n]) return pedidos[n] || Promise.resolve(bufs[n]);
    pedidos[n] = fetch(ruta(n)).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(decodificar)
      .then(b => { bufs[n] = b; (esperas[n] || []).forEach(f => f(b)); delete esperas[n]; return b; })
      .catch(() => { fallidos.push(n); delete pedidos[n]; return null; });
    return pedidos[n];
  }
  let cola = [], enVuelo = 0;
  function cargarTodo() {
    const a = LB.acto, orden = [];
    for (let k = a; k <= 5; k++) orden.push(...POR_ACTO[k]);
    for (let k = 1; k < a; k++) orden.push(...POR_ACTO[k]);
    TODOS.forEach(n => orden.push(n));
    cola = [...new Set(orden)].filter(n => !bufs[n] && !pedidos[n]);
    for (let i = 0; i < 4; i++) siguienteCarga();
  }
  function siguienteCarga() {
    if (!cola.length || enVuelo >= 4) return;
    const n = cola.shift();
    if (bufs[n] || pedidos[n]) { siguienteCarga(); return; }
    enVuelo++;
    pedir(n).then(() => { enVuelo--; siguienteCarga(); });
  }
  /* Un sonido que llega justo cuando se enciende el sonido puede no estar descargado: se espera un poco */
  function cuando(n, f, maxMs = 6000) {
    if (bufs[n]) { f(bufs[n]); return; }
    const t0 = performance.now();
    (esperas[n] = esperas[n] || []).push(b => { if (performance.now() - t0 < maxMs && encendido) f(b); });
    pedir(n);
  }

  /* El grafo: tres buses (camas, efectos, voces), un limitador y la salida */
  function montar() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    limite = ac.createDynamicsCompressor();
    limite.threshold.value = -3; limite.knee.value = 0; limite.ratio.value = 20; limite.attack.value = 0.002; limite.release.value = 0.18;
    const final = ganancia(0.89, ac.destination);
    limite.connect(final);
    salida = ganancia(0, limite);
    camasBus = ganancia(1, salida); fxBus = ganancia(1, salida); vozBus = ganancia(1, salida);
    Object.keys(CAMAS).forEach(k => {
      const c = camas[k] = { g: ganancia(0, camasBus), src: null, dur: CAMAS[k][1] };
      if (k === 'jingle') {
        c.lp = ac.createBiquadFilter(); c.lp.type = 'lowpass'; c.lp.frequency.value = 18000; c.lp.Q.value = 0.5; c.lp.connect(c.g);
        c.mudo = ganancia(1, c.lp);
        c.wow = ganancia(0.0015); c.flut = ganancia(0);
        const o1 = ac.createOscillator(); o1.frequency.value = 0.55; o1.connect(c.wow); o1.start();
        const o2 = ac.createOscillator(); o2.frequency.value = 6.3; o2.connect(c.flut); o2.start();
        c.pos = PRE; c.tUlt = 0; c.parada = false;
      }
      c.entrada = c.mudo || c.g;
    });
  }
  const camas = {};
  function fuente(buf, k) {
    const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = PRE; s.loopEnd = PRE + CAMAS[k][1];
    return s;
  }
  function arrancarCama(k) {
    const c = camas[k], b = bufs[k];
    if (!b || c.src) return;
    if (k === 'jingle') { arrancarJingle(PRE, ahora() + 0.03); return; }
    c.src = fuente(b, k); c.src.connect(c.entrada);
    c.src.start(ahora() + 0.03, PRE + Math.random() * c.dur);
  }
  /* El jingle se puede rayar, ondular y parar como una cinta: se sigue su posición a mano */
  function posJingle(t = ahora()) {
    const J = camas.jingle;
    if (!J.src) return J.pos;
    let p = J.pos + Math.max(0, t - J.tUlt) * J.src.playbackRate.value;
    while (p >= PRE + J.dur) p -= J.dur;
    return p;
  }
  function arrancarJingle(desde, cuando, vel) {
    const J = camas.jingle, b = bufs.jingle;
    if (!b) return;
    while (desde >= PRE + J.dur) desde -= J.dur;
    if (desde < PRE) desde = PRE;
    const s = fuente(b, 'jingle');
    s.playbackRate.value = vel != null ? vel : (J.src ? J.src.playbackRate.value : 1);
    J.wow.connect(s.playbackRate); J.flut.connect(s.playbackRate);
    s.connect(J.mudo);
    s.start(cuando, desde);
    if (J.src) {
      try { J.src.stop(cuando); } catch (e) { /* ya parada */ }
      const vieja = J.src;
      setTimeout(() => { try { J.wow.disconnect(vieja.playbackRate); J.flut.disconnect(vieja.playbackRate); } catch (e) { /* ya suelta */ } }, Math.max(0, (cuando - ahora()) * 1000) + 200);
    }
    J.src = s; J.pos = desde; J.tUlt = cuando;
  }
  function actualizarPos() {
    const J = camas.jingle;
    if (!J || !J.src) return;
    const t = ahora();
    if (t > J.tUlt) { J.pos = posJingle(t); J.tUlt = t; }
  }
  function rayar(n) {
    const J = camas.jingle;
    if (!J || !J.src || J.parada || LB.regreso) return;
    const t = ahora() + 0.03, vel = J.src.playbackRate.value || 1;
    const trozo = 0.08 + n * 0.014, veces = 2 + n, p = posJingle(t);
    const s = ac.createBufferSource(); s.buffer = bufs.jingle; s.loop = true; s.loopStart = p; s.loopEnd = p + trozo; s.playbackRate.value = vel;
    const gs = ganancia(0, J.lp); s.connect(gs);
    const fin = t + veces * trozo / vel;
    gs.gain.setValueAtTime(0, t); gs.gain.linearRampToValueAtTime(1, t + 0.004);
    gs.gain.setValueAtTime(1, fin - 0.005); gs.gain.linearRampToValueAtTime(0, fin);
    J.mudo.gain.cancelScheduledValues(t);
    J.mudo.gain.setValueAtTime(1, t); J.mudo.gain.linearRampToValueAtTime(0, t + 0.004);
    J.mudo.gain.setValueAtTime(0, fin - 0.002); J.mudo.gain.linearRampToValueAtTime(1, fin + 0.004);
    s.start(t, p); s.stop(fin + 0.02);
    arrancarJingle(p + trozo + azar(0.4, 1.6), fin);   // y se come un trozo, como un CD rayado
    apunta('jingle rayado ' + n);
  }
  function pararCinta() {
    const J = camas.jingle;
    if (!J || !J.src || J.parada) return;
    J.parada = true;
    const t = ahora(), r = J.src.playbackRate;
    actualizarPos();
    suelta(r); r.setValueAtTime(r.value, t); r.linearRampToValueAtTime(0.05, t + 1.5);
    suelta(J.g.gain); J.g.gain.setValueAtTime(J.g.gain.value, t); J.g.gain.linearRampToValueAtTime(0, t + 1.6);
    apunta('cinta parada');
  }
  function arrancarCinta(vel = 0.2) {
    const J = camas.jingle;
    if (!J || !J.parada || !bufs.jingle) return;
    J.parada = false;
    arrancarJingle(posJingle(), ahora() + 0.02, vel);
    suelta(J.g.gain); J.g.gain.setValueAtTime(J.g.gain.value, ahora());
    apunta('cinta en marcha');
  }

  /* Sonidos sueltos, con posición en 3D (auriculares) o panorama */
  function situar(pos, destino) {
    const p = ac.createPanner();
    p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 1; p.rolloffFactor = 0;
    if (p.positionX) { p.positionX.value = pos.x || 0; p.positionY.value = pos.y || 0; p.positionZ.value = pos.z || 0; }
    else p.setPosition(pos.x || 0, pos.y || 0, pos.z || 0);
    p.connect(destino);
    return p;
  }
  function panear(pan, destino) {
    if (ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(destino); return p; }
    return situar({ x: pan, z: -0.5 }, destino);
  }
  const sonando = new Set(), veces = {};
  function sonar(n, op = {}) {
    const b = bufs[n];
    if (!b || !encendido) return null;
    veces[n] = (veces[n] || 0) + 1;
    const s = ac.createBufferSource(); s.buffer = b; s.playbackRate.value = op.vel || 1;
    const destino = op.destino || fxBus;
    const g = ganancia(op.gan != null ? op.gan : 1);
    let fin = destino;
    if (op.pos) fin = situar(op.pos, destino); else if (op.pan) fin = panear(op.pan, destino);
    g.connect(fin);
    if (op.lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = op.lp; s.connect(f); f.connect(g); } else s.connect(g);
    const t = op.cuando || ahora();
    s.start(t);
    const r = { s, g, fin: t + b.duration / (op.vel || 1) };
    if (destino === vozBus) { sonando.add(r); agachar(); s.onended = () => { sonando.delete(r); agachar(); if (op.alAcabar) op.alAcabar(); }; }
    else if (op.alAcabar) s.onended = op.alAcabar;
    return r;
  }
  function callar(r, t = 0.25) {
    if (!r) return;
    const x = ahora();
    r.g.gain.cancelScheduledValues(x); r.g.gain.setValueAtTime(r.g.gain.value, x); r.g.gain.linearRampToValueAtTime(0, x + t);
    try { r.s.stop(x + t + 0.02); } catch (e) { /* ya parada */ }
  }
  /* Mientras habla alguien, las camas bajan un poco */
  function agachar() { if (camasBus) rampa(camasBus.gain, sonando.size ? 0.55 : 1, sonando.size ? 0.08 : 0.5); }
  function voz(n, op = {}) {
    apunta('voz ' + n);
    return sonar(n, Object.assign({ destino: vozBus }, op));
  }

  /* Estado que no da LB: dónde está cada sección */
  const E = { d: 0, seg: false, segP: 0, hora: false, llamada: false, cristal: false, bienvenido: false, opinion: -1 };
  const prox = { rele: 0, puerta: 0, crujido: 0, latido: 0, dip: 0 };
  function secciones() {
    const st = (o) => ScrollTrigger.create(o);
    st({ trigger: '.todavia', start: 'top 55%', endTrigger: '.seguridad', end: 'top 60%', onUpdate: s => { E.d = s.progress; } });
    st({
      trigger: '.opiniones', start: 'top top', end: 'bottom bottom',
      onUpdate: s => {
        const i = Math.min(6, Math.floor(s.progress * 7));
        if (i !== E.opinion) { const antes = E.opinion; E.opinion = i; if (encendido && i > antes && i > 0 && LB.acto === 2) rayar(i); }
      }
    });
    st({
      trigger: '.seguridad', start: 'top 60%', end: 'bottom 30%',
      onToggle: s => { E.seg = s.isActive; },
      onEnter: () => { if (encendido) pararCinta(); },
      onLeaveBack: () => { if (encendido && LB.acto <= 2) arrancarCinta(); },
      onUpdate: s => {
        const p = tramo(s.progress, 0.15, 0.85);
        if (encendido && E.segP < 0.5 && p >= 0.5) { sonar('rele-2', { gan: 0.9, pan: 0.4 }); apunta('cam64 alguien detrás'); }
        E.segP = p;
      }
    });
    st({
      trigger: '.cero', start: 'top 60%', once: true, onEnter: () => {
        if (!encendido || calma) return;
        for (let k = 0; k < 14; k++) sonar('reloj-tic', { gan: 0.22, vel: 2.2, cuando: ahora() + k * 0.09 });
        sonar('sello', { gan: 0.5, cuando: ahora() + 1.32 });
      }
    });
    st({ trigger: '.hora', start: 'top 60%', end: 'bottom 40%', onToggle: s => { E.hora = s.isActive; } });
    st({ trigger: '.llamada', start: 'top 70%', end: 'bottom 30%', onToggle: s => { E.llamada = s.isActive; }, onEnter: () => { if (encendido) sonar('descolgar', { gan: 0.6 }); } });
    st({ trigger: '.firmas', start: 'top 85%', once: true, onEnter: () => { if (!encendido) return; sonar('boli', { gan: 0.75, pan: -0.15 }); sonar('boli', { gan: 0.65, vel: 0.94, pan: 0.2, cuando: ahora() + 0.9 }); apunta('firma'); } });
    st({ trigger: '#leido', start: 'top 88%', once: true, onEnter: () => { if (encendido) sonar('sello', { gan: 0.45, cuando: ahora() + 0.25 }); } });
    st({ trigger: '.cristal', start: 'top 80%', end: 'bottom 20%', onToggle: s => { E.cristal = s.isActive; } });
    st({ trigger: '.bienvenido', start: 'top 80%', end: 'bottom top', onToggle: s => { E.bienvenido = s.isActive; } });
  }

  /* Lo que se dice en la página */
  let notaActual = null;
  const colaLlamada = [];
  let hablando = false, colgar = false;
  function siguienteLinea() {
    if (hablando) return;
    if (!colaLlamada.length) {
      if (colgar) { colgar = false; sonar('comunicando', { gan: 0.5 }); apunta('comunicando'); }
      return;
    }
    const n = colaLlamada.shift();
    hablando = true;
    const r = voz(n, { gan: 0.85, alAcabar: () => { hablando = false; setTimeout(siguienteLinea, 180); } });
    if (!r) { hablando = false; siguienteLinea(); }
  }
  const X_SUSURRO = [0.12, 0.66, 0.2, 0.55, 0.08, 0.78, 0.3, 0.5, 0.1, 0.6];
  let ladoMarta = 1, ultimaYaEsta = null, ultimaTrampa = 0;
  function eventos() {
    document.addEventListener('lb:nota', e => {
      if (!encendido) return;
      const n = NOTAS[e.detail.indice];
      callar(notaActual, 0.3); notaActual = null;
      cuando(n, () => { callar(notaActual, 0.2); notaActual = voz(n, { gan: 0.95 }); }, 3000);
    });
    document.addEventListener('lb:llamada', e => {
      if (!encendido) return;
      const d = e.detail;
      if (d.fin) { colgar = true; siguienteLinea(); return; }
      if (!d.voz) return;
      colaLlamada.push(LLAMADA[d.indice]);
      if (!calma && colaLlamada.length > 2) colaLlamada.splice(0, colaLlamada.length - 2);
      siguienteLinea();
    });
    document.addEventListener('lb:susurro', e => {
      if (!encendido) return;
      const { indice, texto } = e.detail;
      let n = SUSURROS[indice];
      if (indice === 3 && texto !== 'no corras') n = null;
      if (indice === 6) n = null;
      if (indice === 7) n = LB.tactil ? 's-dedo' : 's-raton';
      if (!n) return;
      const x = (X_SUSURRO[indice] - 0.5) * 3;
      const pos = indice === 8 ? { x: -0.4, z: 0.6 } : indice === 9 ? { x: 0.15, z: 0.35 } : { x, z: -0.4 };
      voz(n, { gan: indice >= 8 ? 0.75 : 0.6, pos });
    });
    document.addEventListener('lb:centro', e => {
      if (!encendido) return;
      const n = CENTRO[e.detail.texto];
      if (!n) return;
      if (n === 'c-yapaso' && ultimaYaEsta && ultimaYaEsta.fin > ahora()) { voz(n, { gan: 0.8, cuando: ultimaYaEsta.fin + 0.15 }); return; }
      const r = voz(n, { gan: n === 'c-dentro' ? 0.9 : 0.8 });
      if (n === 'c-yaesta') ultimaYaEsta = r;
    });
    document.addEventListener('lb:marta', e => {
      if (!encendido) return;
      const { id, texto, acto } = e.detail;
      sonar('pop', { gan: 0.26, vel: [1, 1, 0.94, 0.8, 0.68, 0.6][acto] || 1 });
      const n = MARTA[texto];
      if (!n || !(acto >= 2 || LB.regreso || id === 'recarga')) return;
      ladoMarta = -ladoMarta;
      cuando(n, () => {
        const pos = n === 'm-detras' ? { x: 0, z: 0.45 } : { x: ladoMarta * 0.55, z: 0.15 };
        voz(n, {
          gan: 0.62, pos, cuando: ahora() + 0.3,
          alAcabar: n === 'm-sonido' ? () => setTimeout(() => sonar('puerta-cuarto', { gan: 0.7, pos: { x: -0.9, z: 1.1 } }), 1400) : null
        });
      }, 8000);
    });
    const trampa = document.getElementById('trampa-texto');
    if (trampa) new MutationObserver(() => {
      const n = TRAMPA[trampa.textContent.trim()];
      if (!encendido || !n || performance.now() - ultimaTrampa < 900) return;
      ultimaTrampa = performance.now();
      ladoMarta = -ladoMarta;
      voz(n, { gan: 0.7, pos: { x: ladoMarta * 0.5, z: 0.1 } });
    }).observe(trampa, { childList: true, characterData: true, subtree: true });
    LB.alCambiarActo((n, antes) => {
      if (!encendido) return;
      if (n === 2 && antes === 1 && !LB.regreso) { hipo = performance.now(); apunta('acto 2: los pájaros se callan'); }
      if (n >= 4) { callar(notaActual, 0.6); notaActual = null; colaLlamada.length = 0; }
      apunta('acto ' + n);
    });
  }
  let hipo = 0;

  /* Acto 4: pasos que van con tu scroll, otros que no, el latido y la figura */
  const facil = typeof gsap !== 'undefined' ? gsap.parseEase('power1.inOut') : (x => x);
  const P4 = { z: null, t: 0, pie: 0, otros: [], tras: false, q: -1, fase: '', respProg: 0 };
  function pasillo(o, fase, t) {
    const P = o.P;
    if (fase !== P4.fase) {
      if (fase === 'apagon') { sonar('apagon', { gan: 0.85 }); apunta('apagón'); }
      if (fase === 'calma') sonar('rele-1', { gan: 0.5, pos: { x: 0.8, z: -1 } });
      if (fase === 'figura' && camas.jingle && camas.jingle.src) rampa(camas.jingle.g.gain, 0, 0.01);
      P4.fase = fase;
    }
    if (fase === 'pasillo') {
      const z = 12.5 * facil(tramo(P, 0.04, 0.5));
      if (P4.z == null) P4.z = z;
      if (Math.abs(z - P4.z) >= 0.62 && t - P4.t > 230) {
        P4.z = z; P4.t = t; P4.pie = 1 - P4.pie;
        sonar('paso-' + (1 + Math.floor(Math.random() * 6)), { gan: 0.5, vel: azar(0.94, 1.05), pos: { x: P4.pie ? 0.22 : -0.22, y: -1, z: -0.15 } });
        if (P > 0.18 && Math.random() < 0.5) P4.otros.push(t + azar(300, 440));
        P4.tras = false;
      }
      if (P > 0.18 && P4.t && !P4.tras && t - P4.t > 900 && t - P4.t < 1200) {
        P4.tras = true; P4.otros.push(t + 150, t + 800);     // tú te paras; detrás dan dos pasos más
        if (Math.random() < 0.4) P4.otros.push(t + 1450);
      }
      P4.otros.sort((a, b) => a - b);
      while (P4.otros.length && P4.otros[0] <= t) {
        P4.otros.shift();
        const k = tramo(P, 0.18, 0.5);
        sonar('paso-otro-' + (1 + Math.floor(Math.random() * 3)), { gan: 0.22 + 0.45 * k, vel: azar(0.9, 1.0), pos: { x: azar(-0.35, 0.35), y: -1, z: 1.8 - 1.1 * k } });
      }
      if (t > prox.crujido) { sonar('crujido-' + (1 + Math.floor(Math.random() * 3)), { gan: 0.3, pos: { x: azar(-1.6, 1.6), y: 0.5, z: azar(-1.5, 1.5) } }); prox.crujido = t + azar(3500, 7500); }
    } else { P4.otros.length = 0; }
    if (fase === 'figura') {
      const q = Math.floor(tramo(P, 0.66, 0.86) * 22);
      if (q > P4.q && P < 0.83) sonar('paso-figura', { gan: 0.3 + 0.7 * q / 22, pos: { x: 0, y: -0.6, z: -(6 - 5.4 * q / 22) } });
      P4.q = q;
    } else if (fase !== 'cara') P4.q = -1;
    /* El latido */
    let bpm = 0, gl = 0;
    if (fase === 'pasillo') { const k = tramo(P, 0.04, 0.5); bpm = 58 + 24 * k; gl = 0.3 + 0.3 * k; }
    else if (fase === 'apagon') { bpm = 92; gl = 0.6; }
    else if (fase === 'calma') { bpm = 70; gl = 0.25; }
    else if (fase === 'figura' && P < 0.83) { const q = tramo(P, 0.66, 0.83); bpm = 96 + 58 * q; gl = 0.55 + 0.4 * q; }
    if (bpm && t > prox.latido) { sonar('latido', { gan: gl }); prox.latido = t + 60000 / bpm; }
    /* Respira alguien en la calma, a tu lado */
    if (fase === 'calma' && t > P4.respProg) { sonar('respiracion', { gan: 0.45, pos: { x: 0.85, z: 0.1 } }); P4.respProg = t + 4600; }
  }
  /* El cristal: la respiración va con el vaho (un ciclo cada 3,8 s; el vaho crece mientras suelta el aire) */
  function cristal() {
    const per = 3800, t = performance.now();
    const k = Math.ceil((t + 150 + 1500) / per), ini = k * per - 1500;
    if (ini > P4.respProg) {
      P4.respProg = ini;
      sonar('respiracion', { gan: 0.75, pos: { x: -0.95, z: 0.05 }, cuando: ahora() + (ini - t) / 1000 });
    }
  }
  /* El reloj de la casa sigue los segundos de verdad */
  let segProg = 0, tic = 0;
  function relojCasa(gan) {
    const ms = Date.now(), s = Math.floor(ms / 1000) + 1;
    if (s <= segProg) return;
    const espera = (s * 1000 - ms) / 1000;
    if (espera > 0.6) return;
    segProg = s; tic = 1 - tic;
    sonar(tic ? 'reloj-tic' : 'reloj-tac', { gan, pos: { x: -1.2, y: 0.3, z: -0.8 }, cuando: ahora() + espera });
  }

  /* La mezcla, veinte veces por segundo */
  const OBJ = {};
  let ultimaFase = '';
  function mezclar() {
    if (!encendido || !ac) return;
    const t = performance.now();
    const a = LB.acto, reg = !!LB.regreso, o = LB.oscuridad || { P: 0, fase: '' };
    const enOsc = a >= 4 && !E.bienvenido && o.P < 0.999;   // el pasillo deja de contar su avance al salir, por eso manda «Bienvenido»
    let fase = enOsc ? (o.fase || 'pasillo') : (a >= 5 ? 'final' : '');
    const silencio = fase === 'figura' && o.P >= 0.83;
    Object.keys(CAMAS).forEach(k => { OBJ[k] = 0; });
    const tc = {};
    if (a === 1) {
      if (reg) { OBJ.caja = 0.5; OBJ.viento = 0.22; }
      else { OBJ.jingle = 0.6; OBJ.pajaros = 0.5; OBJ.viento = 0.3; }
    } else if (a === 2) {
      OBJ.jingle = reg ? 0 : 0.58 - 0.22 * E.d; OBJ.caja = reg ? 0.38 : 0;
      OBJ.viento = 0.06 + 0.18 * (1 - E.d);
      OBJ.zumbido = 0.06 + 0.5 * E.d;
      OBJ.monitores = E.seg ? 0.6 : 0;
      tc.pajaros = 0.03;
    } else if (a === 3) {
      OBJ.casa = E.llamada ? 0.45 : 0.8; OBJ.zumbido = 0.16; OBJ.viento = 0.06; OBJ.linea = E.llamada ? 0.55 : 0;
    } else if (fase === 'pasillo') {
      const k = tramo(o.P, 0.04, 0.5);
      OBJ.dron = 0.3 + 0.3 * k; OBJ.zumbido = 0.24; OBJ.casa = 0.25 * (1 - k);
      OBJ.fluorescente = 0.55 * Math.pow(clamp(o.luz != null ? o.luz : 1, 0, 1.1), 3); tc.fluorescente = 0.012;
    } else if (fase === 'apagon') {
      OBJ.dron = 0.4; tc.zumbido = tc.fluorescente = tc.casa = 0.02;
    } else if (fase === 'calma') {
      OBJ.jingle = 0.13; OBJ.fluorescente = 0.34; OBJ.casa = 0.3; tc.dron = 0.15;
    } else if (fase === 'figura') {
      const q = tramo(o.P, 0.66, 0.83);
      OBJ.dron = 0.55 + 0.4 * q; OBJ.zumbido = 0.32;
      OBJ.fluorescente = 0.55 * Math.pow(clamp(o.luz != null ? o.luz : 1, 0, 1.1), 3); tc.fluorescente = 0.012;
      tc.jingle = 0.01;
      if (silencio) { Object.keys(OBJ).forEach(k => { OBJ[k] = 0; tc[k] = 0.03; }); }
    } else if (fase === 'cara') {
      if (calma) OBJ.dron = 0.6;
      Object.keys(CAMAS).forEach(k => { tc[k] = 0.02; });
    } else if (fase === 'negro') {
      OBJ.dron = 0.5; tc.dron = 0.8;
    } else if (fase === 'final') {
      OBJ.caja = E.bienvenido ? 0.5 : 0.2; OBJ.dron = 0.16;
    }
    if (fase !== ultimaFase) { apunta('fase ' + (fase || 'acto ' + a)); ultimaFase = fase; }
    /* Antes de seguir: arrancar lo que haga falta y ajustar cada capa */
    Object.keys(CAMAS).forEach(k => {
      const c = camas[k];
      if (OBJ[k] > 0 && !c.src && bufs[k]) arrancarCama(k);
      if (k === 'jingle' && c.parada) {
        if (OBJ.jingle > 0 && (fase === 'calma' || (a <= 2 && !E.seg))) arrancarCinta(fase === 'calma' ? 0.9 : 0.2);
        else return;
      }
      fija(c.g.gain, OBJ[k], tc[k] != null ? tc[k] : 0.35);
    });
    /* El jingle: en el acto 2 se gasta, baja de tono y ondula; en la calma suena desde otra habitación */
    const J = camas.jingle;
    if (J && J.src && !J.parada) {
      actualizarPos();
      let vel = 1, lp = 18000, wow = 0.0015, flut = 0;
      if (!prox.dip) prox.dip = t + azar(14000, 26000);
      if (a === 1 && !reg && t > prox.dip) { prox.dip = t + azar(24000, 45000); J.dipHasta = t + 450; apunta('jingle desafina'); }
      if (J.dipHasta > t) vel = 0.988;
      if (a === 2) { vel = 1 - 0.17 * E.d; lp = 16000 - 13500 * E.d; wow = 0.003 + 0.022 * E.d; flut = 0.0035 * E.d; }
      if (fase === 'calma') { vel = 0.96; lp = 650; wow = 0.007; }
      const enHipo = hipo && t - hipo < 1300;
      if (enHipo) vel = t - hipo < 380 ? 0.66 : vel;
      fija(J.src.playbackRate, +vel.toFixed(4), enHipo && t - hipo < 380 ? 0.08 : 0.35);
      fija(J.lp.frequency, Math.round(lp), 0.4); fija(J.wow.gain, +wow.toFixed(4), 0.5); fija(J.flut.gain, +flut.toFixed(4), 0.5);
    }
    /* Sueltos según la escena */
    if (a === 2 && E.seg && t > prox.rele) { sonar('rele-' + (1 + Math.floor(Math.random() * 3)), { gan: 0.3, pan: azar(-0.6, 0.6) }); prox.rele = t + azar(700, 3200); }
    if (a === 3) {
      relojCasa(E.hora ? 0.55 : E.llamada ? 0.08 : 0.2);
      if (!prox.puerta) prox.puerta = t + azar(14000, 26000);
      if (t > prox.puerta && !sonando.size) { sonar(elige(['puerta-lejos-1', 'puerta-lejos-2']), { gan: 0.55, pos: { x: elige([-2, 2]), z: 1.4 } }); prox.puerta = t + azar(28000, 55000); apunta('puerta lejos'); }
      if (E.cristal) cristal();
    }
    if (a >= 4 && enOsc && !silencio) pasillo(o, fase, t);
    else if (a >= 4) P4.fase = fase;
  }

  function poner(si) {
    encendido = si;
    boton.setAttribute('aria-pressed', String(si));
    boton.textContent = (si ? 'Sonido: encendido' : 'Sonido: apagado') + (LB.tactil ? '' : ' · M');
    if (si) {
      if (!ac) montar();
      if (ac.state !== 'running') ac.resume();
      rampa(salida.gain, 1, 0.3);
      Object.keys(prox).forEach(k => { prox[k] = 0; });
      cargarTodo();
      clearInterval(reloj); reloj = setInterval(mezclar, 50);
      apunta('encendido');
      mezclar();
    } else if (ac) {
      rampa(salida.gain, 0, 0.12);
      clearInterval(reloj);
      apunta('apagado');
      setTimeout(() => { if (!encendido) ac.suspend(); }, 600);
    }
  }

  LB.sonido = function () {
    boton.hidden = false;
    if (LB.tactil) boton.textContent = 'Sonido: apagado';
    secciones();
    eventos();
    boton.addEventListener('click', () => poner(!encendido));
    addEventListener('keydown', e => {
      if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey && !/input|textarea|select/i.test(e.target.tagName)) poner(!encendido);
    });
    /* En el móvil el sistema puede pausar el audio: se reanuda con el siguiente toque */
    const reanudar = () => { if (encendido && ac && ac.state !== 'running') ac.resume(); };
    ['pointerdown', 'touchend', 'keydown'].forEach(ev => addEventListener(ev, reanudar, { passive: true }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reanudar(); });
    LB.golpe = () => {
      if (!encendido) return;
      LB.golpe.lado = -(LB.golpe.lado || 1);
      sonar('golpe-mano', { gan: calma ? 0.35 : 0.9, pos: { x: LB.golpe.lado * 0.55, z: -0.6 } });
      apunta('mano en el cristal');
    };
    LB.chillido = () => {
      if (!encendido) return;
      Object.values(camas).forEach(c => rampa(c.g.gain, 0, 0.01));
      sonar('susto', { gan: 1 });
      apunta('susto');
    };
    /* Solo para mirar desde la consola: LB.sonidoEstado() */
    LB.sonidoEstado = () => ({
      encendido, contexto: ac ? ac.state : 'sin crear', cargados: Object.keys(bufs).length, total: TODOS.length, fallidos: fallidos.slice(),
      capas: ac ? Object.fromEntries(Object.entries(camas).map(([k, c]) => [k, +c.g.gain.value.toFixed(3)])) : {},
      jingle: ac && camas.jingle && camas.jingle.src ? { vel: +camas.jingle.src.playbackRate.value.toFixed(3), parada: camas.jingle.parada, filtro: Math.round(camas.jingle.lp.frequency.value) } : null,
      voces: sonando.size, sonados: Object.assign({}, veces), ultimos: registro.slice(-30)
    });
  };
})();
