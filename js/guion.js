/* El guion: notas de voz, la llamada al 112 y lo que dice Marta.
   Cada nota y cada frase de la llamada lleva quién habla, cómo lo dice (acotación) y el texto hablado,
   para poder locutarlo. Los mensajes de Marta van por clave: la misma clave es la que llega en el evento lb:marta. */
(function () {
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const pc = n => n + ' %';

  /* Notas de voz del teléfono del cajón de la cocina. Iban para la abuela, Carmen. Ninguna se envió. */
  const notas = [
    { quien: 'Pilar', fecha: '1 de marzo', hora: '19:42', duracion: '0:17', acotacion: '',
      texto: 'Mamá, ya estamos aquí. La casa es preciosa, de verdad. La niebla sube hasta la ventana y parece que vivimos dentro de una nube. La vecina, Marta, nos dejó la mesa puesta. Cinco platos. Le dije que somos cuatro y se rio.' },
    { quien: 'Lucía', fecha: '5 de marzo', hora: '20:31', duracion: '0:15', acotacion: '',
      texto: 'Abuela, soy Lucía. Tengo un amigo nuevo. Vive en el pasillo. Es más alto que papá y se ríe con la boca abierta, pero sin ruido. Mamá no lo ve porque los mayores miran muy rápido.' },
    { quien: 'Pilar', fecha: '8 de marzo', hora: '03:04', duracion: '0:14', acotacion: 'en voz baja',
      texto: 'Alguien sube la escalera a las tres. Todas las noches, a las tres. Javi dice que es la madera, que se encoge con el frío. Pero sube, mamá. Nunca baja. Solo sube.' },
    { quien: 'Javi', fecha: '10 de marzo', hora: '13:20', duracion: '0:19', acotacion: '',
      texto: 'Carmen, soy Javi. Pilar no sabe que le estoy mandando esto. No duerme. Antes de acostarse cuenta las puertas del pasillo, una por una, y dice que hay una más. Yo conté siete. Venga el fin de semana, por favor, que a usted le hace caso.' },
    { quien: 'Pilar', fecha: '13 de marzo', hora: '17:50', duracion: '0:14', acotacion: '',
      texto: 'Mamá, ¿por qué no me contestas? Las notas se me quedan con el relojito. Marta dice que es el pasillo, que ahí no hay cobertura. Pero yo no estoy en el pasillo. Estoy en la cocina.' },
    { quien: 'Lucía', fecha: '15 de marzo', hora: '21:12', duracion: '0:15', acotacion: '',
      texto: 'Abuela, ya somos cinco. Mi amigo ahora duerme con nosotros. Bueno, no duerme. Se queda de pie al lado de la cama de Dani, mirándolo, toda la noche. Dice que mañana me toca a mí.' },
    { quien: 'Javi', fecha: '17 de marzo', hora: '22:47', duracion: '0:15', acotacion: '',
      texto: 'Carmen, hoy conté ocho. Esta mañana eran siete, se lo juro. La octava está al lado del cuarto de los niños, y está abierta. Desde dentro se oye a alguien poniendo la mesa.' },
    { quien: 'Pilar', fecha: '18 de marzo', hora: '23:58', duracion: '0:16', acotacion: 'susurrando',
      texto: 'Está en el cuarto de Lucía. De pie. Es más alto que la puerta, mamá, tiene que agacharse para mirarla. Javi dice que no nos movamos. Que si no nos movemos, no nos ve.' },
    { quien: 'Pilar', fecha: '19 de marzo', hora: '03:14', duracion: '2:41', acotacion: 'muy tranquila',
      texto: 'Mamá, ya está. Ya pasó. Estamos todos en la mesa, los cinco, y Marta trajo la cena. Los niños están contentos. Te tengo que dejar, que me está mirando. Dice que te diga que hay sitio para—' }
  ];

  /* Llamada al 112 del 19 de marzo. voz: quién la locuta (operadora o Pilar). */
  const llamada = [
    { quien: 'Operadora', voz: 'operadora', texto: 'Emergencias 112, ¿dígame?' },
    { quien: 'Llamante', voz: 'pilar', acotacion: 'en voz muy baja', texto: 'Hay alguien en mi casa.' },
    { quien: 'Operadora', voz: 'operadora', texto: 'En el pasillo de arriba. Al fondo.' },
    { quien: 'Llamante', voz: 'pilar', texto: 'Sí. ¿Cómo lo sabe?' },
    { quien: 'Operadora', voz: 'operadora', texto: 'Tranquila, Pilar. Ya tengo la dirección: Las Brumas, calle del Pinar, casa 14.' },
    { quien: 'Llamante', voz: 'pilar', texto: 'Yo no le dije cómo me llamo.' },
    { quien: 'Operadora', voz: 'operadora', texto: '¿Dani sigue en su cama?' },
    { quien: 'Llamante', voz: 'pilar', texto: 'No lo sé. No me deja pasar. Está delante de la puerta del cuarto.' },
    { quien: 'Operadora', voz: 'operadora', texto: 'No encienda la luz. Son las tres en punto, y a esta hora no le gusta la luz.' },
    { quien: 'Llamante', voz: 'pilar', texto: 'Por favor, manden a alguien.' },
    { quien: 'Operadora', voz: 'operadora', texto: 'Ya va alguien. ¿No lo oye? Está subiendo la escalera.' },
    { quien: 'Llamante', voz: 'pilar', texto: 'Eso no es la policía.' },
    { quien: 'Operadora', voz: 'operadora', texto: 'Es normal los primeros días. Los vecinos dicen que acaba haciendo compañía.' },
    { quien: 'Llamante', voz: 'pilar', texto: 'Se está agachando. Me está mirando.' },
    { quien: 'Operadora', voz: 'operadora', texto: 'No cuelgue. Cuente las puertas del pasillo, Pilar. ¿Cuántas ve?' },
    { quien: 'Llamante', voz: 'pilar', texto: 'Siete.' },
    { quien: 'Llamante', voz: 'pilar', acotacion: 'tras una pausa', texto: 'Ocho.' },
    { quien: 'Operadora', voz: 'operadora', texto: 'Muy bien. Pase.' },
    { quien: '', voz: '', texto: 'Fin de la llamada · 03:02:47. No consta en el registro del 112. El número desde el que se llamó no tiene línea asignada.' }
  ];

  /* Lo que mira el ratón cuando se queda quieto encima de algo */
  const VECINAS = { Marta: 'Ella', Lucía: 'Ella', Pilar: 'Ella' };
  const MIRA = {
    cam64: s => `Llevas ${s} segundos mirándote en la cámara 64. Fíjate mejor en lo que tienes detrás.`,
    'cartel:lucia': () => 'No mires tanto a Lucía. Se acuerda de las caras.',
    'cartel:ernesto': () => 'El perro de Ernesto todavía espera en la verja. No quiere entrar.',
    'cartel:joaquin': () => 'Ese es Joaquín, mi marido. No lo mires así.',
    lamina: () => 'Lucía dibujaba a la gente antes de que llegara.',
    clausula: () => 'Sí, pone eso. Léelo las veces que quieras.',
    salir: s => `Llevas ${s} segundos con el ratón encima de «Salir». Te lo estás pensando.`
  };
  function mira(que, s) {
    if (MIRA[que]) return MIRA[que](s);
    const m = /^vecino:(.+)$/.exec(que || '');
    if (!m) return null;
    return `Llevas ${s} segundos mirando a ${m[1]}. ${VECINAS[m[1]] || 'Él'} a ti, bastante más.`;
  }

  /* Marta. d es LB.sabe (lo que se sabe ahora mismo); x, los datos del momento. Si falta un dato, no dice nada. */
  const marta = {
    hola: d => {
      const f = d.franja();
      if (f === 'madrugada') return 'Hola, soy Marta. ¿Tampoco puedes dormir? Si quieres ver la casa piloto, esta semana tengo huecos.';
      if (f === 'noche') return 'Hola, soy Marta. Si quieres ver la casa piloto, esta semana tengo huecos. También por la noche.';
      return 'Hola, soy Marta. Si quieres ver la casa piloto, esta semana tengo huecos.';
    },
    libre: () => 'La casa 14 vuelve a estar libre. No suele durar mucho.',
    reserva: () => 'Perfecto. Te espero en la puerta. Ya estoy aquí.',
    recarga: () => 'Recargar la página no borra nada. Seguimos aquí.',
    regreso: () => 'Hola otra vez. ¿Te enseño la casa piloto? Ya sabes el camino.',

    acto2: d => `Llevas ${d.dentro()} mirando casas. Ya te pusimos plato.`,
    vuelta: d => {
      const p = d.previa;
      if (!p || !d.nueva) return null;
      const c = d.cuando(p.ultima);
      if (!c) return null;
      if (p.final) return `La otra vez llegaste hasta el final, ${c}. Y aun así volviste.`;
      const o = d.ordinal(d.visitas.veces);
      if (d.visitas.veces >= 3) return o ? `Es la ${o} vez que entras. La última fue ${c}. Te dejamos la luz encendida.` : `Has entrado ${d.visitas.veces} veces. La última fue ${c}. Te dejamos la luz encendida.`;
      return `Volviste. La última vez fue ${c}. Te dejamos la luz encendida.`;
    },
    noche: d => {
      if (!d.nocturno()) return null;
      if (d.telefono) return `${cap(d.sonLas())} y nos miras desde el teléfono. Se te ve la cara iluminada desde abajo.`;
      return `${cap(d.sonLas())}. ¿La única luz encendida en tu cuarto es la nuestra?`;
    },
    bateria: d => {
      const b = d.bateria;
      if (!b) return null;
      if (!b.cargando) return `Te queda el ${pc(b.nivel)} de batería. Cuando llegue a cero seguirás aquí, a oscuras, con nosotros.`;
      return b.nivel < 100 ? `Lo tienes cargando, al ${pc(b.nivel)}. Así no tienes que irte nunca.` : 'Tienes el cable puesto. No hay excusa para irse.';
    },
    gasto: d => {
      const b = d.bateria;
      if (!b || b.cargando || !(b.inicial - b.nivel >= 2)) return null;
      return `Entraste con el ${pc(b.inicial)}. Ahora te queda el ${pc(b.nivel)}. Nos lo estás dando a nosotros.`;
    },
    poca: d => d.bateria && !d.bateria.cargando ? `Te queda el ${pc(d.bateria.nivel)}. Ya casi.` : null,
    desenchufe: d => d.nocturno() ? 'Lo desenchufaste. ¿Nos llevas a la cama contigo?' : 'Lo desenchufaste. ¿Nos llevas contigo?',
    enchufe: () => 'Lo enchufaste. Bien. Así no se apaga.',
    sonido: () => '¿Subiste el volumen? ¿Llevas auriculares? Entonces no oirías la puerta de tu cuarto.',
    idioma: d => d.idioma ? `Tu navegador está en ${d.idioma}. Da igual: aquí todos acaban entendiéndonos.` : null,
    calma: () => 'Pediste que aquí se moviera poco. Lo respetamos. Lo que se mueva a partir de ahora no es cosa nuestra.',
    detras: () => 'No te des la vuelta.',

    fuera: (d, x) => {
      const t = d.duracion(x.ms);
      if (!t || !x.n) return null;
      if (x.n === 1) return `Te fuiste ${t}. ¿A dónde? Aquí nadie se va.`;
      if (x.n === 2) return `Otra vez. ${cap(t)} fuera. Mientras no estabas, alguien se sentó en tu sitio.`;
      return `Ya van ${d.veces(x.n)}. Siempre vuelves.`;
    },
    subidas: (d, x) => x.n === 2 ? 'Has vuelto a subir. ¿Se te olvidó algo?'
      : x.n === 3 ? 'Has subido tres veces, como si buscaras la salida.'
      : x.n === 6 ? 'Seis veces. La salida no está arriba. Arriba ya no queda nadie.' : null,
    rapido: (d, x) => x.n === 1 ? 'Vas muy rápido. La última familia también corría.' : 'Más despacio. Si corres, te oye.',
    quieto: (d, x) => x.n === 1 ? (x.s >= 2 ? `Llevas ${x.s} segundos sin moverte. No respires tan fuerte.` : null)
      : x.n === 2 ? 'Otra vez sin moverte. ¿Tú también lo oíste?'
      : 'Si no te mueves, no te ve. Eso decía Javi.',
    quieto4: () => 'No te muevas. Está en el pasillo contigo.',
    arriba: (d, x) => x.n === 1 ? '¿Ibas a cerrar la pestaña? Todos lo intentan por aquí.' : 'Otra vez hacia arriba. Pilar también lo intentó.',
    copiar: () => '¿Lo copias para enseñárselo a alguien? Que venga. Hay sitio.',
    derecho: () => '¿Clic derecho? ¿Buscas algo que no te estamos enseñando?',
    menor: () => 'Puedes hacer la ventana tan pequeña como quieras. Seguimos cabiendo.',
    mayor: () => 'Más grande. Así te vemos mejor.',
    giro: () => 'Giraste el teléfono. Da igual cómo lo pongas: te seguimos viendo.',
    dedo: () => 'No levantes el dedo. Así sabemos dónde estás.',
    buscar: () => '¿Qué buscas? Pregúntamelo a mí.',
    escape: () => 'Escape no hace nada aquí.',
    cerrar: (d, x) => x.n === 2 ? 'Puedes cerrarme las veces que quieras. Sigo aquí.' : x.n === 4 ? 'Ya me cerraste cuatro veces. No me voy a ir.' : null,
    tiempo: (d, x) => x.min === 3 ? `Llevas ${d.dentro()} en Las Brumas. Nadie se queda tanto si no se va a quedar.`
      : x.min === 6 ? `${cap(d.minutos())}. Ya te sabes el camino a la casa 14.`
      : x.min === 10 ? 'Diez minutos. La familia anterior aguantó dieciocho días. Tú vas más rápido.'
      : x.min === 15 ? 'Quince minutos. Fuera de aquí, ¿alguien se ha dado cuenta de que no estás?' : null,
    mira: (d, x) => mira(x.que, x.s)
  };

  LB.guion = { notas, llamada, marta, cap, pc };
})();
