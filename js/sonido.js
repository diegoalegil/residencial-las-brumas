/* Sonido procedural con WebAudio. Apagado hasta que lo enciendas (botón o tecla M). */
(function () {
  const boton = document.getElementById('sonido');
  let ac = null, encendido = false, salida, sala, capas = {}, ruidoBuf = null, reloj = 0;
  const prox = { pajaro: 0, latido: 0, crujido: 0, respiro: 0, nana: 0, tic: 0 };
  let ladoRespiro = -0.75;

  const ahora = () => ac.currentTime;
  const rampa = (param, valor, t = 0.6) => param.setTargetAtTime(valor, ahora(), t / 3);

  function bufferRuido(seg = 2) {
    const b = ac.createBuffer(1, ac.sampleRate * seg, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function impulso(seg = 2.8) {
    const n = ac.sampleRate * seg, b = ac.createBuffer(2, n, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); }
    return b;
  }
  function osc(tipo, frec, destino, det = 0) {
    const o = ac.createOscillator(); o.type = tipo; o.frequency.value = frec; o.detune.value = det; o.connect(destino); o.start(); return o;
  }
  function ganancia(v, destino) { const g = ac.createGain(); g.gain.value = v; g.connect(destino); return g; }
  function filtro(tipo, frec, q, destino) { const f = ac.createBiquadFilter(); f.type = tipo; f.frequency.value = frec; f.Q.value = q; f.connect(destino); return f; }
  function ruidoEn(destino, bucle = true) {
    const s = ac.createBufferSource(); s.buffer = ruidoBuf; s.loop = bucle; s.connect(destino); s.start(); return s;
  }

  function montar() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    ruidoBuf = bufferRuido(3);
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.25;
    comp.connect(ac.destination);
    salida = ganancia(0, comp);
    const rev = ac.createConvolver(); rev.buffer = impulso(); rev.connect(salida);
    sala = ganancia(0.9, rev);

    /* Acto 1: acorde tranquilo que luego se desafina */
    capas.pad = ganancia(0, salida);
    const lpPad = filtro('lowpass', 1400, 0.4, capas.pad);
    capas.voces = [osc('sine', 220, lpPad), osc('sine', 277.18, lpPad), osc('sine', 329.63, lpPad), osc('triangle', 110, lpPad)];
    const trem = osc('sine', 0.18, ganancia(0.012, capas.pad.gain));
    void trem;

    /* Zumbido grave constante */
    capas.zumbido = ganancia(0, salida);
    osc('sine', 50, capas.zumbido); osc('sine', 100, ganancia(0.35, capas.zumbido)); osc('sine', 150, ganancia(0.08, capas.zumbido));

    /* Dron */
    capas.dron = ganancia(0, salida);
    capas.lpDron = filtro('lowpass', 220, 2, capas.dron);
    osc('sawtooth', 55, capas.lpDron); osc('sawtooth', 55.6, capas.lpDron); osc('sine', 41.2, ganancia(0.6, capas.dron));

    /* Viento */
    capas.viento = ganancia(0, salida);
    const bp = filtro('bandpass', 480, 0.7, capas.viento);
    ruidoEn(bp);
    osc('sine', 0.07, ganancia(260, bp.frequency));

    /* Sala vacía: un fondo casi inaudible para que nunca haya silencio por accidente */
    capas.sala = ganancia(0, salida);
    ruidoEn(filtro('lowpass', 260, 0.5, capas.sala));
  }

  /* Eventos sueltos */
  function pajaro() {
    const t = ahora(), g = ganancia(0, salida), o = ac.createOscillator();
    o.type = 'sine'; o.connect(g);
    const f0 = 2600 + Math.random() * 1600;
    for (let k = 0; k < 3; k++) {
      const tk = t + k * 0.11;
      o.frequency.setValueAtTime(f0, tk); o.frequency.exponentialRampToValueAtTime(f0 * 1.35, tk + 0.06);
      g.gain.setValueAtTime(0, tk); g.gain.linearRampToValueAtTime(0.025, tk + 0.015); g.gain.linearRampToValueAtTime(0, tk + 0.08);
    }
    o.start(t); o.stop(t + 0.5);
  }
  function latido(fuerza) {
    [0, 0.17].forEach((d, i) => {
      const t = ahora() + d, g = ganancia(0, salida), o = ac.createOscillator();
      o.type = 'sine'; o.frequency.setValueAtTime(62, t); o.frequency.exponentialRampToValueAtTime(36, t + 0.16); o.connect(g);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(fuerza * (i ? 0.7 : 1), t + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.22);
      o.start(t); o.stop(t + 0.3);
    });
  }
  function crujido() {
    const t = ahora(), g = ganancia(0, sala), o = ac.createOscillator();
    const f = filtro('bandpass', 700, 9, g);
    o.type = 'sawtooth'; o.connect(f);
    const base = 70 + Math.random() * 60;
    o.frequency.setValueAtTime(base, t);
    for (let k = 1; k < 10; k++) o.frequency.linearRampToValueAtTime(base * (0.8 + Math.random() * 0.5), t + k * 0.07);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.05); g.gain.linearRampToValueAtTime(0.0, t + 0.75);
    o.start(t); o.stop(t + 0.8);
  }
  function respiro(fuerza) {
    const t = ahora();
    const pan = ac.createStereoPanner(); pan.pan.value = ladoRespiro; pan.connect(salida);
    ladoRespiro = ladoRespiro < 0 ? 0.68 : -0.78;
    const eco = ac.createDelay(); eco.delayTime.value = 0.014;
    const gEco = ganancia(0.35, salida); eco.connect(gEco);
    const g = ac.createGain(); g.gain.value = 0; g.connect(pan); g.connect(eco);
    const f = filtro('bandpass', 950, 1.1, g);
    const s = ac.createBufferSource(); s.buffer = ruidoBuf; s.connect(f);
    f.frequency.setValueAtTime(700, t); f.frequency.linearRampToValueAtTime(1300, t + 1.3); f.frequency.linearRampToValueAtTime(600, t + 3.2);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(fuerza, t + 1.2); g.gain.linearRampToValueAtTime(fuerza * 0.2, t + 1.5);
    g.gain.linearRampToValueAtTime(fuerza * 0.8, t + 2.1); g.gain.linearRampToValueAtTime(0, t + 3.4);
    s.start(t, Math.random()); s.stop(t + 3.5);
  }
  /* Nana: una voz hecha de filtros, desafinada y desde otra habitación */
  const MELODIA = [[659.3, 0.6], [523.3, 0.6], [587.3, 0.6], [659.3, 0.9], [440, 0.6], [440, 0.6], [523.3, 0.6], [493.9, 1.2],
    [440, 0.6], [392, 0.6], [440, 0.6], [329.6, 0.9], [349.2, 0.6], [329.6, 0.6], [293.7, 0.6], [329.6, 1.6]];
  function nana(volumen) {
    let t = ahora() + 0.05;
    const g = ganancia(0, sala), seca = ganancia(0, salida);
    const lp = filtro('lowpass', 1100, 0.6, g); lp.connect(seca);
    const forma = ac.createWaveShaper();
    const curva = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curva[i] = Math.tanh(x * 2.4); }
    forma.curve = curva; forma.connect(lp);
    const f1 = filtro('bandpass', 420, 6, forma), f2 = filtro('bandpass', 980, 7, forma);
    const o = ac.createOscillator(); o.type = 'sawtooth'; o.connect(f1); o.connect(f2);
    const vib = osc('sine', 5.2, ganancia(9, o.detune));
    const inicio = t;
    MELODIA.forEach(([fr, d], i) => {
      o.frequency.setValueAtTime(fr * 0.5, t);
      o.detune.setValueAtTime(-i * 3.5 - (i % 5 === 3 ? 38 : 0), t);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volumen, t + 0.08); g.gain.linearRampToValueAtTime(volumen * 0.5, t + d * 0.9);
      seca.gain.setValueAtTime(0, t); seca.gain.linearRampToValueAtTime(volumen * 0.25, t + 0.08); seca.gain.linearRampToValueAtTime(0, t + d * 0.95);
      t += d;
    });
    g.gain.linearRampToValueAtTime(0, t + 0.2);
    o.start(inicio); o.stop(t + 0.4); vib.stop(t + 0.4);
    return t - inicio;
  }
  function tic() {
    const t = ahora(), g = ganancia(0, salida), o = ac.createOscillator();
    o.type = 'square'; o.frequency.value = 900 + Math.random() * 1400; o.connect(g);
    g.gain.setValueAtTime(0.018, t); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.05);
    o.start(t); o.stop(t + 0.06);
  }
  function golpe() {
    if (!encendido) return;
    const t = ahora(), g = ganancia(0, salida), o = ac.createOscillator();
    o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.25); o.connect(g);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.7, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.start(t); o.stop(t + 0.45);
    const gr = ganancia(0, salida), s = ac.createBufferSource(); s.buffer = ruidoBuf; s.connect(filtro('lowpass', 380, 0.7, gr));
    gr.gain.setValueAtTime(0.4, t); gr.gain.exponentialRampToValueAtTime(0.001, t + 0.2); s.start(t); s.stop(t + 0.25);
  }
  function chillido() {
    if (!encendido) return;
    const t = ahora();
    const g = ganancia(0, salida), bp = filtro('bandpass', 1800, 3, g);
    const s = ac.createBufferSource(); s.buffer = ruidoBuf; s.connect(bp);
    bp.frequency.setValueAtTime(1500, t); bp.frequency.exponentialRampToValueAtTime(3400, t + 0.35); bp.frequency.exponentialRampToValueAtTime(2200, t + 1.6);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.9, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
    s.start(t); s.stop(t + 1.9);
    const gv = ganancia(0, salida), forma = ac.createWaveShaper();
    const curva = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curva[i] = Math.tanh(x * 6); }
    forma.curve = curva; forma.connect(filtro('bandpass', 1400, 1.2, gv));
    const v = ac.createOscillator(); v.type = 'sawtooth'; v.connect(forma);
    v.frequency.setValueAtTime(520, t); v.frequency.exponentialRampToValueAtTime(1150, t + 0.25); v.frequency.exponentialRampToValueAtTime(760, t + 1.5);
    const vb = osc('sine', 11, ganancia(60, v.frequency));
    gv.gain.setValueAtTime(0, t); gv.gain.linearRampToValueAtTime(0.5, t + 0.03); gv.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
    v.start(t); v.stop(t + 1.7); vb.stop(t + 1.7);
    const gb = ganancia(0, salida), b = ac.createOscillator(); b.type = 'sine'; b.connect(gb);
    b.frequency.setValueAtTime(64, t); b.frequency.exponentialRampToValueAtTime(26, t + 1.3);
    gb.gain.setValueAtTime(0, t); gb.gain.linearRampToValueAtTime(0.9, t + 0.01); gb.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    b.start(t); b.stop(t + 1.6);
    const gc = ganancia(0, salida), lc = filtro('lowpass', 900, 1, gc);
    [110, 116.5, 164.8, 174.6].forEach(fr => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(lc); o.start(t); o.stop(t + 2.4); });
    gc.gain.setValueAtTime(0, t); gc.gain.linearRampToValueAtTime(0.28, t + 0.02); gc.gain.exponentialRampToValueAtTime(0.001, t + 2.3);
  }

  /* Mezcla según el acto, diez veces por segundo */
  function mezclar() {
    if (!encendido) return;
    const a = LB.acto, o = LB.oscuridad || { fase: '', P: 0 }, reg = !!LB.regreso;
    const enOsc = a >= 4 && o.P > 0.01 && o.P < 0.999;
    const fase = enOsc ? o.fase : (a >= 5 ? 'final' : '');
    const calmaF = fase === 'calma';
    rampa(capas.pad.gain, a === 1 ? 0.055 : a === 2 ? 0.04 : 0, 1.5);
    const agrio = a >= 2;
    capas.voces[1].detune.setTargetAtTime(agrio ? 38 : 0, ahora(), 1.2);
    capas.voces[2].detune.setTargetAtTime(agrio ? -27 : 0, ahora(), 1.6);
    rampa(capas.zumbido.gain, calmaF || fase === 'negro' ? 0 : a === 2 ? 0.035 : a === 3 ? 0.05 : a >= 4 ? 0.065 : 0, calmaF ? 0.15 : 1.2);
    const dron = a === 3 ? 0.05 : a === 4 ? 0.08 : fase === 'figura' ? 0.11 : calmaF ? 0 : a >= 5 ? 0.035 : 0;
    rampa(capas.dron.gain, dron, calmaF ? 0.2 : 1.5);
    capas.lpDron.frequency.setTargetAtTime(fase === 'figura' ? 520 : 220, ahora(), 0.8);
    rampa(capas.viento.gain, a === 3 ? 0.035 : a === 4 && fase === 'pasillo' ? 0.05 : 0, 2);
    rampa(capas.sala.gain, a >= 3 ? 0.02 : 0, 1);

    const t = performance.now();
    if (a === 1 && !reg && t > prox.pajaro) { pajaro(); prox.pajaro = t + 1200 + Math.random() * 3200; }
    const latiendo = (a === 4 && fase === 'pasillo') || fase === 'figura';
    if (latiendo && t > prox.latido) {
      const k = fase === 'figura' ? LB.tramo(o.P, 0.66, 0.86) : 0;
      latido(0.32 + k * 0.3);
      prox.latido = t + (fase === 'figura' ? 850 - k * 430 : 1050);
    }
    if (a === 4 && fase === 'pasillo' && t > prox.crujido) { crujido(); prox.crujido = t + 2500 + Math.random() * 3800; }
    if ((a >= 4 && fase !== 'cara') && t > prox.respiro) { respiro(calmaF ? 0.22 : 0.12); prox.respiro = t + 3900 + Math.random() * 900; }
    if ((a === 3 || (reg && a <= 2)) && t > prox.nana) { const d = nana(reg ? 0.05 : 0.09); prox.nana = t + d * 1000 + 2500; }
    if (a === 3 && t > prox.tic && Math.random() < 0.3) { tic(); prox.tic = t + 400 + Math.random() * 1600; }
  }

  function poner(si) {
    encendido = si;
    boton.setAttribute('aria-pressed', String(si));
    boton.textContent = si ? 'Sonido: encendido · M' : 'Sonido: apagado · M';
    if (si) {
      if (!ac) montar();
      ac.resume();
      rampa(salida.gain, 0.9, 0.8);
      Object.keys(prox).forEach(k => { prox[k] = 0; });
      clearInterval(reloj); reloj = setInterval(mezclar, 100);
      mezclar();
    } else if (ac) {
      rampa(salida.gain, 0, 0.3);
      clearInterval(reloj);
      setTimeout(() => { if (!encendido) ac.suspend(); }, 450);
    }
  }

  LB.sonido = function () {
    boton.hidden = false;
    boton.addEventListener('click', () => poner(!encendido));
    addEventListener('keydown', e => {
      if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey && !/input|textarea|select/i.test(e.target.tagName)) poner(!encendido);
    });
    LB.golpe = golpe;
    LB.chillido = chillido;
  };
})();
