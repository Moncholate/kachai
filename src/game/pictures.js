/* Picture Practice: opción múltiple con una imagen por pregunta (solo en el
   proyector). Las imágenes van en public/images/<carpeta>/ y viajan con la app,
   no con Firebase.

   Regla de diseño: la imagen muestra la acción y NADA MÁS. Todas con el mismo
   formato (una escena, sin relojes ni calendarios): si la forma de la imagen
   delatara la respuesta, nadie leería la oración. La pista del tiempo va en la
   oración: rutina con every day, usually, always…; ahora sobre todo con
   expresiones de tiempo (now, right now, at this moment, today), no con
   imperativos (Look!, Shh!): esos van en una pregunta como mucho.

   El orden ya viene intercalado, para que tampoco "En orden" deje las cinco de
   rutina seguidas. */

import { mc } from './logic.js'

const pictures = (topic, folder, ...questions) => ({
  topic,
  questions: questions.map(([n, ...q]) => ({ ...mc(...q), image: `images/${folder}/${n}.jpg` })),
})

const PS_VS_PC = pictures('Present simple vs continuous', 'ps-vs-pc',
  [1, 'Lucas ___ his teeth twice a day.', 'brushes', 'is brushing', 'brush'],
  [6, 'The baby ___ in her crib right now.', 'is sleeping', 'sleeps', 'are sleeping'],
  [7, 'It ___ a lot today.', 'is raining', 'rains', 'rain'],
  [2, 'My parents ___ in the park every Sunday.', 'run', 'are running', 'runs'],
  [8, 'Look! Emma and Mia ___ on the stage.', 'are dancing', 'dance', 'is dancing'],
  [3, 'Sophie always ___ her cat before school.', 'feeds', 'is feeding', 'feed'],
  [4, 'Tom ___ bread for the whole town every day.', 'bakes', 'is baking', 'bake'],
  [9, 'Dad ___ the car now.', 'is washing', 'washes', 'wash'],
  [5, 'Grandpa usually ___ the newspaper after breakfast.', 'reads', 'is reading', 'read'],
  [10, 'Olivia ___ for her exam at this moment.', 'is studying', 'studies', 'study'],
)

/* Solo presente continuo. En las fotos con dos personas cada una lleva su nombre
   escrito y la oración pregunta por una sola: el nombre decide la respuesta.
   Vocabulario de Elemental I (nada de knit, kick…). */
const PRESENT_CONTINUOUS = pictures('Present continuous', 'present-continuous',
  [1, 'Mateo ___ his bike in the park right now.', 'is riding', 'rides', 'are riding'],
  [3, 'Lucia ___ a song at this moment.', 'is singing', 'sings', 'are singing'],
  [6, 'Sofia ___ in the pool at the moment.', 'is swimming', 'is swiming', 'swims'],
  [5, 'Andres ___ football at the moment.', 'is playing', 'plays', 'are playing'],
  [2, 'Camila ___ a picture at the moment.', 'is painting', 'paints', 'is paint'],
  [8, 'Javiera ___ a photo of Tomas at this moment.', 'is taking', 'takes', 'are taking'],
  [4, 'Rosa ___ dinner right now.', 'is cooking', 'cooks', 'are cooking'],
  [7, 'Mr. Gomez ___ on the board right now.', 'is writing', 'is writeing', 'writes'],
  [9, 'Joaquin ___ a sandwich now.', 'is making', 'is makeing', 'makes'],
  [10, 'Ignacio ___ to a friend on the phone today.', 'is talking', 'talks', 'are talking'],
)

/* Curso → [EA1, EA2]. Va donde el KC "present continuous" (y "vs simple") está en la hoja de ruta. */
export const PICTURES = {
  basico2: [[PRESENT_CONTINUOUS, PS_VS_PC], []],
  basicoInt: [[], [PRESENT_CONTINUOUS, PS_VS_PC]],
  elemental1: [[], [PRESENT_CONTINUOUS, PS_VS_PC]],
  elementalInt: [[PRESENT_CONTINUOUS, PS_VS_PC], []],
}
