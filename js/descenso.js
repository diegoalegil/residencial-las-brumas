/* Actos 4 y 5: el pasillo, la calma falsa, la figura y la vuelta al principio */
(function () {
  const { calma, tramo, clamp, azar, raiz } = LB;
  const L = 22, W = 1.1, SUELO = -1, TECHO = 1.25;
  const LAMPARAS = [3, 9, 15, 21];
  const PUERTAS = [
    { lado: -1, z: 2.2 }, { lado: 1, z: 4.6 }, { lado: -1, z: 7.4 }, { lado: 1, z: 9.8, abre: true },
    { lado: -1, z: 11.2, ojos: true }, { lado: 1, z: 15.6 }, { lado: -1, z: 18.4 },
    { lado: 1, z: 13.0, octava: true }
  ];
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

  let cv, ctx, w = 0, h = 0, dpr = 1;
  let Pobj = 0, P = 0, activo = false;
  const cam = { x: 0, y: 0, z: 0 };
  const lamp = LAMPARAS.map(() => ({ on: true, hasta: 0, nivel: 1 }));
  let figZ = 21.2, figObjetivo = 21.2, pose = null, proximaPose = 0;
  let caraVisible = false, caraCambio = 0, ultimoChillido = 0;

  function medir() {
    dpr = Math.min(devicePixelRatio || 1, 1.25);
    w = cv.width = Math.round(cv.clientWidth * dpr);
    h = cv.height = Math.round(cv.clientHeight * dpr);
  }

  /* Proyección */
  let f = 1, cx = 0, cy = 0;
  const pr = (x, y, z) => { const dz = Math.max(0.05, z - cam.z); return [cx + (x - cam.x) / dz * f, cy - (y - cam.y) / dz * f]; };
  function quad(a, b, c, d, color) {
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
  }
  const rgb = (r, g, b, k) => `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`;

  /* Luz: lámparas que fallan, nunca más de dos veces por segundo */
  function luz(z) {
    let b = 0.035;
    LAMPARAS.forEach((lz, i) => { b += Math.exp(-((z - lz) ** 2) / 7) * lamp[i].nivel; });
    return b * Math.exp(-Math.max(0, z - cam.z) * 0.075);
  }
  function actualizarLamparas(t, fase) {
    lamp.forEach((l, i) => {
      if (fase === 'apagon') { l.nivel += (0 - l.nivel) * 0.25; return; }
      if (fase === 'calma' || calma) { l.nivel += ((fase === 'calma' ? 1.45 : 1.05) - l.nivel) * 0.2; l.on = true; return; }
      if (t > l.hasta) {
        const nervio = fase === 'figura' ? 0.5 : 1;
        if (l.on) {
          /* Un solo apagón a la vez y como mucho uno cada 0,7 s: nada de destellos seguidos */
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
  function forzarApagon(i, t, ms) { lamp[i].on = false; lamp[i].hasta = t + ms; proximoApagon = Math.max(proximoApagon, t + ms + 700); }

  /* La figura: miembros demasiado largos y pose a tirones */
  function nuevaPose(t, intensa) {
    const j = intensa ? 1.6 : 1;
    pose = {
      ladeo: Math.random() < (intensa ? 0.45 : 0.2) ? azar(0.9, 1.45) * (Math.random() < 0.5 ? -1 : 1) : azar(-0.35, 0.35),
      hombro: azar(-0.05, 0.05) * j, codoI: azar(-0.06, 0.06) * j, codoD: azar(-0.06, 0.06) * j,
      manoI: azar(-0.05, 0.08) * j, manoD: azar(-0.05, 0.08) * j, rodilla: azar(-0.04, 0.04) * j, dx: azar(-0.03, 0.03) * j
    };
    proximaPose = t + (intensa ? azar(90, 190) : azar(400, 1100));
  }
  function figura(z, x, t, intensa, ojos) {
    const dz = z - cam.z; if (dz < 0.2) return;
    if (!pose || t > proximaPose) nuevaPose(t, intensa);
    const u = f / dz, [bx, by] = pr(x + pose.dx, SUELO, z);
    const P2 = (px, py) => [bx + px * u, by - py * u];
    ctx.fillStyle = '#040404'; ctx.strokeStyle = '#040404'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const linea = (pts, ancho) => { ctx.lineWidth = ancho * u; ctx.beginPath(); pts.forEach((p, i) => { const q = P2(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); };
    linea([[-0.07, 1.05], [-0.1 + pose.rodilla, 0.55], [-0.11, 0]], 0.055);
    linea([[0.07, 1.05], [0.1 - pose.rodilla, 0.55], [0.12, 0]], 0.055);
    ctx.beginPath(); [[-0.09, 1.02], [0.09, 1.02], [0.17, 1.74 + pose.hombro], [-0.17, 1.74 - pose.hombro]].forEach((p, i) => { const q = P2(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.fill();
    linea([[-0.16, 1.72 - pose.hombro], [-0.27 + pose.codoI, 1.12], [-0.25 + pose.manoI, 0.36]], 0.045);
    linea([[0.16, 1.72 + pose.hombro], [0.28 + pose.codoD, 1.1], [0.26 + pose.manoD, 0.34]], 0.045);
    [[-0.25 + pose.manoI, 0.36, -1], [0.26 + pose.manoD, 0.34, 1]].forEach(([hx, hy, s]) => {
      for (let k = 0; k < 4; k++) linea([[hx, hy], [hx + s * (k - 1.5) * 0.025, hy - 0.16 - (k % 2) * 0.03]], 0.014);
    });
    const a = pose.ladeo, cuelloX = 0, cuelloY = 1.8;
    const hx = cuelloX + Math.sin(a) * 0.2, hy = cuelloY + Math.cos(a) * 0.17;
    linea([[cuelloX, 1.72], [cuelloX, cuelloY], [hx * 0.6, hy - 0.04]], 0.05);
    const [qx, qy] = P2(hx, hy);
    ctx.beginPath(); ctx.ellipse(qx, qy, 0.1 * u, 0.135 * u, a, 0, Math.PI * 2); ctx.fill();
    if (ojos) {
      ctx.fillStyle = 'rgba(214,206,190,0.85)';
      [-1, 1].forEach(s => { const ex = qx + Math.cos(a) * s * 0.035 * u, ey = qy - Math.sin(a) * s * 0.035 * u; ctx.beginPath(); ctx.arc(ex, ey, Math.max(1, 0.009 * u), 0, Math.PI * 2); ctx.fill(); });
    }
  }

  /* El primer plano */
  function primerPlano(t, k) {
    const S = Math.max(w, h * 0.9);
    const temblor = calma ? 0 : (1 - k) * 10 * dpr + 3 * dpr;
    ctx.fillStyle = '#020202'; ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2 + azar(-temblor, temblor), h * 0.56 + azar(-temblor, temblor));
    const tir = Math.floor(t / 110) % 5 === 0 ? 0.06 : 0;
    ctx.rotate(0.22 + k * 0.28 + tir);
    const piel = ctx.createRadialGradient(-S * 0.05, -S * 0.05, S * 0.05, 0, 0, S * 0.6);
    piel.addColorStop(0, '#9d998d'); piel.addColorStop(0.6, '#77746a'); piel.addColorStop(1, '#2a2925');
    ctx.fillStyle = piel;
    ctx.beginPath(); ctx.ellipse(0, 0, S * 0.36, S * 0.56, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(40,38,34,0.55)';
    ctx.beginPath(); ctx.ellipse(-S * 0.13, -S * 0.11, S * 0.13, S * 0.11, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(S * 0.14, -S * 0.08, S * 0.12, S * 0.11, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-S * 0.2, S * 0.14, S * 0.07, S * 0.18, 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(S * 0.21, S * 0.16, S * 0.07, S * 0.18, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#030303';
    ctx.beginPath(); ctx.ellipse(-S * 0.13, -S * 0.12, S * 0.08, S * 0.062, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(S * 0.14, -S * 0.085, S * 0.07, S * 0.068, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d9d3c4';
    ctx.beginPath(); ctx.arc(-S * 0.12 + azar(-2, 2) * dpr, -S * 0.12, S * 0.007, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(S * 0.155 + azar(-2, 2) * dpr, -S * 0.085, S * 0.005, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(20,18,16,0.7)'; ctx.lineWidth = S * 0.003;
    ctx.beginPath(); ctx.moveTo(-S * 0.05, -S * 0.42); ctx.lineTo(-S * 0.03, -S * 0.32); ctx.lineTo(-S * 0.06, -S * 0.25); ctx.lineTo(-S * 0.04, -S * 0.2);
    ctx.moveTo(S * 0.22, S * 0.02); ctx.lineTo(S * 0.26, S * 0.12); ctx.lineTo(S * 0.24, S * 0.2); ctx.stroke();
    const boca = S * (0.07 + k * 0.24), my = S * 0.17 + boca * 0.55;
    ctx.fillStyle = '#020202';
    ctx.beginPath(); ctx.moveTo(-S * 0.07, S * 0.17); ctx.bezierCurveTo(-S * 0.1, my, -S * 0.05, my + boca * 0.7, S * 0.01, my + boca * 0.6);
    ctx.bezierCurveTo(S * 0.07, my + boca * 0.7, S * 0.11, my, S * 0.08, S * 0.17); ctx.bezierCurveTo(S * 0.03, S * 0.15, -S * 0.03, S * 0.15, -S * 0.07, S * 0.17); ctx.fill();
    ctx.fillStyle = '#8e887a';
    for (let i = 0; i < 11; i++) {
      const px = -S * 0.06 + i * S * 0.0135, largo = S * (0.018 + ((i * 7) % 5) * 0.006);
      ctx.beginPath(); ctx.moveTo(px - S * 0.005, S * 0.163); ctx.lineTo(px + S * 0.005, S * 0.163); ctx.lineTo(px + S * 0.001, S * 0.163 + largo); ctx.fill();
    }
    ctx.strokeStyle = '#040404'; ctx.lineCap = 'round';
    const mechones = [[-0.34, 0.03, 0.75], [-0.3, 0.028, 0.7], [-0.25, 0.022, 0.62], [-0.2, 0.016, 0.5], [-0.15, 0.012, 0.42], [-0.08, 0.01, 0.12], [0.02, 0.008, 0.05], [0.1, 0.012, 0.3], [0.17, 0.014, 0.48], [0.23, 0.02, 0.6], [0.28, 0.026, 0.72], [0.33, 0.032, 0.78], [-0.11, 0.006, 0.05]];
    mechones.forEach(([x, g, largo], i) => {
      const ox = Math.sin(t / 700 + i) * S * 0.004;
      ctx.lineWidth = S * g;
      ctx.beginPath(); ctx.moveTo(S * x * 0.7, -S * 0.58);
      ctx.bezierCurveTo(S * (x * 1.1) + ox, -S * 0.3, S * (x * 0.95 + 0.02 * Math.sin(i)) + ox, S * 0.0, S * (x * 1.05) + ox, S * (largo - 0.2));
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* Un fotograma */
  function pintar(t) {
    requestAnimationFrame(pintar);
    if (!activo || !w) return;
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
    if (caraVisible) { primerPlano(t, tramo(P, 0.86, 0.905)); return; }

    if (fase === 'negro' || (fase === 'cara' && !calma)) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); return; }

    actualizarLamparas(t, fase);
    LB.oscuridad.luz = lamp.reduce((s, l) => s + l.nivel, 0) / lamp.length;
    cam.z = 12.5 * gsap.parseEase('power1.inOut')(tramo(calma ? Math.round(P * 14) / 14 : P, 0.04, 0.5));
    cam.x = calma ? 0 : Math.sin(t / 1900) * 0.025;
    cam.y = Math.sin(cam.z * 4.2) * 0.022;
    f = h * 0.82; cx = w / 2; cy = h * 0.47;

    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    const z0 = cam.z + 0.12;
    const finAbierto = P >= 0.5;
    const b = luz(L - 0.2);
    quad(pr(-W, SUELO, L), pr(W, SUELO, L), pr(W, TECHO, L), pr(-W, TECHO, L), rgb(84, 86, 74, b));
    quad(pr(-0.45, SUELO, L), pr(0.45, SUELO, L), pr(0.45, 0.95, L), pr(-0.45, 0.95, L), finAbierto ? '#010101' : rgb(58, 40, 28, b));

    const pasos = [];
    for (let z = L; z > z0; z -= 1) pasos.push([Math.max(z - 1, z0), z]);
    pasos.forEach(([za, zb]) => {
      const zm = (za + zb) / 2, k = luz(zm);
      quad(pr(-W, SUELO, za), pr(-W, TECHO, za), pr(-W, TECHO, zb), pr(-W, SUELO, zb), rgb(92, 96, 80, k));
      quad(pr(W, SUELO, za), pr(W, TECHO, za), pr(W, TECHO, zb), pr(W, SUELO, zb), rgb(86, 90, 75, k));
      quad(pr(-W, SUELO, za), pr(W, SUELO, za), pr(W, SUELO, zb), pr(-W, SUELO, zb), rgb(74, 54, 38, k));
      quad(pr(-W, TECHO, za), pr(W, TECHO, za), pr(W, TECHO, zb), pr(-W, TECHO, zb), rgb(62, 62, 58, k * 0.8));
      [-W, W].forEach(x => {
        quad(pr(x, SUELO, za), pr(x, -0.86, za), pr(x, -0.86, zb), pr(x, SUELO, zb), rgb(40, 32, 26, k));
        quad(pr(x, -0.12, za), pr(x, -0.07, za), pr(x, -0.07, zb), pr(x, -0.12, zb), rgb(120, 112, 96, k));
      });
    });
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.2 * dpr;
    [-0.66, -0.22, 0.22, 0.66].forEach(x => { const a = pr(x, SUELO, z0), c = pr(x, SUELO, L); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); });

    PUERTAS.forEach(p => {
      if (p.octava && P < 0.55) return;
      if (p.z + 0.9 < z0) return;
      const x = p.lado * W, za = Math.max(p.z, z0), zb = p.z + 0.9, k = luz(p.z + 0.45);
      quad(pr(x, SUELO, za), pr(x, 0.95, za), pr(x, 0.95, zb), pr(x, SUELO, zb), rgb(30, 24, 18, k));
      quad(pr(x, SUELO, za + 0.05), pr(x, 0.9, za + 0.05), pr(x, 0.9, zb - 0.05), pr(x, SUELO, zb - 0.05), rgb(66, 46, 32, k));
      if (p.ojos) {
        quad(pr(x, SUELO, zb - 0.16), pr(x, 0.9, zb - 0.16), pr(x, 0.9, zb - 0.05), pr(x, SUELO, zb - 0.05), '#010101');
        if ((t % 5200) > 260) {
          ctx.fillStyle = 'rgba(222,214,196,0.8)';
          [0.47, 0.47].forEach((yy, i) => { const q = pr(x * 0.99, yy, zb - 0.12 + i * 0.05); ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(1, 3.4 * dpr * 3 / Math.max(1, p.z - cam.z)), 0, Math.PI * 2); ctx.fill(); });
        }
      }
      if (p.abre) {
        const ab = tramo(cam.z, 4, 9.6) * 0.38;
        if (ab > 0) quad(pr(x, SUELO, za + 0.05), pr(x, 0.9, za + 0.05), pr(x - p.lado * ab, 0.9, za + 0.05 + ab * 0.4), pr(x - p.lado * ab, SUELO, za + 0.05 + ab * 0.4), '#020202');
      }
      ctx.fillStyle = rgb(190, 160, 100, k);
      const pomo = pr(x * 0.995, -0.05, zb - 0.14); ctx.beginPath(); ctx.arc(pomo[0], pomo[1], Math.max(1, 2.2 * dpr * 3 / Math.max(1, p.z - cam.z)), 0, Math.PI * 2); ctx.fill();
    });

    const cz = 6.2;
    if (cz > z0) {
      const k = luz(cz);
      quad(pr(W, 0.15, cz), pr(W, 0.75, cz), pr(W, 0.75, cz + 0.7), pr(W, 0.15, cz + 0.7), rgb(26, 22, 16, k));
      quad(pr(W, 0.2, cz + 0.05), pr(W, 0.7, cz + 0.05), pr(W, 0.7, cz + 0.65), pr(W, 0.2, cz + 0.65), rgb(150, 160, 150, k));
      quad(pr(W, 0.2, cz + 0.2), pr(W, 0.48, cz + 0.2), pr(W, 0.48, cz + 0.5), pr(W, 0.2, cz + 0.5), rgb(220, 214, 200, k));
      if (P >= 0.55) quad(pr(W, 0.2, cz + 0.12), pr(W, 0.62, cz + 0.12), pr(W, 0.62, cz + 0.16), pr(W, 0.2, cz + 0.16), '#030303');
    }

    LAMPARAS.forEach((lz, i) => {
      if (lz < z0) return;
      const q = pr(0, TECHO - 0.05, lz), r = Math.max(1.5, 0.05 * f / (lz - cam.z));
      ctx.fillStyle = `rgba(250,226,170,${(0.15 + lamp[i].nivel * 0.85).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, Math.PI * 2); ctx.fill();
    });

    if (fase === 'pasillo') {
      const objetivo = P < 0.2 ? 21.2 : P < 0.32 ? 20.1 : P < 0.44 ? 18.8 : 17.3;
      if (objetivo !== figObjetivo) { figObjetivo = objetivo; forzarApagon(3, t, 380); forzarApagon(2, t, 300); }
      if (lamp[3].nivel < 0.3) figZ = figObjetivo;
      if (figZ > z0 + 0.3) figura(figZ, 0, t, false, false);
    } else if (fase === 'figura') {
      const q = Math.floor(tramo(P, 0.66, 0.86) * 22) / 22;
      figZ = 21 - q * (21 - (cam.z + 0.8));
      figura(figZ, Math.sin(q * 9) * 0.06, t, true, q > 0.35);
    } else if (fase === 'cara' && calma) {
      ctx.globalAlpha = tramo(P, 0.86, 0.9);
      primerPlano(t, 0.4);
      ctx.globalAlpha = 1;
    }

    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
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
    ScrollTrigger.create({ trigger: '.bienvenido', start: 'top 80%', onEnter: contar, onEnterBack: contar });
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
    cv = document.getElementById('pasillo');
    ctx = cv.getContext('2d');
    medir();
    addEventListener('resize', () => { if (Math.abs(cv.clientWidth * Math.min(devicePixelRatio || 1, 1.25) - w) > 2 || Math.abs(cv.clientHeight * Math.min(devicePixelRatio || 1, 1.25) - h) > 120) medir(); });
    ScrollTrigger.create({
      trigger: '#oscuridad', start: 'top top', end: 'bottom bottom',
      onUpdate: s => { Pobj = s.progress; },
      onToggle: s => { activo = s.isActive || s.progress > 0 && s.progress < 1; }
    });
    new IntersectionObserver(es => { activo = es[0].isIntersecting; }).observe(cv);
    let medido = false;
    LB.alCambiarActo(n => { if (n === 4 && !medido) { medido = true; ScrollTrigger.refresh(); } });
    textos();
    pesadez();
    trampa();
    requestAnimationFrame(pintar);
  };
})();
