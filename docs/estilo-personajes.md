# Guía de estilo de los personajes de Kachai

Lo que decidimos (octubre de 2026) para que los 15 personajes se vean como un solo elenco: un ambiente de aprendizaje **alegre, cálido y entretenido**. Úsala antes de dibujar o cambiar un personaje.

## Paleta: Pear36

Todos los personajes y los efectos usan solo los 36 colores de [Pear36](https://lospec.com/palette-list/pear36). Se eligió por ser dulce y juguetona (la segunda opción era Fantasy).

```
5E315B 8C3F5D BA6156 F2A65E FFE478 CFFF70 8FDE5D 3CA370 3D6E70 323E4F 322947 473B78
4B5BAB 4DA6FF 66FFE3 FFFFEB C2C2D1 7E7E8F 606070 43434F 272736 3E2347 57294B 964253
E36956 FFB570 FF9166 EB564B B0305C 73275C 422445 5A265E 80366B BD4882 FF6B97 FFB5B5
```

Rampas de luz a sombra (cada una corre el matiz: la luz tira a amarillo y la sombra a morado):

| Material | Rampa |
|---|---|
| Grises, metal, pelo blanco | FFFFEB · C2C2D1 · 7E7E8F · 606070 · 43434F · 272736 |
| Dorado y cafés | FFE478 · F2A65E · BA6156 · 8C3F5D · 5E315B · 3E2347 |
| Rosados | FFB5B5 · FF6B97 · BD4882 · 80366B · 5A265E · 422445 |
| Pieles durazno y coral | FFB570 · FF9166 · E36956 · 964253 · 57294B · 3E2347 |
| Rojos | EB564B · B0305C · 73275C · 422445 |
| Verdes | CFFF70 · 8FDE5D · 3CA370 · 3D6E70 · 323E4F · 322947 |
| Azules y turquesas | 66FFE3 · 4DA6FF · 4B5BAB · 473B78 · 322947 |

**El fondo del bosque NO usa Pear36**: el bosque original es más cálido (con Pear36 se veía frío). Las aves del fondo también conservan sus colores.

## Reglas de dibujo

1. **Contorno B.** La silueta exterior es oscura (`#272736`, para que se lea en el proyector). Las líneas *interiores* entre dos materiales (cara y casco, brazo y túnica) toman el tono oscuro del color vecino. Los ojos, la boca y los párpados siempre quedan oscuros.
2. **Luz desde arriba.** Lo más claro va arriba de cada forma (cúpula del casco, hombros, sombrero), nunca como franja a un costado. Así no importa que el rival se dibuje en espejo en los duelos.
3. **Brillo en los ojos.** Un píxel claro arriba de cada ojo.
4. **Rubor solo en los más tiernos** (Malala, Agattita; Malía y Cupe ya lo tenían).
5. **Brillos moderados:** un píxel en metales, gemas y pelo, no más.
6. **Antialiasing** solo en las esquinas de la silueta. **Sin dithering** (tramas de puntos), porque a este tamaño ensucia.
7. **Los detalles que se mueven, con tonos vecinos.** Pear36 da saltos grandes entre un tono y el siguiente: una textura de capa, un brillo pequeño o una sombra de mano que se mueve con la respiración parpadea si su color está lejos del vecino. Úsales el tono de al lado en la rampa o simplifícalos (por ejemplo, la capa de Jelic tiene una sola sombra fija).
8. **El pixel art nunca se rota** (solo cuartos de vuelta o desplazamientos), y siempre se ven las dos manos. Nada de violencia: los golpes son de caricatura (chispa de impacto, estrellitas).

## Cómo está hecho en el código

- **Cada personaje** tiene en `heroesHD.js`:
  - `contorno: "#272736"`;
  - `mapa`, la tabla color original → Pear36. `hdColor` la aplica *antes de pintar*, así que también cubre los colores escritos dentro de brazos, armas y mascotas;
  - su grilla (`cuerpo`), con el contorno interior y el antialiasing ya dibujados. Se deciden una sola vez sobre el dibujo, nunca en cada cuadro, porque si no parpadean.
- **Versiones que arma una escena** (el oso de Xitin, el esmoquin de Tiván, los podios): el motor les pasa `contorno` y `mapa` automáticamente a través de `forma` y `retoque`.
- **Arma tirada en el suelo:** `armaSuelta` usa la paleta del personaje y, si existe, `HD_POR_ID[id].armaSuelta` (lo usan Uchis y Xitin).
- **Efectos de las escenas** (humo, chispas, confeti, rayos): `src/game/pear36.js` cambia cada `fillStyle` al color Pear36 más parecido antes de pintar, así que las transparencias se mezclan ya con colores de la paleta. Un color con tinte nunca cae en un gris. `fondo()` marca el lienzo con `CRUDO` para dejar el bosque como está.
- **Nunca uses dígitos como letras nuevas de paleta:** las escenas agregan las letras 1–5, 8 y 9 (mermelada, etc.). Las letras nuevas usan vocales con tilde (Á, É, Í…).
- **En los celulares las escenas se repiten completas** (victoria cada 6 s, la de Uzu cada 8,2 s, podio cada 8 s) y parten desde el principio cuando el alumno vuelve a encender la pantalla: quien no estaba mirando entiende igual qué pasó.
- **Rendimiento:** convertir los colores al pintar hace que una escena tarde unos 2,5 ms por cuadro (antes eran ~1,5 ms). Hay que probar en un celular antiguo cuando se agreguen efectos pesados.

## Decisiones por personaje

| Personaje | Piel | Detalles de diseño |
|---|---|---|
| Jelic | café rojiza (BA6156) | Capa con una sola sombra fija. **Escudo con un búho posado** (café, ojos dorados, pecho blanco); la tabla de surf del podio es ese escudo acostado, con una carita de búho, centrada bajo sus pies. |
| Agattita | pelaje gris | Interior de las orejas gris claro y rubor rosado. Gemas verdes (cintillo de 2 px sobre la nariz y broche al centro del pecho). **Pelitos que salen de lado desde dentro del oído** (como la gata real que la inspira): horizontales, nunca hacia arriba ni tapando la punta de la oreja. Sus enredaderas también desarman al rival. |
| Cupe | blanco | **Espada de caballero**: hoja de 2 px, guarda recta dorada y pomo en forma de corona; el mango solo se dibuja en la espada suelta (en la mano lo tapa la pata). Zapatos rojos. |
| Malala | rosada clara | Pelo negro (no ciruela), rubor, medias verde oscuro y zapatos café. |
| Malía | rosada clara | Blusa durazno, medias blancas y zapatos rojo frutilla. |
| Latte | durazno | Pantalón azul petróleo y botas café. |
| Kenny | durazno | Pelo ciruela (5E315B), pantalón índigo y botas café. |
| Tiván | durazno (salmón chocaba con el abrigo mostaza) | Pantalón gris y botas café. |
| Patroclus | tostada (F2A65E; coral chocaba con la pañoleta roja) | Botas de cuero café. |
| Uchis | rosada clara | Calzas turquesa oscuro. Desarmada, deja sus dos dagas puntiagudas actuales. |
| Janet | rosada clara | Pelo dorado anaranjado, pantalón café claro y botas verde bosque. |
| July | durazno | Delantal café morado. |
| Edith | rosada clara | Túnica ciruela y zapatos ciruela. |
| Uzu | verde lima | Modo berserk en los rojos de Pear36. |
| Xitin | rosada clara | **Rediseñada:** túnica azul tipo Kurapika con ribete dorado, faja roja y broche con huella de oso; **báculo plateado inclinado hacia adelante** (así no le tapa la cara; mientras carga, la mano del báculo se queda a su lado) con una garra dorada que sostiene una gema verde. Al atacar carga maná en la mano libre, le lanza un rayo a la gema y se transforma en oso (`cargaPrevia: 400` alarga la secuencia para que se entienda). Ya no lleva collar: la desarman como a todos. |

## Podio (celular)

Pedestal de metal (oro FFE478/F2A65E, plata FFFFEB/C2C2D1, bronce FFB570/E36956) con la cara de arriba iluminada y una **placa oscura** al frente. Dentro, una **corona de laureles** del metal del puesto (dos ramas en óvalo, abiertas arriba y cruzadas abajo; la derecha es el espejo exacto de la izquierda) y el **número** de 6 × 8 con trazo de 2 px y contorno, simétrico y centrado con la placa (el centro cae entre dos píxeles: se calcula con el doble del centro, `eje2`). El pedestal baja hasta el borde inferior de la escena, así la placa tiene espacio sin subir al personaje (que necesita espacio arriba para celebrar). Es `pedestal()` en heroes.js; se exporta como `pedestalPodio` para usarlo también en el proyector.

**En el proyector** (modo individual), los 3 primeros aparecen con el personaje que eligieron, celebrando sobre este mismo pedestal (`podioProyector` en heroes.js, `PodioPixel` en Host.jsx). Mientras un puesto no se revela, su pedestal muestra "?". La celebración parte cuando se revela. Del 4.º al 10.º solo van los nombres, para no exponer a nadie. En modo equipos se mantienen los bloques 3D de siempre, y un alumno sin personaje tiene solo el pedestal.

## Vista 3/4: dónde va el centro

En tres cuartos la cara y el pecho miran al rival: su centro está corrido hacia ese lado (la nariz marca el centro de la cara). Los adornos centrales (la gema del cintillo de Agattita, broches, emblemas) van alineados con ese centro, no con el centro de la grilla.

## Ideas descartadas (no volver a proponerlas)

- Fondo del bosque en Pear36 (se veía frío).
- Pieles coral o salmón en Patroclus y Tiván.
- Collar con cara de oso para Xitin (a 5 × 5 px se leía como una mancha), capucha con orejitas de oso (caída o puesta) y su antiguo traje de "gimnasio".
- Penachos de Agattita hacia arriba: parecían antenas.
- Cartas en abanico para Latte (a 4–5 px por carta no se leen).

## Cómo trabajar un cambio de diseño

1. Mostrar primero una **lámina estática** (antes y después, varias poses) y decidir con ella.
2. Pasarlo al código y revisarlo **animado** en la página de previas (con el servidor de Vite y `--host`, también desde el celular).
3. Si algo parpadea, comparar con la versión publicada: muchas veces el original también lo hace, pero con colores más cercanos.
4. Si una falla no se resuelve en dos intentos, anotarla y seguir.
