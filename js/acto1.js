/* Acto 1: la promoción. Todo funciona. Casi todo. */
(function () {
  const { raiz, calma } = LB;

  /* El escenario fijo del ordenador cambia de foto según lo que estés leyendo:
     la casa, el mirador al llegar a la casa piloto, la piscina en los precios y otra vez la casa para reservar */
  function escenario() {
    const caja = document.getElementById('escenario');
    if (!caja) return;
    let marcas = [];
    const actualizar = () => {
      const y = scrollY;
      let v = 'casa';
      marcas.forEach(m => { if (y >= m.st.start) v = m.vista; });
      if (caja.dataset.vista !== v) caja.dataset.vista = v;
    };
    marcas = [['#galeria', 'mirador'], ['#precios', 'piscina'], ['#reserva', 'casa']]
      .map(([sel, vista]) => ({ vista, st: ScrollTrigger.create({ trigger: sel, start: 'top 60%', onToggle: actualizar }) }));
    ScrollTrigger.addEventListener('refresh', actualizar);
    actualizar();
    /* La casa se acerca muy despacio a la ventana de arriba, la de la cortina apartada */
    if (calma) return;
    gsap.fromTo(caja.querySelector('.vista-casa'), { scale: 1 }, {
      scale: 1.08, transformOrigin: '36% 46%', ease: 'none',
      scrollTrigger: { trigger: '.split', start: 'top top', end: 'bottom bottom', scrub: 1.2 }
    });
  }

  /* Galería: un marco, cinco estancias */
  function galeria() {
    const marco = document.querySelector('.marco');
    const fotos = [...marco.querySelectorAll('img')];
    const pie = document.getElementById('pie-marco');
    let i = 0, reloj = 0, visible = false;
    const pasar = () => {
      fotos[i].classList.remove('activa');
      i = (i + 1) % fotos.length;
      fotos[i].classList.add('activa');
      pie.textContent = fotos[i].dataset.pie;
    };
    const programar = () => { clearInterval(reloj); if (!calma && visible) reloj = setInterval(pasar, 4500); };
    marco.addEventListener('click', () => { pasar(); programar(); });
    new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      if (visible) LB.precargar(fotos);
      programar();
    }, { rootMargin: '300px 0px' }).observe(marco);
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
    escenario();
    galeria();
    reserva();
    entradas();
    /* La cara de la asesora, lista antes de su primer mensaje */
    setTimeout(() => LB.precargar('.asesora-cara img'), 4000);
    setTimeout(() => { if (!LB.regreso) LB.marta('hola', {}, { soloActo: 1 }); }, 9000);
    ScrollTrigger.create({ trigger: '#precios', start: 'top 55%', once: true, onEnter: () => { if (!LB.regreso) LB.marta('libre', {}, { soloActo: 1 }); } });
  };
})();
