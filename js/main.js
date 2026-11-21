/* Arranque */
(function () {
  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* Qué acto está a la vista */
  document.querySelectorAll('[data-acto]').forEach(el => {
    const n = Number(el.dataset.acto);
    ScrollTrigger.create({
      trigger: el, start: 'top 55%', end: 'bottom 55%',
      onToggle: s => { if (s.isActive) LB.fijarActo(n); }
    });
  });

  ['acto1', 'acto2', 'acto3', 'descenso', 'sonido'].forEach(m => { if (typeof LB[m] === 'function') LB[m](); });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
