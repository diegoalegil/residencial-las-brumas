/* Retratos dibujados: caras casi normales */
(function () {
  let n = 0;

  const VECINOS = {
    marta:   { piel: '#e3bfa0', sombra: '#c99c7c', pelo: '#3a2a20', peinado: 'mono', iris: '#4d5b3c', ropa: '#2f3433', fondo: '#c8c1b4', sonrisa: 0.35 },
    joaquin: { piel: '#d9b08f', sombra: '#b98d6c', pelo: '#5b5550', peinado: 'corto', iris: '#3d3a33', ropa: '#6b5a48', fondo: '#bfc3bb', sonrisa: 0.5, gafas: true },
    lucia:   { piel: '#efcfb4', sombra: '#d4ab8c', pelo: '#6a4a2c', peinado: 'coletas', iris: '#5a4630', ropa: '#256f82', fondo: '#d6cfbf', sonrisa: 0.55, nina: true },
    ernesto: { piel: '#c99d7c', sombra: '#a87b5b', pelo: '#d8d4cc', peinado: 'calvo', iris: '#2f3a40', ropa: '#3f4a3a', fondo: '#c4bdb0', sonrisa: 0.6, arrugas: true },
    pilar:   { piel: '#e8c6a8', sombra: '#caa385', pelo: '#9a5a32', peinado: 'largo', iris: '#3c5a52', ropa: '#7a3b34', fondo: '#cbc5b8', sonrisa: 0.7 },
    javi:    { piel: '#dcb594', sombra: '#bd9271', pelo: '#241c17', peinado: 'corto', iris: '#3a2c20', ropa: '#46505a', fondo: '#c2c6c0', sonrisa: 0.45, barba: true }
  };

  function pelo(o, fondoPelo) {
    const c = o.pelo;
    if (fondoPelo) {
      if (o.peinado === 'largo') return `<path d="M70 170 C60 90 110 70 150 70 C200 70 244 92 232 172 C246 250 240 300 226 330 L74 330 C58 290 56 240 70 170Z" fill="${c}"/>`;
      if (o.peinado === 'coletas') return `<ellipse cx="62" cy="200" rx="20" ry="40" fill="${c}"/><ellipse cx="238" cy="200" rx="20" ry="40" fill="${c}"/>`;
      if (o.peinado === 'mono') return `<circle cx="150" cy="86" r="34" fill="${c}"/>`;
      return '';
    }
    if (o.peinado === 'calvo') return `<path d="M80 170 C76 150 82 140 90 136 L92 176Z M220 170 C224 150 218 140 210 136 L208 176Z" fill="${c}"/>`;
    if (o.peinado === 'corto') return `<path d="M76 172 C70 104 108 86 150 86 C196 86 232 104 224 172 C214 142 196 124 150 122 C110 124 88 140 76 172Z" fill="${c}"/>`;
    return `<path d="M74 180 C66 104 108 82 150 82 C196 82 236 104 226 180 C212 136 184 118 150 116 C112 118 86 140 74 180Z" fill="${c}"/>`;
  }

  /* Devuelve el SVG de un retrato. modo: 'normal' | 'raya' (cara tachada) | 'vacio' (sin ojos) */
  function retrato(nombre, extra = {}) {
    const o = Object.assign({}, VECINOS[nombre] || VECINOS.marta, extra);
    const id = 'ojo' + (++n);
    const ancho = 24 + o.sonrisa * 46;
    const k = o.sonrisa * 12;
    const cabezaRy = o.nina ? 84 : 92;
    const ojos = [122, 178].map((x, i) => `
      <clipPath id="${id}-${i}"><ellipse cx="${x}" cy="186" rx="14" ry="8.5"/></clipPath>
      <g class="ojo" clip-path="url(#${id}-${i})">
        <ellipse cx="${x}" cy="186" rx="14" ry="8.5" fill="${o.vacio ? '#050505' : '#f3efe6'}"/>
        ${o.vacio ? '' : `<g class="pupila"><circle cx="${x}" cy="186" r="6.4" fill="${o.iris}"/><circle cx="${x}" cy="186" r="3.1" fill="#080808"/><circle cx="${x + 2}" cy="184" r="1.3" fill="#fff"/></g>`}
        <rect class="parpado" x="${x - 15}" y="176" width="30" height="20" fill="${o.piel}"/>
      </g>`).join('');
    const arriba = 262 + k * 0.6, abajo = 280 + k * 3.2;
    const boca = `
      <path d="M${150 - ancho} 252 Q150 ${arriba} ${150 + ancho} 252 Q150 ${abajo} ${150 - ancho} 252Z" fill="#5e2522"/>
      <path d="M${150 - ancho + 5} 253 Q150 ${arriba} ${150 + ancho - 5} 253 Q150 ${arriba + 7 + k * 0.5} ${150 - ancho + 5} 253Z" fill="#f2eee5"/>`;
    let raya = '';
    if (o.raya) {
      let d = 'M84 128', y = 128, sx = 1;
      for (let i = 0; i < 26; i++) { y += 6 + (i * 37 % 5); sx = -sx; d += ` L${150 + sx * (60 + (i * 53 % 17))} ${y + (i * 29 % 9) - 4}`; }
      let d2 = 'M100 290';
      for (let i = 0; i < 14; i++) d2 += ` L${96 + (i * 71 % 112)} ${130 + (i * 43 % 150)}`;
      raya = `<g fill="none" stroke="#0b0b0b" stroke-linecap="round" stroke-linejoin="round" opacity="0.93"><path d="${d}" stroke-width="8"/><path d="${d2}" stroke-width="3.5"/></g>`;
    }
    return `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" class="cara" data-vecino="${nombre}" aria-hidden="true">
      <rect width="300" height="400" fill="${o.fondo}"/>
      ${pelo(o, true)}
      <path d="M26 400 C36 322 98 300 150 300 C202 300 264 322 274 400Z" fill="${o.ropa}"/>
      <rect x="128" y="248" width="44" height="68" fill="${o.sombra}"/>
      <ellipse cx="79" cy="196" rx="10" ry="17" fill="${o.sombra}"/>
      <ellipse cx="221" cy="196" rx="10" ry="17" fill="${o.sombra}"/>
      <ellipse cx="150" cy="190" rx="${o.nina ? 70 : 72}" ry="${cabezaRy}" fill="${o.piel}"/>
      ${pelo(o, false)}
      ${ojos}
      <path d="M106 166 Q122 ${o.cejas || 158} 138 166 M162 166 Q178 ${o.cejas || 158} 194 166" stroke="${o.peinado === 'calvo' ? '#9b948a' : o.pelo}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M150 196 C146 214 143 226 153 229" stroke="${o.sombra}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      ${o.arrugas ? `<path d="M108 210 Q114 214 112 222 M192 210 Q186 214 188 222 M120 140 Q150 134 180 140" stroke="${o.sombra}" stroke-width="2.5" fill="none"/>` : ''}
      ${o.barba ? `<path d="M88 220 C96 280 130 290 150 290 C170 290 204 280 212 220 C200 262 176 268 150 268 C124 268 100 262 88 220Z" fill="${o.pelo}" opacity="0.85"/>` : ''}
      ${boca}
      ${o.gafas ? `<g stroke="#1c1c1c" stroke-width="3.5" fill="none"><circle cx="122" cy="187" r="19"/><circle cx="178" cy="187" r="19"/><path d="M141 186 H159"/></g>` : ''}
      ${raya}
    </svg>`;
  }

  /* Parpadeos a destiempo: cada ojo por su cuenta */
  function parpadear(svg, raro = 0.3) {
    if (LB.calma) return;
    const parpados = svg.querySelectorAll('.parpado');
    const uno = (p, retraso) => p.animate(
      [{ transform: 'translateY(-20px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-20px)' }],
      { duration: 170, delay: retraso, easing: 'ease-in-out' }
    );
    const ciclo = () => {
      if (!svg.isConnected) return;
      const desfase = Math.random() < raro ? LB.azar(120, 420) : 0;
      if (parpados[0]) uno(parpados[0], 0);
      if (parpados[1]) uno(parpados[1], desfase);
      setTimeout(ciclo, LB.azar(1800, 6500));
    };
    setTimeout(ciclo, LB.azar(400, 3000));
  }

  /* Las pupilas miran a un punto de la pantalla, o a un punto fijo "detrás de ti" */
  function mirar(svg, x, y, fijo) {
    const r = svg.getBoundingClientRect();
    let dx, dy;
    if (fijo) { dx = 4.6; dy = -2.4; }
    else {
      dx = LB.clamp((x - (r.left + r.width / 2)) / (r.width * 1.4), -1, 1) * 6;
      dy = LB.clamp((y - (r.top + r.height * 0.46)) / (r.height * 1.4), -1, 1) * 3.2;
    }
    svg.querySelectorAll('.pupila').forEach(p => p.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`));
  }

  window.LB.caras = { retrato, parpadear, mirar, VECINOS };
})();
