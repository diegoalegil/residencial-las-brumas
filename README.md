# Residencial Las Brumas

Empieza como la web de una promotora cualquiera: treinta y dos casas en las medianías, sobre el mar de nubes, seguridad 24 horas y vecinos encantadores. Cuanto más bajas, menos cuadra todo. Al final ya no es una web de casas.

**Verla:** https://diegoalegil.github.io/residencial-las-brumas/

## Cómo verla

- Mejor de noche, con auriculares y el sonido encendido. Viene apagado: se enciende con el botón de abajo a la izquierda o con la tecla **M**. Al encenderlo se descargan los sonidos (unos 4 MB) y la web empieza a sonar. El sonido cambia en cada acto, hay voces y, con auriculares, algunas se oyen a un lado o detrás de ti.
- Baja despacio. Varias escenas se quedan fijas mientras haces scroll y avanzan con él.
- Funciona en el móvil y en el ordenador.
- Si en tu sistema tienes activada la reducción de movimiento, la historia es la misma, con menos movimiento y sin sustos de golpe.

## Aviso

Terror psicológico: sustos, sonidos fuertes si activas el sonido e imágenes inquietantes. No hay destellos rápidos.

Residencial Las Brumas es una ficción. Ninguna casa, persona ni empresa de esta página existe.

## Privacidad

La web no pide permisos, no usa cookies y no envía nada tuyo a ningún sitio. Lo que dice de ti lo lee tu propio navegador en ese momento, sin preguntarte, y no sale de él: la hora y la zona horaria, el idioma del navegador, el tipo de aparato y de navegador, el tamaño de la pantalla, si tienes el modo oscuro o la reducción de movimiento, la batería (solo en los navegadores que la dan sin pedir permiso), la página desde la que llegaste, si cambias de pestaña, si haces la ventana más grande o más pequeña o giras el móvil, cómo haces scroll o mueves el ratón, si lo llevas hacia las pestañas o lo dejas quieto encima de algo, si dejas el dedo quieto sobre la pantalla, el clic derecho, las teclas Ctrl/Cmd+F y Escape, si enciendes el sonido, cuántas veces cierras el aviso de Marta y el tiempo que llevas dentro.

Lo único que pide fuera de la propia web es la tipografía, a Google Fonts, que como cualquier servidor ve la dirección IP desde la que se pide. Los sonidos se descargan de la propia web, y solo si los enciendes.

Lo único que guarda, también en tu navegador, es cuándo viniste por primera y por última vez, cuántas veces has entrado y hasta dónde llegaste. Si copias un texto de la página, a la copia se le añade una línea; la web nunca lee lo que tienes copiado.

## Los cinco actos (destripa la historia)

<details>
<summary>Abrir solo si ya la has visto</summary>

1. **La promoción.** Portada, lo que incluye la casa, cifras, la casa piloto por dentro, una vecina que la recomienda, precios, preguntas frecuentes y la reserva de la visita. Todo es creíble, salvo un detalle en cada sección que no debería estar ahí.
2. **Algo no cuadra.** La web debería haber terminado y sigue. Las reseñas repiten la misma frase con la misma cara hasta que la frase se tuerce, los vecinos te siguen con la mirada, nadie se ha ido nunca y las cámaras de seguridad enfocan a quien está mirando la pantalla. Marta, la asesora, empieza a saber cosas de ti: cuánto llevas dentro, desde qué aparato miras, cuánta batería te queda, si te vas a otra pestaña o si vuelves a subir.
3. **Extraño de verdad.** La hora real, preguntas frecuentes que contestan con tus propios datos, las notas de voz que la familia anterior nunca llegó a enviar, dibujos del cuarto de los niños, carteles de los antiguos propietarios, una llamada al 112 en la que la operadora sabe más que quien llama, un contrato que se firma solo y alguien que respira contra el cristal.
4. **Descenso.** La casa piloto a oscuras: un pasillo que se recorre con el scroll, voces que te piden que cuentes las puertas y te dicen la hora de tu reloj, puertas que no deberían ser tantas y algo al fondo que cada vez está más cerca.
5. **Final.** No conviene contarlo.

</details>

## En local

```sh
python3 -m http.server 8000
# http://localhost:8000
```

Las imágenes se dibujan en el navegador. Los sonidos están en `audio/` (camas, efectos y voces, en MP3) y solo se descargan al encender el sonido. Usa GSAP y ScrollTrigger para las animaciones y la tipografía STIX Two Text.

## Créditos de sonido

La música, los ambientes y los efectos están hechos para esta web con muestras grabadas de bibliotecas libres, más algunos sonidos hechos a mano (los pájaros, la respiración, el bolígrafo, la nevera, el fluorescente y los tonos del teléfono). Las muestras son de dominio público (CC0), así que no piden atribución, pero se agradecen:

- [VSCO 2 Community Edition](https://versilian-studios.com/vsco-community/), de Versilian Studios: secciones de cuerda y bombo de orquesta.
- [VCSL](https://github.com/sgossner/VCSL), Versilian Community Sample Library: marimba, vibráfono, carillón, piano vertical, gong, bloque de madera y tambor de océano.
- Splendid Grand Piano: muestras de AKAI liberadas al dominio público.
- [Kenney](https://kenney.nl): pasos, puertas, crujidos, golpes y clics.
- [Sonic Pi](https://sonic-pi.net): zumbidos y ambientes.
- Body Percussion (CC0): el latido y la mano contra el cristal.
