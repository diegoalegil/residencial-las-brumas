/* Lo que la web sabe de ti. Todo se lee en este navegador, sin pedir permisos, y no sale de él. */
(function () {
  const { calma, tactil } = LB;
  const ua = navigator.userAgent || '';
  const uad = navigator.userAgentData || null;
  const marcas = uad && Array.isArray(uad.brands) ? uad.brands.map(b => b.brand) : [];
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  function dispositivo() {
    const plat = uad && uad.platform ? uad.platform : '';
    const toque = navigator.maxTouchPoints || 0;
    const d = (sistema, desde, corto, tipo) => ({ sistema, desde, corto, tipo });
    if (/iPhone/.test(ua)) return d('iPhone', 'desde un iPhone', 'IPHONE', 'telefono');
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && toque > 1)) return d('iPad', 'desde un iPad', 'IPAD', 'tableta');
    if (plat === 'Android' || /Android/.test(ua)) {
      const movil = uad && typeof uad.mobile === 'boolean' ? uad.mobile : /Mobile/.test(ua);
      return movil ? d('Android', 'desde un móvil Android', 'ANDROID', 'telefono') : d('Android', 'desde una tableta Android', 'ANDROID', 'tableta');
    }
    if (plat === 'macOS' || /Macintosh|Mac OS X/.test(ua)) return d('Mac', 'desde un Mac', 'MAC', 'ordenador');
    if (plat === 'Windows' || /Windows/.test(ua)) return d('Windows', 'desde un ordenador con Windows', 'WINDOWS', 'ordenador');
    if (plat === 'Chrome OS' || plat === 'ChromeOS' || /CrOS/.test(ua)) return d('Chromebook', 'desde un Chromebook', 'CHROMEBOOK', 'ordenador');
    if (plat === 'Linux' || /Linux/.test(ua)) return d('Linux', 'desde un ordenador con Linux', 'LINUX', 'ordenador');
    return null;
  }

  function navegador() {
    const n = (nombre, con) => ({ nombre, con });
    if (/Instagram/.test(ua)) return n('Instagram', 'dentro de Instagram');
    if (/FBAN|FBAV/.test(ua)) return n('Facebook', 'dentro de Facebook');
    if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return n('TikTok', 'dentro de TikTok');
    if (marcas.length) {
      if (marcas.includes('Microsoft Edge')) return n('Edge', 'con Edge');
      if (marcas.includes('Opera')) return n('Opera', 'con Opera');
      if (marcas.includes('Brave')) return n('Brave', 'con Brave');
      if (marcas.includes('Google Chrome')) return n('Chrome', 'con Chrome');
      if (marcas.some(m => /Samsung/i.test(m))) return n('Samsung Internet', 'con Samsung Internet');
      if (marcas.includes('Chromium')) return null;
    }
    if (/Edg(e|A|iOS)?\//.test(ua)) return n('Edge', 'con Edge');
    if (/OPR\/|Opera/.test(ua)) return n('Opera', 'con Opera');
    if (/SamsungBrowser/.test(ua)) return n('Samsung Internet', 'con Samsung Internet');
    if (/Firefox|FxiOS/.test(ua)) return n('Firefox', 'con Firefox');
    if (/HeadlessChrome/.test(ua)) return null;
    if (/CriOS|Chrome\//.test(ua)) return n('Chrome', 'con Chrome');
    if (/Safari\//.test(ua) && /Version\//.test(ua)) return n('Safari', 'con Safari');
    return null;
  }

  const LUGARES = {
    'Atlantic/Canary': 'Canarias', 'Europe/Madrid': 'la Península', 'Africa/Ceuta': 'Ceuta',
    'Europe/London': 'Londres', 'Europe/Lisbon': 'Lisboa', 'Europe/Paris': 'París', 'Europe/Berlin': 'Berlín',
    'Europe/Rome': 'Roma', 'Europe/Brussels': 'Bruselas', 'Europe/Amsterdam': 'Ámsterdam', 'Europe/Zurich': 'Zúrich',
    'Europe/Dublin': 'Dublín', 'America/New_York': 'Nueva York', 'America/Los_Angeles': 'Los Ángeles',
    'America/Mexico_City': 'Ciudad de México', 'America/Bogota': 'Bogotá', 'America/Lima': 'Lima',
    'America/Santiago': 'Santiago de Chile', 'America/Argentina/Buenos_Aires': 'Buenos Aires', 'America/Buenos_Aires': 'Buenos Aires',
    'America/Caracas': 'Caracas', 'America/Montevideo': 'Montevideo', 'America/Havana': 'La Habana', 'America/Panama': 'Panamá',
    'America/Guatemala': 'Guatemala', 'America/Asuncion': 'Asunción', 'America/La_Paz': 'La Paz', 'America/Santo_Domingo': 'Santo Domingo',
    'America/Puerto_Rico': 'Puerto Rico', 'America/Costa_Rica': 'Costa Rica', 'America/El_Salvador': 'El Salvador',
    'America/Tegucigalpa': 'Tegucigalpa', 'America/Managua': 'Managua', 'America/Guayaquil': 'Guayaquil',
    'America/Argentina/Cordoba': 'Córdoba', 'America/Argentina/Mendoza': 'Mendoza', 'America/Sao_Paulo': 'São Paulo',
    'America/Monterrey': 'Monterrey', 'America/Cancun': 'Cancún', 'America/Tijuana': 'Tijuana', 'America/Chicago': 'Chicago',
    'America/Toronto': 'Toronto', 'Europe/Vienna': 'Viena', 'Europe/Prague': 'Praga', 'Europe/Warsaw': 'Varsovia',
    'Europe/Copenhagen': 'Copenhague', 'Europe/Stockholm': 'Estocolmo', 'Europe/Oslo': 'Oslo', 'Europe/Helsinki': 'Helsinki',
    'Europe/Athens': 'Atenas', 'Europe/Bucharest': 'Bucarest', 'Europe/Istanbul': 'Estambul', 'Europe/Moscow': 'Moscú',
    'Africa/Casablanca': 'Casablanca', 'Asia/Tokyo': 'Tokio', 'Asia/Seoul': 'Seúl', 'Asia/Dubai': 'Dubái', 'Australia/Sydney': 'Sídney'
  };
  /* Fuera de la tabla no se nombra el sitio: el identificador viene en inglés y sin tildes */
  function zona() {
    let id = '';
    try { id = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { id = ''; }
    if (!id || /^(UTC|GMT|Etc\/)/.test(id)) return null;
    return { id, lugar: LUGARES[id] || null, canarias: id === 'Atlantic/Canary', peninsula: id === 'Europe/Madrid' };
  }

  function idioma() {
    const l = (navigator.language || '').toLowerCase();
    if (!l || l.startsWith('es')) return null;
    try { const n = new Intl.DisplayNames(['es'], { type: 'language' }).of(l.split('-')[0]); return n && n !== l ? n : null; } catch (e) { return null; }
  }

  const ORIGENES = [
    [/(^|\.)google\./, 'Google', true], [/(^|\.)bing\.com$/, 'Bing', true], [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo', true],
    [/(^|\.)instagram\.com$/, 'Instagram'], [/(^|\.)(facebook|fb)\.com$/, 'Facebook'], [/(^|\.)(t\.co|twitter\.com|x\.com)$/, 'X'],
    [/(^|\.)tiktok\.com$/, 'TikTok'], [/(^|\.)whatsapp\.(com|net)$/, 'WhatsApp'], [/(^|\.)reddit\.com$/, 'Reddit'],
    [/(^|\.)(youtube\.com|youtu\.be)$/, 'YouTube'], [/(^|\.)linkedin\.com$/, 'LinkedIn'], [/(^|\.)(t\.me|telegram\.org)$/, 'Telegram'],
    [/(^|\.)discord(app)?\.com$/, 'Discord']
  ];
  function origen() {
    try {
      if (document.referrer) {
        const h = new URL(document.referrer).hostname;
        if (h && h !== location.hostname) {
          const o = ORIGENES.find(([re]) => re.test(h));
          if (o) return { nombre: o[1], buscador: !!o[2] };
        }
      }
    } catch (e) { /* sin origen */ }
    if (/Instagram/.test(ua)) return { nombre: 'Instagram', buscador: false };
    if (/FBAN|FBAV/.test(ua)) return { nombre: 'Facebook', buscador: false };
    if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return { nombre: 'TikTok', buscador: false };
    return null;
  }

  function cuando(ts) {
    if (!(ts > 0)) return '';
    const d = new Date(ts), hoy = new Date();
    const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()), b = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const dias = Math.round((b - a) / 864e5);
    const hm = 'a ' + LB.las(d);
    if (dias === 0) return 'hoy ' + hm;
    if (dias === 1) return 'ayer ' + hm;
    if (dias > 1 && dias < 7) return 'el ' + new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(d) + ' ' + hm;
    if (dias >= 7) return 'el ' + new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' }).format(d) + (d.getFullYear() !== hoy.getFullYear() ? ' de ' + d.getFullYear() : '');
    return '';
  }
  const ORDINALES = ['', 'primera', 'segunda', 'tercera', 'cuarta', 'quinta', 'sexta', 'séptima', 'octava', 'novena', 'décima'];

  const disp = dispositivo();
  const S = {
    dispositivo: disp,
    telefono: !!disp && disp.tipo === 'telefono',
    navegador: navegador(),
    pantalla: screen && screen.width >= 200 && screen.height >= 200 ? { w: screen.width, h: screen.height } : null,
    oscuro: matchMedia('(prefers-color-scheme: dark)').matches,
    zona: zona(),
    idioma: idioma(),
    origen: origen(),
    bateria: null,
    salidas: 0, fuera: 0,
    subidas: 0,
    sonido: false,
    get visitas() { return LB.visitas; },
    get previa() { return LB.previa; },
    get nueva() { return LB.nueva; },
    entrada: LB.t0,
    hora: LB.hora, las: LB.las, sonLas: LB.sonLas, dentro: LB.tiempoDentro, minutos: LB.minutos,
    duracion: LB.duracion, veces: LB.veces, cuando,
    ordinal: n => ORDINALES[n] || '',
    franja() { const h = new Date().getHours(); return h < 6 ? 'madrugada' : h < 13 ? 'manana' : h < 20 ? 'tarde' : 'noche'; },
    nocturno() { const h = new Date().getHours(); return h >= 22 || h < 6; },
    /* «desde un Mac, con Chrome y en una pantalla de 1440 por 900» */
    como() {
      const p = [];
      if (S.dispositivo) p.push(S.dispositivo.desde);
      if (S.navegador) p.push(S.navegador.con);
      if (S.pantalla) p.push(`en una pantalla de ${S.pantalla.w} por ${S.pantalla.h}`);
      if (S.oscuro) p.push('con el modo oscuro puesto');
      if (!p.length) return '';
      return p.length === 1 ? p[0] : p.slice(0, -1).join(', ') + ' y ' + p[p.length - 1];
    },
    /* «En Canarias son las 01:12, igual que aquí.» */
    reloj() {
      const z = S.zona, s = LB.sonLas();
      if (!z) return cap(s) + '.';
      if (z.canarias) return `En Canarias ${s}, igual que aquí.`;
      if (z.peninsula) return `En la Península ${s}. Aquí, una menos.`;
      if (!z.lugar) return `Tu reloj marca ${LB.las()}.`;
      return `Tu reloj va con la hora de ${z.lugar} y marca ${LB.las()}.`;
    }
  };
  LB.sabe = S;

  /* La batería, donde el navegador la da sin preguntar */
  const dichos = new Set();
  const una = (id, x, op) => { if (dichos.has(id)) return false; const ok = LB.marta(id, x, op); if (ok) dichos.add(id); return ok; };
  if (typeof navigator.getBattery === 'function') {
    navigator.getBattery().then(b => {
      const leer = () => {
        const nivel = Math.round(b.level * 100);
        if (!(nivel >= 0 && nivel <= 100)) return false;
        S.bateria = { nivel, cargando: !!b.charging, inicial: S.bateria ? S.bateria.inicial : nivel };
        return true;
      };
      if (!leer()) return;
      b.addEventListener('levelchange', () => {
        if (!leer() || LB.acto < 2) return;
        if (!S.bateria.cargando && S.bateria.nivel <= 10) una('poca', {}, { urgente: true });
        else if (S.bateria.inicial - S.bateria.nivel >= 2) una('gasto');
      });
      b.addEventListener('chargingchange', () => {
        if (!leer() || LB.acto < 2) return;
        una(S.bateria.cargando ? 'enchufe' : 'desenchufe', {}, { urgente: true });
      });
    }).catch(() => { S.bateria = null; });
  }

  /* El sonido: se sabe por el botón */
  const boton = document.getElementById('sonido');
  if (boton) new MutationObserver(() => {
    const antes = S.sonido;
    S.sonido = boton.getAttribute('aria-pressed') === 'true';
    if (S.sonido && !antes && LB.acto >= 2 && LB.acto < 5) una('sonido', {}, { urgente: true });
  }).observe(boton, { attributes: true, attributeFilter: ['aria-pressed'] });

  LB.vigilancia = function () {
    /* Cambiar de pestaña: cuánto tiempo y cuántas veces */
    let salida = 0;
    const relojes = [];
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        salida = Date.now();
        if (LB.acto >= 2) {
          document.title = '(1) Marta: ¿A dónde has ido?';
          relojes.push(setTimeout(() => { if (document.hidden) document.title = '(2) Marta: Sigo en la puerta.'; }, 15000));
          relojes.push(setTimeout(() => { if (document.hidden) document.title = '(3) Marta: Vuelve.'; }, 45000));
        }
      } else {
        relojes.splice(0).forEach(clearTimeout);
        document.title = LB.titulos[LB.acto];
        const ms = salida ? Date.now() - salida : 0;
        salida = 0;
        if (LB.acto >= 2 && ms > 1500) {
          S.salidas++; S.fuera += ms;
          if (LB.acto < 5) LB.marta('fuera', { n: S.salidas, ms }, { urgente: true });
        }
      }
    });

    /* Volver a subir: cada tramo largo hacia arriba cuenta una vez */
    let yAnt = scrollY, dir = 0, recorrido = 0, contada = false;
    addEventListener('scroll', () => {
      const y = scrollY, d = y - yAnt;
      yAnt = y;
      if (!d || Math.abs(d) > innerHeight * 4 || LB.regreso && LB.acto === 1) return;
      const s = Math.sign(d);
      if (s !== dir) { dir = s; recorrido = 0; contada = false; }
      recorrido += Math.abs(d);
      if (dir < 0 && !contada && recorrido > 700 && LB.acto >= 2 && LB.acto < 5) {
        contada = true;
        S.subidas++;
        LB.marta('subidas', { n: S.subidas }, { urgente: true });
      }
    }, { passive: true });

    /* El ratón: hacia la pestaña, copiar, clic derecho */
    let arriba = 0;
    document.addEventListener('mouseout', e => {
      if (tactil || e.relatedTarget || e.clientY > 4 || LB.acto < 2 || LB.acto >= 5 || arriba >= 2) return;
      arriba++;
      LB.marta('arriba', { n: arriba }, { urgente: true });
    });
    document.addEventListener('copy', e => {
      if (LB.acto < 2) return;
      const sel = String(getSelection ? getSelection() : '');
      if (!sel.trim() || !e.clipboardData) return;
      e.clipboardData.setData('text/plain', sel + '\n\nCasa 14. Te estamos esperando.');
      e.preventDefault();
      una('copiar', {}, { urgente: true });
    });
    document.addEventListener('contextmenu', () => { if (LB.acto >= 2 && LB.acto < 5) una('derecho', {}, { urgente: true }); });

    /* La ventana y el teléfono */
    let ancho = innerWidth, pausa = 0;
    addEventListener('resize', () => {
      clearTimeout(pausa);
      pausa = setTimeout(() => {
        const dx = innerWidth - ancho;
        ancho = innerWidth;
        if (tactil || LB.acto < 2 || LB.acto >= 5) return;
        if (dx <= -120) una('menor', {}, { urgente: true });
        else if (dx >= 120) una('mayor', {}, { urgente: true });
      }, 500);
    });
    const vertical = matchMedia('(orientation: portrait)');
    const girar = () => { if (tactil && LB.acto >= 2 && LB.acto < 5) una('giro', {}, { urgente: true }); };
    if (vertical.addEventListener) vertical.addEventListener('change', girar);

    /* El dedo quieto sobre la pantalla */
    let dedo = null;
    addEventListener('touchstart', e => { const t = e.touches[0]; dedo = t && e.touches.length === 1 ? { x: t.clientX, y: t.clientY, t: Date.now() } : null; }, { passive: true });
    addEventListener('touchmove', e => { const t = e.touches[0]; if (dedo && t && Math.hypot(t.clientX - dedo.x, t.clientY - dedo.y) > 14) dedo = null; }, { passive: true });
    ['touchend', 'touchcancel'].forEach(ev => addEventListener(ev, () => { dedo = null; }, { passive: true }));

    /* El teclado */
    addEventListener('keydown', e => {
      if (LB.acto < 2) return;
      if ((e.metaKey || e.ctrlKey) && (e.key === 'f' || e.key === 'F')) una('buscar', {}, { urgente: true });
      else if (e.key === 'Escape' && LB.acto < 5) una('escape', {}, { urgente: true });
    });

    /* Marta cerrada una y otra vez */
    document.addEventListener('lb:marta-cerrada', e => {
      if (LB.acto < 2) return;
      const n = e.detail.veces;
      if (n === 2 || n === 4) setTimeout(() => LB.marta('cerrar', { n }, { urgente: true }), 1400);
    });

    /* Lo que va diciendo con calma, uno cada rato */
    const AMBIENTE = ['vuelta', 'noche', 'bateria', 'idioma', 'calma'];
    const AMBIENTE_OK = { calma: () => calma, bateria: () => !!S.bateria, idioma: () => !!S.idioma };
    const MINUTOS = [3, 6, 10, 15];
    let entradaActo2 = 0, rapidos = 0, ultimoRapido = 0, quietos = 0, ultimoQuieto = 0, quietoAvisado = false;
    let miraClave = '', miraDesde = 0, miras = 0, vecinos = 0;
    LB.alCambiarActo(n => { if (n >= 2 && !entradaActo2) entradaActo2 = Date.now(); });

    setInterval(() => {
      const a = LB.acto, ahora = Date.now();
      if (document.hidden || LB.silencio) return;

      /* El ratón parado encima de algo */
      if (!tactil && LB.puntero.movido && a >= 2) {
        const el = document.elementFromPoint(LB.puntero.x, LB.puntero.y);
        const m = el && el.closest ? el.closest('[data-mira]') : null;
        const clave = m ? m.dataset.mira : '';
        if (clave !== miraClave) { miraClave = clave; miraDesde = ahora; }
        else if (clave && ahora - miraDesde > 3600 && !dichos.has('mira:' + clave) && miras < 4) {
          const vecino = clave.startsWith('vecino:');
          const permitido = (clave === 'salir' ? a === 5 : a < 5) && !(vecino && vecinos >= 2);
          if (permitido && LB.marta('mira', { que: clave, s: Math.floor((ahora - miraDesde) / 1000) }, { urgente: true })) {
            dichos.add('mira:' + clave); miras++; if (vecino) vecinos++;
          }
        }
      }

      if (a < 2 || a >= 5) return;

      /* El dedo que no se levanta */
      if (dedo && ahora - dedo.t > 3000) { dedo = null; una('dedo', {}, { urgente: true }); }

      /* Demasiado rápido */
      if (LB.velocidad > 3800 && ahora - ultimoRapido > 25000 && rapidos < 2) {
        ultimoRapido = ahora; rapidos++;
        LB.marta('rapido', { n: rapidos }, { urgente: true });
        return;
      }

      /* Sin moverse */
      const q = LB.quieto;
      if (q < 1000) quietoAvisado = false;
      else if (!quietoAvisado && q > 9000 && ahora - ultimoQuieto > 40000 && quietos < 3 && !LB.avisando) {
        quietoAvisado = true; ultimoQuieto = ahora;
        if (a === 4) { una('quieto4', {}, { urgente: true }); }
        else { quietos++; LB.marta('quieto', { n: quietos, s: Math.floor(q / 1000) }, { urgente: true }); }
        return;
      }

      /* Lo que no tiene prisa: espera a que no haya otro mensaje y a que pase un rato */
      if (LB.avisando || ahora - LB.ultimoAviso < 18000 || !entradaActo2 || ahora - entradaActo2 < 9000) return;
      const minutos = (ahora - LB.t0) / 60000;
      const hito = MINUTOS.find(m => minutos >= m && !dichos.has('tiempo:' + m));
      if (hito) { dichos.add('tiempo:' + hito); if (LB.marta('tiempo', { min: hito })) return; }
      if (a > 3) return;
      const sig = AMBIENTE.find(id => !dichos.has(id) && (!AMBIENTE_OK[id] || AMBIENTE_OK[id]()));
      if (sig) { dichos.add(sig); LB.marta(sig); }
    }, 500);

    /* Recargar después de haber visto lo de abajo */
    if (LB.recarga) setTimeout(() => { if (LB.acto < 5) LB.marta('recarga', {}, { urgente: true }); }, 3500);
  };

})();
