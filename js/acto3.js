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

  /* Son las 05:40 */
  function hora() {
    const caja = document.getElementById('hora-texto');
    const preg = document.getElementById('hora-pregunta');
    const pie = document.getElementById('hora-pie');
    const ponerHora = () => {
      const h = new Date().getHours();
      caja.textContent = (h === 1 ? 'Es la ' : 'Son las ') + LB.hora() + '.';
    };
    ponerHora();
    const h = new Date().getHours();
    preg.textContent = (h < 7 || h >= 22) ? '¿Por qué sigues despierto?'
      : h < 13 ? '¿Has dormido algo? Nosotros no.'
      : h < 20 ? 'Todavía es de día. Aprovéchalo.'
      : 'Pronto apagarán las farolas.';
    let visible = false;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(document.querySelector('.hora'));
    setInterval(() => {
      if (!visible) return;
      ponerHora();
      pie.textContent = 'Llevas ' + LB.tiempoDentro() + ' en Las Brumas. Nadie te ha visto entrar.';
    }, 1000);
    pie.textContent = 'Llevas ' + LB.tiempoDentro() + ' en Las Brumas. Nadie te ha visto entrar.';

    const txt = preg.textContent;
    preg.setAttribute('aria-label', txt);
    preg.innerHTML = txt.split(' ').map(p => `<span class="w" aria-hidden="true">${[...p].map(c => `<span class="l">${c}</span>`).join('')}</span>`).join(' ');
    if (calma) return;
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

  /* Preguntas que no deberían tener respuesta */
  function saben() {
    const caja = document.getElementById('texto-saben');
    const escribir = () => {
      const v = LB.visita;
      const atras = LB.atras;
      const items = [
        ['¿Saben quién soy?', `No nos hace falta. Sabemos que son las ${LB.hora()}, que tu pantalla mide ${innerWidth} píxeles de ancho y ${atras === 0 ? 'que todavía no has vuelto atrás. Haces bien.' : `que has intentado volver atrás ${atras} ${atras === 1 ? 'vez' : 'veces'}.`}`],
        ['¿Puedo cancelar la visita?', v ? `La visita del ${v.dia} a las ${v.hora} no se puede cancelar. Ya ha empezado.` : 'No reservaste ninguna. Te hemos reservado una igualmente: hoy, a las 03:00.'],
        ['¿Qué pasó con los anteriores dueños de la casa 14?', 'Siguen en la casa 14. Por la noche se les oye poner la mesa.'],
        ['¿Por qué la casa piloto es tan barata?', 'Porque no se paga con dinero.'],
        ['¿Por qué los perros no quieren entrar?', 'Porque lo ven.'],
        ['¿Quién más está leyendo esto?', 'Hay alguien detrás de ti. No te gires todavía.'],
        ['¿Cómo salgo de aquí?', 'Esa pregunta todavía no tiene respuesta.']
      ];
      caja.innerHTML = items.map(([p, r]) => `<p><strong>${p}</strong> ${r}</p>`).join('');
    };
    escribir();
    const reescribir = () => { const antes = caja.offsetHeight; escribir(); if (caja.offsetHeight !== antes) ScrollTrigger.refresh(); };
    ScrollTrigger.create({ trigger: '.saben', start: 'top bottom', onEnter: reescribir, onEnterBack: reescribir });
  }

  /* Notas de voz de Pilar */
  const NOTAS = [
    ['3 de marzo', '0:12', 'Mamá, ya estamos en la casa. Es preciosa, de verdad. Hay niebla todo el día, pero a los niños les encanta.'],
    ['6 de marzo', '0:21', 'Oye, ¿tú sabes si los de la casa 13 tienen una niña? Lucía dice que una niña la llama desde el pinar. Por la noche.'],
    ['9 de marzo', '0:09', 'No consigo dormir. Alguien sube la escalera a las tres. Siempre a las tres. Javi dice que es la madera.'],
    ['13 de marzo', '0:17', 'Hemos contado las puertas del pasillo. Siete. Lucía dice que hay ocho. Mamá, hoy yo también he contado ocho.'],
    ['17 de marzo', '0:06', '(susurrando) Está en el cuarto de Lucía. De pie. No se mueve. Es más alto que la puerta.'],
    ['19 de marzo', '2:41', '(dos minutos y cuarenta y un segundos de respiración)']
  ];
  function notas() {
    const lista = document.getElementById('lista-notas');
    const r = semilla(3);
    lista.innerHTML = NOTAS.map(([dia, dur, texto], i) => {
      const barras = Array.from({ length: 34 }, (_, k) => {
        const base = i === 5 ? 0.18 + 0.12 * Math.sin(k / 2.2) : 0.2 + r() * (0.5 + i * 0.1);
        return `<span style="height:${Math.round(Math.min(1, base) * 100)}%"></span>`;
      }).join('');
      return `<article class="nota-voz" data-paso="${i}">
        <p class="nota-meta">Pilar · ${dia} · ${dur}</p>
        <div class="onda" aria-hidden="true">${barras}</div>
        <p class="nota-texto" data-texto="${texto.replace(/"/g, '&quot;')}">${texto}</p>
      </article>`;
    }).join('');
    if (calma) return;
    lista.querySelectorAll('.nota-texto').forEach(p => {
      const completo = p.dataset.texto;
      p.innerHTML = '<span class="ya"></span><span class="aun"></span>';
      const ya = p.firstChild, aun = p.lastChild;
      aun.textContent = completo;
      ScrollTrigger.create({
        trigger: p, start: 'top 82%', once: true,
        onEnter: () => {
          let i = 0;
          const id = setInterval(() => { i += 2; ya.textContent = completo.slice(0, i); aun.textContent = completo.slice(i); if (i >= completo.length) clearInterval(id); }, 28);
        }
      });
    });
  }

  /* Dibujos a cera */
  function garabato(r, puntos, j = 2.4, cerrar = false) {
    const pts = cerrar ? puntos.concat([puntos[0]]) : puntos;
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const pasos = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 14));
      for (let s = 1; s <= pasos; s++) {
        const t = s / pasos;
        d += ` L${(x0 + (x1 - x0) * t + (r() - 0.5) * j).toFixed(1)} ${(y0 + (y1 - y0) * t + (r() - 0.5) * j).toFixed(1)}`;
      }
    }
    return d;
  }
  function circulo(cx, cy, rad, n = 12) { return Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * Math.PI * 2) * rad, cy + Math.sin(i / n * Math.PI * 2) * rad]); }
  function trazo(r, pts, color, ancho = 4, cerrar = false) {
    return `<path d="${garabato(r, pts, 2.6, cerrar)}" stroke="${color}" stroke-width="${ancho}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/><path d="${garabato(r, pts, 3.2, cerrar)}" stroke="${color}" stroke-width="${ancho * 0.6}" fill="none" stroke-linecap="round" opacity=".55"/>`;
  }
  function relleno(r, x0, y0, x1, y1, color, paso = 5) {
    let d = '';
    for (let y = y0; y < y1; y += paso) d += `M${x0 + r() * 3} ${y + r() * 2} L${x1 - r() * 3} ${y + paso * 0.6 + r() * 3} `;
    return `<path d="${d}" stroke="${color}" stroke-width="${paso * 0.9}" stroke-linecap="round" fill="none" opacity=".92"/>`;
  }
  function monigote(r, x, suelo, alto, color, boca = 'recta') {
    const cab = alto * 0.16, cy = suelo - alto + cab;
    let s = trazo(r, circulo(x, cy, cab), color, 3.5, true);
    s += trazo(r, [[x, cy + cab], [x, suelo - alto * 0.38]], color, 3.5);
    s += trazo(r, [[x - alto * 0.24, suelo - alto * 0.62], [x, suelo - alto * 0.66], [x + alto * 0.24, suelo - alto * 0.62]], color, 3.5);
    s += trazo(r, [[x - alto * 0.14, suelo], [x, suelo - alto * 0.38], [x + alto * 0.14, suelo]], color, 3.5);
    s += `<circle cx="${x - cab * 0.35}" cy="${cy - cab * 0.1}" r="1.8" fill="${color}"/><circle cx="${x + cab * 0.35}" cy="${cy - cab * 0.1}" r="1.8" fill="${color}"/>`;
    if (boca === 'recta') s += trazo(r, [[x - cab * 0.35, cy + cab * 0.45], [x + cab * 0.35, cy + cab * 0.45]], color, 2.2);
    return s;
  }
  function alto(r, x, suelo, h, conBrazos = true) {
    const cab = 16, cy = suelo - h + cab;
    let s = relleno(r, x - 13, cy - 15, x + 13, cy + 16, '#141414', 4);
    s += relleno(r, x - 12, cy + 16, x + 12, suelo - h * 0.32, '#141414', 4);
    s += trazo(r, [[x - 8, suelo - h * 0.32], [x - 12, suelo]], '#141414', 6) + trazo(r, [[x + 8, suelo - h * 0.32], [x + 12, suelo]], '#141414', 6);
    if (conBrazos) s += trazo(r, [[x - 12, cy + 24], [x - 30, suelo - h * 0.35], [x - 34, suelo - 4]], '#141414', 5) + trazo(r, [[x + 12, cy + 24], [x + 30, suelo - h * 0.35], [x + 34, suelo - 4]], '#141414', 5);
    s += `<circle cx="${x - 5}" cy="${cy - 2}" r="2.6" fill="#fbf8f0"/><circle cx="${x + 5}" cy="${cy - 2}" r="2.6" fill="#fbf8f0"/>`;
    s += trazo(r, [[x - 10, cy + 7], [x - 4, cy + 11], [x + 4, cy + 11], [x + 10, cy + 6]], '#c7271c', 3);
    return s;
  }
  const NINO = `font-family="'Chalkboard SE','Comic Sans MS','Segoe Print',cursive"`;
  const LAMINAS = [
    ['Mi casa nueva', r => {
      let s = '';
      s += trazo(r, circulo(58, 54, 24), '#f2b705', 5, true) + relleno(r, 40, 36, 76, 72, '#f6c823', 6);
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; s += trazo(r, [[58 + Math.cos(a) * 32, 54 + Math.sin(a) * 32], [58 + Math.cos(a) * 46, 54 + Math.sin(a) * 46]], '#f2b705', 4); }
      s += trazo(r, [[10, 252], [120, 248], [260, 254], [392, 249]], '#3a9a3a', 6);
      s += trazo(r, [[150, 122], [282, 122], [282, 250], [150, 250]], '#8b5a2b', 5, true);
      s += trazo(r, [[140, 124], [216, 64], [292, 124]], '#d2452b', 6, true) + relleno(r, 176, 92, 256, 120, '#e0583d', 6);
      s += trazo(r, [[202, 196], [232, 196], [232, 250], [202, 250]], '#8b5a2b', 4, true);
      s += trazo(r, [[164, 140], [196, 140], [196, 172], [164, 172]], '#2f6fc0', 4, true);
      s += relleno(r, 240, 140, 272, 172, '#141414', 4) + trazo(r, [[238, 138], [274, 138], [274, 174], [238, 174]], '#2f6fc0', 4, true);
      s += `<circle cx="251" cy="152" r="2.6" fill="#fbf8f0"/><circle cx="261" cy="152" r="2.6" fill="#fbf8f0"/>`;
      s += monigote(r, 36, 250, 92, '#2f6fc0') + monigote(r, 84, 250, 84, '#c7271c') + monigote(r, 312, 250, 58, '#8e3bb8') + monigote(r, 352, 250, 48, '#3a9a3a');
      s += `<g ${NINO} font-size="15" fill="#333"><text x="24" y="276">papá</text><text x="66" y="276">mamá</text><text x="304" y="276">yo</text><text x="338" y="276">Dani</text><text x="132" y="34" font-size="20">MI CASA NUEVA</text></g>`;
      return s;
    }],
    ['Mi amigo del pasillo', r => {
      let s = '';
      s += trazo(r, [[0, 0], [150, 92]], '#6b4a2f', 4) + trazo(r, [[400, 0], [250, 92]], '#6b4a2f', 4) + trazo(r, [[0, 300], [150, 212]], '#6b4a2f', 4) + trazo(r, [[400, 300], [250, 212]], '#6b4a2f', 4);
      s += trazo(r, [[150, 92], [250, 92], [250, 212], [150, 212]], '#6b4a2f', 4, true);
      s += trazo(r, [[40, 60], [100, 98], [100, 214], [40, 252]], '#8b5a2b', 4, true) + trazo(r, [[360, 60], [300, 98], [300, 214], [360, 252]], '#8b5a2b', 4, true);
      s += alto(r, 200, 210, 118);
      s += monigote(r, 200, 292, 52, '#8e3bb8', 'nada');
      s += `<g ${NINO} fill="#333"><text x="106" y="36" font-size="20">MI AMIGO DEL PASILLO</text><text x="262" y="282" font-size="14">NO LE GUSTA</text><text x="262" y="298" font-size="14">LA LUZ</text></g>`;
      return s;
    }],
    ['Ya somos cinco', r => {
      let s = '';
      s += trazo(r, [[10, 262], [200, 258], [392, 263]], '#3a9a3a', 6);
      s += trazo(r, [[300, 180], [370, 180], [370, 260], [300, 260]], '#8b5a2b', 4, true) + trazo(r, [[292, 182], [335, 146], [378, 182]], '#d2452b', 5, true);
      s += monigote(r, 34, 260, 84, '#2f6fc0') + monigote(r, 78, 260, 78, '#c7271c') + monigote(r, 122, 260, 54, '#8e3bb8') + monigote(r, 158, 260, 44, '#3a9a3a');
      s += alto(r, 222, 260, 236);
      s += trazo(r, [[133, 228], [186, 222]], '#141414', 4);
      s += `<g ${NINO} fill="#333"><text x="22" y="40" font-size="22">YA SOMOS 5</text></g>`;
      return s;
    }]
  ];
  function dibujos() {
    const caja = document.getElementById('laminas');
    caja.innerHTML = LAMINAS.map(([pie, f], i) => `
      <figure class="lamina">
        <svg viewBox="0 0 400 300" role="img" aria-label="Dibujo infantil: ${pie}"><rect width="400" height="300" fill="#fbf8f0"/>${f(semilla(11 + i))}</svg>
        <figcaption>${pie} · Lucía, 6 años</figcaption>
      </figure>`).join('');
  }

  /* Carteles de «Se busca» */
  const CARTELES = [
    ['lucia', '¿Has visto a Lucía?', '6 años. Casa 14. Desaparecida desde el 19 de marzo de 2025, junto a sus padres y su hermano.'],
    ['ernesto', 'Se busca', 'Ernesto B., 71 años. Casa 14. Salió a pasear por el pinar el 2 de noviembre de 2011.'],
    ['joaquin', 'Se busca', 'Joaquín M., 44 años. Casa 14. Visto por última vez el 12 de marzo de 1987.']
  ];
  function carteles() {
    const caja = document.getElementById('carteles');
    caja.innerHTML = CARTELES.map(([id, tit, txt], i) => `
      <article class="cartel" style="--giro:${[-3, 2.4, -1.4][i]}deg">
        <h3>${tit}</h3>
        <div class="cartel-foto">${LB.caras.retrato(id, { raya: true, sonrisa: 0.3 })}</div>
        <p>${txt}</p>
        <div class="tiras" aria-hidden="true">${'<span>Casa 14</span>'.repeat(6)}</div>
      </article>`).join('');
  }

  /* La llamada */
  const LLAMADA = [
    ['Operadora', '112, ¿cuál es su emergencia?'],
    ['Llamante', 'Hay alguien en casa. En el pasillo.'],
    ['Operadora', '¿Está dentro de la vivienda ahora mismo?'],
    ['Llamante', 'Sí. Está quieto. Al fondo.'],
    ['Operadora', 'Dígame la dirección.'],
    ['Llamante', 'Residencial Las Brumas. Casa catorce. Por favor, rápido.'],
    ['Operadora', 'No me aparece esa dirección. ¿Puede repetirla?'],
    ['Llamante', 'Casa catorce. Calle del Pinar. Ya no está al fondo.'],
    ['Operadora', '¿Puede salir de la vivienda?'],
    ['Llamante', 'Todas las puertas dan al pasillo. Todas.'],
    ['Operadora', 'Quédese en línea. ¿Señora? ¿Me oye?'],
    ['Llamante', '(en voz muy baja) Está sonriendo.'],
    ['', 'Fin de la llamada · 03:02:47. El número desde el que se llamó no tiene línea asignada.']
  ];
  function llamada() {
    const ol = document.getElementById('transcripcion');
    ol.innerHTML = LLAMADA.map(([q, t]) => `<li class="${q ? '' : 'fin'}">${q ? `<span class="quien">${q}</span>` : ''}<span>${t}</span></li>`).join('');
    if (calma) { ol.querySelectorAll('li').forEach(li => li.classList.add('vista')); return; }
    const lis = ol.querySelectorAll('li');
    ScrollTrigger.create({
      trigger: '.llamada', start: 'top top', end: 'bottom bottom',
      onUpdate: s => {
        const n = Math.floor(tramo(s.progress, 0.05, 0.9) * lis.length + 0.5);
        lis.forEach((li, i) => li.classList.toggle('vista', i < n));
      }
    });
  }

  /* El contrato se firma solo */
  function contrato() {
    const leido = document.getElementById('leido');
    ScrollTrigger.create({
      trigger: '.documento', start: 'top 70%', once: true,
      onEnter: () => {
        const d = new Date();
        leido.textContent = `Leído el ${d.toLocaleDateString('es-ES')} a las ${LB.hora()}. Firmado.`;
        leido.classList.add('listo');
      }
    });
    ScrollTrigger.create({
      trigger: '.firmas', start: 'top 85%', once: true,
      onEnter: () => document.querySelectorAll('.firma-trazo').forEach((f, i) => setTimeout(() => f.classList.add('firmada'), i * 900))
    });
  }

  /* El cristal: vaho, manos desde dentro, letras al revés */
  function cristal() {
    const cv = document.getElementById('vaho');
    const ctx = cv.getContext('2d');
    const capa = document.createElement('canvas');
    const cx2 = capa.getContext('2d');
    const nube = document.createElement('canvas'); nube.width = nube.height = 256;
    const nx = nube.getContext('2d');
    const g = nx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(214,219,212,0.62)'); g.addColorStop(0.55, 'rgba(214,219,212,0.25)'); g.addColorStop(1, 'rgba(214,219,212,0)');
    nx.fillStyle = g; nx.fillRect(0, 0, 256, 256);
    const r = semilla(5);
    const manchas = Array.from({ length: 16 }, () => ({ x: (r() - 0.5) * 0.7, y: (r() - 0.5) * 0.5, s: 0.2 + r() * 0.2 }));
    let w = 0, h = 0, p = 0, visible = false;
    const manos = [{ x: 0.36, y: 0.54, umbral: 0.42, t: 0, giro: -0.16 }, { x: 0.65, y: 0.58, umbral: 0.54, t: 0, giro: 0.2 }];
    const medir = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = cv.width = capa.width = Math.round(cv.clientWidth * dpr);
      h = cv.height = capa.height = Math.round(cv.clientHeight * dpr);
    };
    medir(); addEventListener('resize', medir);
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(cv);
    ScrollTrigger.create({
      trigger: '.cristal', start: 'top top', end: 'bottom bottom',
      onUpdate: s => {
        p = s.progress;
        manos.forEach(m => {
          if (p > m.umbral && !m.t) { m.t = performance.now(); if (LB.golpe) LB.golpe(); }
          if (p < m.umbral - 0.04) m.t = 0;
        });
        document.getElementById('cristal-pie').style.opacity = p < 0.3 ? 1 : 0;
      }
    });
    function mano(c, x, y, s, giro) {
      c.save(); c.translate(x, y); c.rotate(giro); c.scale(s, s);
      c.beginPath(); c.moveTo(-40, -6); c.bezierCurveTo(-46, 40, -30, 84, 0, 86); c.bezierCurveTo(32, 84, 44, 44, 40, -8); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(0, 10, 41, 30, 0, 0, Math.PI * 2); c.fill();
      [[-31, -36, 9, 50, -0.16], [-11, -50, 9.5, 64, -0.04], [10, -52, 9.5, 66, 0.04], [29, -40, 8.5, 54, 0.14], [50, 34, 10, 46, 0.95]].forEach(([fx, fy, fw, fh, fr]) => {
        c.save(); c.translate(fx, fy); c.rotate(fr); c.beginPath();
        c.ellipse(0, 0, fw, fh / 2, 0, 0, Math.PI * 2); c.fill(); c.restore();
      });
      c.restore();
    }
    function frase(c, texto, y, tam, avance) {
      c.save();
      c.translate(w / 2, y);
      c.scale(-1, 1);
      c.font = `600 ${tam}px "STIX Two Text", serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      const ancho = c.measureText(texto).width;
      c.beginPath(); c.rect(-ancho / 2 - 10, -tam, (ancho + 20) * avance, tam * 2); c.clip();
      c.lineWidth = tam * 0.07; c.lineJoin = 'round'; c.lineCap = 'round';
      c.strokeText(texto, 0, 0); c.fillText(texto, 0, 0);
      c.restore();
    }
    const pintar = (t) => {
      requestAnimationFrame(pintar);
      if (!visible || !w) return;
      const resp = calma ? 0.6 : 0.5 - 0.5 * Math.cos(t / 1000 * Math.PI * 2 / 3.8);
      const fuerza = 0.45 + 0.55 * resp;
      cx2.globalCompositeOperation = 'source-over';
      cx2.clearRect(0, 0, w, h);
      const base = Math.min(w, h);
      manchas.forEach(m => {
        const rad = base * m.s * (0.95 + 0.3 * resp) * (0.85 + p * 0.45);
        cx2.globalAlpha = fuerza;
        cx2.drawImage(nube, w * (0.5 + m.x) - rad, h * (0.52 + m.y) - rad, rad * 2, rad * 2);
      });
      cx2.globalAlpha = 1;
      cx2.globalCompositeOperation = 'destination-out';
      cx2.fillStyle = '#000'; cx2.strokeStyle = '#000';
      const tam = Math.min(w * 0.13, h * 0.16);
      frase(cx2, 'NO ENTRES', h * 0.2, tam, calma ? (p > 0.15 ? 1 : 0) : tramo(p, 0.1, 0.36));
      frase(cx2, 'YA ES TARDE', h * 0.86, tam, calma ? (p > 0.7 ? 1 : 0) : tramo(p, 0.66, 0.92));
      const ahora = performance.now();
      manos.forEach(m => { if (m.t) mano(cx2, w * m.x, h * m.y, base / 520 * 1.05, m.giro); });
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#030303'; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(capa, 0, 0);
      manos.forEach(m => {
        if (!m.t) return;
        const e = calma ? 1 : Math.min(1, (ahora - m.t) / 280);
        const esc = base / 520 * (1 + 0.14 * (1 - e * (2 - e)));
        ctx.fillStyle = 'rgba(214,206,192,0.16)';
        mano(ctx, w * m.x, h * m.y, esc, m.giro);
        ctx.fillStyle = 'rgba(232,226,214,0.12)';
        mano(ctx, w * m.x, h * m.y, esc * 0.8, m.giro);
      });
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

  /* Grano y aberración de color que crecen */
  function grano() {
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const x = c.getContext('2d'), img = x.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    x.putImageData(img, 0, 0);
    document.querySelector('.grano').style.backgroundImage = `url(${c.toDataURL()})`;
    if (calma) { raiz.style.setProperty('--aberr', '1.5'); return; }
    gsap.fromTo(raiz, { '--aberr': 0 }, { '--aberr': 5, ease: 'none', scrollTrigger: { trigger: '.acto-3', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  LB.acto3 = function () {
    hora();
    saben();
    notas();
    dibujos();
    carteles();
    llamada();
    contrato();
    cristal();
    rastro();
    grano();
  };
})();
