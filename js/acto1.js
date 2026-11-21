/* Acto 1: la promoción. Todo funciona. Casi todo. */
(function () {
  const { raiz, calma, azar } = LB;

  /* La casa piloto: copias para el teléfono y el recorte de la ventana en el pie */
  function clonarCasa() {
    const casa = document.getElementById('casa');
    document.querySelectorAll('[data-clon]').forEach(hueco => {
      const copia = casa.cloneNode(true);
      copia.removeAttribute('id');
      if (hueco.dataset.clon === 'ventana') copia.setAttribute('viewBox', '176 444 168 210');
      hueco.appendChild(copia);
    });
  }

  /* La luz de la casa cambia con el scroll: mañana, tarde, anochecer */
  function cieloDelActo() {
    if (calma) {
      ScrollTrigger.create({
        trigger: '.split', start: 'top top', end: 'bottom bottom',
        onUpdate: s => {
          const fase = s.progress < 0.5 ? 0 : s.progress < 0.85 ? 1 : 2;
          if (fase === raiz._fase) return;
          raiz._fase = fase;
          gsap.set(raiz, FASES[fase]);
        }
      });
      return;
    }
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.split', start: 'top top', end: 'bottom bottom', scrub: 1.2 }
    });
    tl.to(raiz, { '--bruma-op': 0.7, duration: 0.5 })
      .to(raiz, Object.assign({ duration: 0.35 }, FASES[1]))
      .to(raiz, Object.assign({ duration: 0.15 }, FASES[2]));
  }
  const FASES = [
    { '--cielo': '#cdd7d6', '--astro': '#f3efe4', '--monte': '#9aa8a3', '--ventana': '#9db4b9', '--luz': '#9db4b9', '--pino-lejos': '#66786e', '--cesped': '#80996a', '--figura-ventana': 0, '--bruma-op': 0.55 },
    { '--cielo': '#bdb6a8', '--astro': '#f0cfa6', '--monte': '#858c86', '--ventana': '#7b8f94', '--luz': '#f2d79b', '--pino-lejos': '#55645b', '--cesped': '#6c8559', '--figura-ventana': 0, '--bruma-op': 0.72 },
    { '--cielo': '#8d8e8a', '--astro': '#e6c29c', '--monte': '#6a706b', '--ventana': '#4c5a5e', '--luz': '#f0cf8a', '--pino-lejos': '#45524a', '--cesped': '#566b48', '--figura-ventana': 0.88, '--bruma-op': 0.82 }
  ];

  /* La cortina de arriba se mueve sola a partir de la mitad del acto */
  function cortina() {
    if (calma) return;
    let activa = false;
    ScrollTrigger.create({ trigger: '#galeria', start: 'top center', endTrigger: '.split', end: 'bottom bottom', onToggle: s => { activa = s.isActive; } });
    const mover = () => {
      if (activa && !document.hidden) gsap.to(raiz, { '--cortina': '26px', duration: 0.9, ease: 'power2.out', yoyo: true, repeat: 1, repeatDelay: 1.4 });
      setTimeout(mover, azar(7000, 13000));
    };
    setTimeout(mover, 6000);
  }

  /* Galería: un marco, cuatro estancias. En cada vuelta algo cambia. */
  const ESTANCIAS = [
    { pie: 'Salón · luz de mañana', svg: `
      <rect width="400" height="500" fill="#e4ddd0"/>
      <polygon points="0,340 400,340 400,500 0,500" fill="#b08a62"/>
      <path d="M0 380 H400 M0 430 H400 M0 470 H400" stroke="#9c774f" stroke-width="2"/>
      <rect x="40" y="70" width="150" height="170" fill="#cbd5d5"/>
      <rect x="40" y="150" width="150" height="40" fill="#fff" opacity=".6"/>
      <path d="M60 240 L72 200 L84 240Z M150 240 L164 190 L178 240Z" fill="#7d8c84"/>
      <rect x="40" y="70" width="150" height="170" fill="none" stroke="#2f3433" stroke-width="6"/>
      <path d="M115 70 V240" stroke="#2f3433" stroke-width="4"/>
      <g class="cambio cambio-3" fill="#efe9dd" opacity="0"><ellipse cx="146" cy="150" rx="15" ry="18"/><rect x="132" y="112" width="6" height="30" rx="3"/><rect x="140" y="106" width="6" height="34" rx="3"/><rect x="148" y="108" width="6" height="32" rx="3"/><rect x="156" y="116" width="6" height="28" rx="3"/></g>
      <circle cx="300" cy="90" r="26" fill="#f4f1ea" stroke="#2f3433" stroke-width="3"/>
      <path d="M300 90 V70 M300 90 H316" stroke="#2f3433" stroke-width="3" stroke-linecap="round"/>
      <rect x="250" y="150" width="100" height="70" fill="#8fa39a" stroke="#2f3433" stroke-width="4"/>
      <rect x="170" y="294" width="214" height="56" fill="#2f3433"/>
      <rect x="160" y="340" width="234" height="48" fill="#3b4140"/>
      <rect x="188" y="304" width="52" height="36" fill="#256f82"/><rect x="322" y="304" width="52" height="36" fill="#256f82"/>
      <rect x="26" y="318" width="112" height="78" fill="#8a6f55"/><rect x="26" y="300" width="22" height="96" fill="#7a604a"/><rect x="116" y="300" width="22" height="96" fill="#7a604a"/>
      <g class="cambio cambio-2" fill="#141615"><ellipse cx="82" cy="276" rx="17" ry="21"/><path d="M52 330 C52 300 64 292 82 292 C100 292 112 300 112 330Z"/></g>
      <ellipse cx="230" cy="448" rx="150" ry="30" fill="#cbbfae"/>
      <path d="M220 120 V294" stroke="#2f3433" stroke-width="3"/><path d="M200 120 H240 L232 96 H208Z" fill="#e8dcc0"/>` },
    { pie: 'Cocina · equipada', svg: `
      <rect width="400" height="500" fill="#e9e4da"/>
      <rect y="380" width="400" height="120" fill="#cfc7b8"/>
      <path d="M0 420 H400 M0 460 H400 M80 380 V500 M160 380 V500 M240 380 V500 M320 380 V500" stroke="#bdb4a3" stroke-width="2"/>
      <rect x="0" y="60" width="290" height="100" fill="#f3f0ea"/>
      <path d="M72 60 V160 M144 60 V160 M216 60 V160" stroke="#c9c2b5" stroke-width="3"/>
      <g class="cambio cambio-3" fill="#151716"><rect x="4" y="64" width="64" height="92"/><rect x="76" y="64" width="64" height="92"/><rect x="148" y="64" width="64" height="92"/><rect x="220" y="64" width="66" height="92"/></g>
      <rect x="0" y="240" width="290" height="120" fill="#f3f0ea"/><rect x="0" y="232" width="296" height="12" fill="#2f3433"/>
      <path d="M72 250 V360 M144 250 V360 M216 250 V360" stroke="#c9c2b5" stroke-width="3"/>
      <rect x="96" y="176" width="110" height="52" fill="#cbd5d5" stroke="#2f3433" stroke-width="4"/>
      <rect x="300" y="70" width="92" height="300" fill="#dcdcd6"/><path d="M300 180 H392 M312 100 V150 M312 200 V250" stroke="#b2b2aa" stroke-width="4"/>
      <rect x="328" y="200" width="40" height="46" fill="#fbfaf6" transform="rotate(4 348 223)"/>
      <path d="M336 238 V228 M344 238 V226 M352 238 V228 M361 240 V210" stroke="#1d1f1e" stroke-width="2.2" stroke-linecap="round"/>
      <rect x="50" y="410" width="230" height="14" fill="#7a604a"/><rect x="60" y="424" width="10" height="70" fill="#7a604a"/><rect x="260" y="424" width="10" height="70" fill="#7a604a"/>
      <g fill="#f8f6f0"><ellipse cx="88" cy="408" rx="20" ry="5"/><ellipse cx="140" cy="408" rx="20" ry="5"/><ellipse cx="192" cy="408" rx="20" ry="5"/><ellipse cx="244" cy="408" rx="20" ry="5"/></g>
      <ellipse class="cambio cambio-2" cx="166" cy="398" rx="20" ry="5" fill="#f8f6f0"/>` },
    { pie: 'Cuarto de los niños', svg: `
      <rect width="400" height="500" fill="#e6e1d3"/>
      <polygon points="0,390 400,390 400,500 0,500" fill="#b08a62"/>
      <rect x="40" y="70" width="90" height="100" fill="#cbd5d5" stroke="#2f3433" stroke-width="5"/>
      <rect x="160" y="90" width="44" height="52" fill="#fbfaf6" transform="rotate(-5 182 116)"/><rect x="214" y="100" width="44" height="52" fill="#fbfaf6" transform="rotate(6 236 126)"/>
      <path d="M170 132 L176 112 L182 132 M190 132 V118 M224 140 L230 120 L236 140 M246 142 V108" stroke="#256f82" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <rect x="290" y="110" width="100" height="280" fill="#c9b79c"/><path d="M340 110 V390" stroke="#a99779" stroke-width="3"/>
      <g class="cambio cambio-3"><rect x="340" y="114" width="14" height="272" fill="#0d0e0e"/><g fill="#e2d6c4"><rect x="336" y="200" width="12" height="7" rx="3.5"/><rect x="336" y="212" width="14" height="7" rx="3.5"/><rect x="336" y="224" width="13" height="7" rx="3.5"/><rect x="337" y="236" width="10" height="7" rx="3.5"/></g></g>
      <rect x="30" y="320" width="230" height="56" fill="#f4f1ea"/><rect x="30" y="300" width="16" height="96" fill="#7a604a"/><rect x="244" y="300" width="16" height="96" fill="#7a604a"/>
      <rect x="100" y="320" width="160" height="56" fill="#256f82"/><ellipse cx="74" cy="320" rx="28" ry="12" fill="#fbfaf6"/>
      <rect x="46" y="376" width="198" height="22" fill="#0f1010"/>
      <g class="cambio cambio-2" fill="#e9e4d6"><circle cx="150" cy="387" r="2.6"/><circle cx="166" cy="387" r="2.6"/></g>
      <circle cx="320" cy="440" r="22" fill="#b3261e"/><path d="M300 440 H340" stroke="#fbfaf6" stroke-width="3"/>` },
    { pie: 'Pasillo · planta alta', svg: `
      <rect width="400" height="500" fill="#d9d2c4"/>
      <polygon points="0,0 150,150 150,330 0,500" fill="#cfc6b5"/>
      <polygon points="400,0 250,150 250,330 400,500" fill="#c8bfae"/>
      <polygon points="0,500 150,330 250,330 400,500" fill="#a3805b"/>
      <polygon points="0,0 400,0 250,150 150,150" fill="#ece7dd"/>
      <rect x="150" y="150" width="100" height="180" fill="#e2dbcf"/>
      <rect x="176" y="196" width="48" height="134" fill="#2f3433"/>
      <g class="cambio cambio-2"><rect x="176" y="196" width="48" height="134" fill="#0a0b0b"/><polygon points="224,196 238,190 238,336 224,330" fill="#2f3433"/></g>
      <g class="cambio cambio-3" fill="#d8d3c6"><ellipse cx="196" cy="214" rx="6" ry="8" transform="rotate(-18 196 214)"/><path d="M190 224 H202 L206 270 L204 330 H200 L198 280 L194 330 H190 L188 270Z" fill="#050505"/><path d="M189 228 L182 300 L184 300 L192 240Z M203 228 L212 300 L210 300 L200 240Z" fill="#050505"/></g>
      <polygon points="30,70 90,120 90,330 30,390" fill="#7a604a"/><polygon points="370,70 310,120 310,330 370,390" fill="#7a604a"/>
      <circle cx="80" cy="240" r="3" fill="#d8c08a"/><circle cx="320" cy="240" r="3" fill="#d8c08a"/>
      <path d="M200 0 V40" stroke="#2f3433" stroke-width="2"/><circle cx="200" cy="48" r="10" fill="#f3e2b4"/>` }
  ];

  function galeria() {
    const caja = document.getElementById('estancias');
    const pie = document.getElementById('pie-marco');
    const marco = caja.closest('.marco');
    caja.innerHTML = ESTANCIAS.map((e, i) => `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" class="${i === 0 ? 'activa' : ''}" aria-hidden="true">${e.svg}</svg>`).join('');
    const vistas = caja.querySelectorAll('svg');
    let i = 0, vuelta = 1, reloj = 0;
    const pasar = () => {
      vistas[i].classList.remove('activa');
      i = (i + 1) % vistas.length;
      if (i === 0 && vuelta < 3) { vuelta++; marco.classList.add('vuelta-' + vuelta); }
      vistas[i].classList.add('activa');
      pie.textContent = ESTANCIAS[i].pie;
    };
    const programar = () => { clearInterval(reloj); if (!calma) reloj = setInterval(pasar, 3200); };
    marco.addEventListener('click', () => { pasar(); programar(); });
    programar();
  }

  /* La vecina del testimonio y la asesora son la misma persona */
  function retratos() {
    const r = document.getElementById('retrato');
    r.innerHTML = LB.caras.retrato('marta');
    LB.caras.parpadear(r.firstElementChild, 0.5);
    const a = document.getElementById('asesora-cara');
    a.innerHTML = LB.caras.retrato('marta');
    LB.caras.parpadear(a.firstElementChild, 0.5);
    if (!LB.tactil) {
      let pend = false;
      addEventListener('pointermove', () => {
        if (pend) return; pend = true;
        requestAnimationFrame(() => { pend = false; LB.caras.mirar(r.firstElementChild, LB.puntero.x, LB.puntero.y); });
      }, { passive: true });
    }
  }

  /* Reserva: día y hora, sin pedir nada */
  function reserva() {
    const dias = document.getElementById('dias');
    const horas = document.getElementById('horas');
    const form = document.getElementById('cita');
    const conf = document.getElementById('confirmacion');
    const hoy = new Date();
    const fmt = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric' });
    const opcion = (nombre, valor, etiqueta, marcado, desactivado) =>
      `<label><input type="radio" name="${nombre}" value="${valor}"${marcado ? ' checked' : ''}${desactivado ? ' disabled' : ''}><span>${etiqueta}</span></label>`;
    let html = '';
    for (let d = 1; d <= 5; d++) {
      const f = new Date(hoy); f.setDate(hoy.getDate() + d);
      html += opcion('dia', fmt.format(f), fmt.format(f), d === 1);
    }
    dias.innerHTML = html;
    horas.innerHTML = ['10:00', '11:30', '13:00', '17:00', '18:30'].map((h, i) => opcion('hora', h, h, i === 1)).join('') + opcion('hora', '03:00', '03:00', false, true);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const datos = new FormData(form);
      LB.visita = { dia: datos.get('dia'), hora: datos.get('hora') };
      conf.textContent = `Hecho. Te esperamos el ${LB.visita.dia} a las ${LB.visita.hora} en la casa piloto. No hace falta que traigas nada.`;
      LB.marta('reserva', {}, { urgente: true });
    });
  }

  /* Entradas por sección: título, texto, imagen */
  function entradas() {
    if (calma) return;
    raiz.classList.add('anima');
    ScrollTrigger.batch('[data-entra]', {
      start: 'top 88%',
      once: true,
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.075, overwrite: true })
    });
  }

  LB.acto1 = function () {
    clonarCasa();
    cieloDelActo();
    cortina();
    galeria();
    retratos();
    reserva();
    entradas();
    setTimeout(() => { if (LB.acto === 1 && !LB.regreso) LB.marta('hola'); }, 9000);
    ScrollTrigger.create({ trigger: '#precios', start: 'top 55%', once: true, onEnter: () => { if (LB.acto === 1 && !LB.regreso) LB.marta('libre'); } });
  };
})();
