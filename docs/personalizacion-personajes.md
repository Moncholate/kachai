# Ideas: personalizar el personaje y distintivo de racha

Borrador del 14 de octubre de 2026. Nada de esto está implementado todavía.

## Cómo quedó (14 de octubre)

- Código en `src/game/personaliza.js`: rampas de Pear36 y, por personaje, las partes exactas de cada material (letras del dibujo, brazo y pierna). No se cambia un color en todo el personaje (el café de la piel de Jelic también es el de su búho).
- Materiales: **piel** (5 tonos, con "Oscura") o pelaje, **pelo** (con cejas y barba; 8 colores, con rosado y turquesa), **ropa** (original + 4 por personaje) y **acento** (original + 3).
- El pelo nunca queda del color de la piel ni repite sus propios tonos (los rulos de Edith).
- July: el brillo de los ojos tiene letra propia y la barba baja en patillas hasta el mentón.
- En el celular, bajo la ficha del personaje: "Personaliza tus colores" con círculos, "Al azar" y "Original". Cada personaje recuerda sus colores en el celular. La elección se guarda con el alumno en la sala y viaja en el tablero de duelos, así el rival y el proyector lo dibujan igual.
- Con racha de 8 el personaje se vuelve todo dorado y no se notan sus colores.
- Lámina de revisión: `previa-personaliza.html`.

## Idea base

El alumno elige uno de los 15 personajes y después ajusta **unos pocos colores**. No se dibuja nada nuevo: los colores de cada personaje están separados por letra (`pal` en `heroesHD.js`), así que personalizar es cambiar esas letras por otras rampas de Pear36. Ya lo hicimos una vez: el cambio de piel entre Jelic y Patroclus fue cambiar solo `z`, `S` y `s`.

Todas las opciones salen de Pear36 (luz, base y sombra de una misma rampa) y respetan la [guía de estilo](estilo-personajes.md).

## Decidido (14 de octubre)

### 1. Piel: los tonos que ya existen
Se reutilizan las pieles que ya tienen los personajes humanos: **rosada clara, durazno, tostada y café rojiza**. Hay que sacar las rampas exactas del código (de Malala, Latte, Patroclus y Jelic), no de memoria.

### 2. Pelaje y piel de los no humanos

| Personaje | Opciones |
|---|---|
| **Agattita** | naranjo, crema, **manchada** (spotted) y el gris de siempre |
| **Cupe** | café, gris, negro y el blanco de siempre |
| **Uzu** (goblin) | naranjo, gris, amarillo y el verde lima de siempre |

- **Manchas de Agattita:** el motor ya acepta que un color sea una función de la posición (así se hace el cuadrillé), así que las manchas pueden ser un patrón fijo sobre el pelaje sin redibujarla. Las manchas tienen que ser grandes (2×2 o más) y quedarse quietas, porque a este tamaño los puntos sueltos ensucian (regla de no usar dithering).
- **Uzu:** su modo berserk usa los rojos de Pear36. Con piel naranja o amarilla hay que revisar que el berserk se siga notando.

### 3. Pelo
6 colores: negro, café oscuro, café claro, rubio dorado, pelirrojo y uno de fantasía (rosado o turquesa).
- Las cejas cambian con el pelo (van en el tono oscuro del pelo). Salvo las cejas canosas de Tiván, que son a propósito.
- Los personajes sin pelo visible (Cupe, Agattita y Jelic bajo el casco) no tienen esta opción.

### 4. Ropa principal: colores que le queden a cada personaje
No hay una lista común para todos. Cada personaje tiene **su propia lista corta (4–5)** de colores pensados para su ropa y su estilo: por ejemplo, tonos tierra y verdes para Patroclus; azules, morados y ciruela para Edith y Xitin. Se arman revisándolos uno por uno sobre una lámina, y quedan fuera los que choquen con la piel o el arma (como el abrigo mostaza de Tiván o la pañoleta roja de Patroclus).

### 5. Color de acento: sí
Un segundo color para pantalón, botas o faja. Solo 3–4 opciones por personaje, también elegidas para cada uno.

### Para mucho más adelante
- **Colores desbloqueables:** recién cuando guardemos información de cada alumno (hoy no guardamos nada).
- Color de la mascota o del arma; un accesorio pequeño (implica dibujar).

## Cómo se elige (en el celular)

- Primero el personaje, como ahora; después una pantalla "Personaliza" con el personaje grande animado y filas de **círculos de color** (piel o pelaje, pelo, ropa, acento).
- Botones **"Al azar"** y **"Original"**.
- Se puede saltar: si el alumno no toca nada, queda el personaje original.
- Como no guardamos datos de alumnos, por ahora se elige en cada partida (como mucho, el celular lo recuerda con `localStorage`).

## Distintivo de racha

Hoy la racha ya existe: desde 3 preguntas enteras bien seguidas aparece 🔥 junto al nombre (`STREAK_MIN` en `logic.js`). La idea es que el personaje también lo muestre.

### Ideas

1. **Aura de ki.** Un contorno de fuego de píxeles alrededor de la silueta que sube y titila, con chispas que se elevan. Es la idea más reconocible y sirve para los 15 sin dibujar nada por personaje: se calcula a partir de la silueta.
2. **Arma encendida.** Llamas pequeñas en la cabeza del arma (la espada de Cupe, el mazo de July, la escoba de Malala). Necesita un punto de anclaje por arma, y queda raro en las que no son armas (el grimorio de Edith, el báculo de Xitin). Una alternativa es que el arma **brille** con el color propio de cada personaje: la luna de Malala, la gema de Xitin y las runas del grimorio de Edith.
3. **Pelo de Super Saiyan.** El pelo cambia a dorado (y con un brillo) mientras dura la racha. Como cambia solo un color, sale casi gratis una vez que exista la personalización del pelo.
4. **Ojos que brillan.** Los dos píxeles de brillo de los ojos cambian a un color intenso (turquesa o dorado). Es sutil y sirve como primer nivel.
5. **Estela.** En el ataque quedan dos o tres copias del personaje, cada una más transparente (como cuando un personaje va muy rápido).
6. **Huellas o chispas en el suelo.** Chispitas donde pisa.
7. **La mascota reacciona.** El búho de Jelic y el águila de Patroclus aletean o les brillan los ojos. Solo sirve para los personajes que tienen mascota.
8. **Uzu entra en berserk.** Su racha es el modo berserk que ya tiene.

### Niveles decididos (14 de octubre)

| Racha | Distintivo |
|---|---|
| 3 | El arma brilla (se aclara, halo doble que late, destello y chispitas) |
| 5 | Le sale el aura al personaje (y el arma sigue brillando) |
| 8 o más | El personaje entero brilla, con un aura distinta y más grande: **ultra instinto** (núcleo blanco → turquesa → azul, llamas altas deshilachadas, lucecitas que suben, escenario oscurecido) |

**Lo que lanzan también lleva el distintivo** en los tres niveles: la flecha de Janet, las dos dagas de Uchis, las notas de Kenny, el rayo de Edith, la ola de tierra de July, el disparo de la escoba de Malala y los brotes de Agattita. En el juego eso es `proyectil` de cada personaje. Ojo: Malala, al embestir, lleva la escoba en `atras` (junto con sus gatas), no en `arma`.

**El distintivo también va en los overtakes** (las escenas de cuando un alumno adelanta a otro), no solo en el duelo.

**Desarmado no pierde la racha:** la racha solo se apaga cuando se corta. Si lo desarman en un overtake, su arma sigue brillando al volar y en el suelo, y con racha de 3 le salen chispitas doradas en el cuerpo (también al aplaudir, que no tiene arma).

**Los efectos de los overtakes crecen con la racha** (`pintaEfecto` en `racha.js`): la flecha de Janet brilla; el rayo de Edith mantiene su grosor y su color, saca ramas, salpica más chispas y lleva un borde de luz de 1 px (amarillo claro en 3, dorado en 5, ultra instinto en 8); la onda de July levanta un bulto más alto y más rocas, que brillan como un arma.

**Xitin en el podio** se transforma igual que al atacar: carga maná en la mano libre, se lo lanza a la gema del báculo, la gema estalla y recién ahí sale la nube rosada y aparece el osito.

**Y en el final del juego:** si el alumno termina con racha, su distintivo (el nivel con que terminó: 3, 5 u 8) sigue puesto en la celebración del podio (`escenaPodio`, y `podioProyector` para los 3 primeros en el proyector) y en la escena de aplauso de quienes no quedaron en el podio (`escenaAplauso`).

**Ajustes de la muestra (14 de octubre):** auras de 1 px en racha 5 y de 3 px en racha 8; lo lanzado solo lleva un contorno de 1 px; el contorno del arma se vuelve dorado (así brilla aunque esté encima del cuerpo, como la daga izquierda de Uchis); el arañazo del oso de Xitin no lleva aura. En el juego se arreglaron dos cosas: el arañazo sale junto a la garra, y las notas de Kenny ya no tienen el rectángulo negro detrás (ataque, overtake y podio).

**Elegido (14 de octubre):**
- Racha 5: aura **ki dorado** (se ve mejor en la pradera).
- Racha 8: brillo **dorado** + aura **ultra instinto** más grande + **escenario oscurecido**.
- Sin aura translúcida: el aura es de colores sólidos.

Muestra animada con el código real: `previa-racha.html` (con el servidor de Vite). Ahí se comparan el color del aura (fuego, ki dorado, ki azul) y el brillo entero (dorado, plateado o colores alternos).

### Niveles (primera propuesta, reemplazada)

| Racha | Distintivo |
|---|---|
| 3 | Ojos que brillan y chispitas suaves |
| 5 | Aura de ki completa |
| 8 o más | Aura más grande y arma brillando (o pelo dorado) |

Así el alumno ve que su racha sigue creciendo, y el efecto grande no aparece todo el tiempo.

### Cuidados

- **Sin exponer a nadie:** el aura premia al que va bien, pero cuando se corta la racha **se apaga en silencio**, sin animación de "perdió" ni sonido. En el proyector solo se ve en los duelos, donde ya aparecen los personajes.
- **Sin violencia:** el fuego es de caricatura y decorativo. No quema al rival ni cambia el golpe.
- **Pear36 y parpadeo:** las llamas usan rampas vecinas (FFE478 · F2A65E · E36956 · EB564B) para no titilar feo. `pear36.js` ya convierte los colores de los efectos.
- **Rendimiento:** un aura que recorre la silueta en cada cuadro puede costar en celulares antiguos. Conviene calcular el contorno una vez por pose y solo animar el color.
- **El pixel art no se rota:** las llamas suben con desplazamientos, no girando.

## Para decidir juntos

1. ¿Por dónde partimos: personalización o distintivo de racha?
2. ¿Qué ideas de racha te gustan, y con qué niveles?
3. ¿Uzu usa su berserk como racha o lleva el aura como los demás?
4. ¿El arma brilla con el color de cada personaje o con fuego para todos?
