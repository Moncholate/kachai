/* Chibis de mapa (16 × 22, Pear36) de los 15 personajes, al estilo de los sprites de mapa
   de SNES: van en la cubierta de la nave del curso en la ronda bonus (ver bonusProyector.js). */
/* Cada chibi: paleta (letra → color) y filas de 16 caracteres. '.' es transparente. */
export const CHIBIS = {
  malia: {
    nombre: 'Malía',
    pal: { K: '#272736', W: '#FFFFEB', w: '#C2C2D1', P: '#FFB5B5', E: '#272736', R: '#EB564B', B: '#FFB570', D: '#43434F' },
    filas: [
      '......KKK.......',
      '.....KWWWK......',
      '...KKKWWWKKK....',
      '..KWwWWWWWWwK...',
      '..KWWwWWwWWWWK..',
      '..KWWWWWWWWWWK..',
      '..KWWWPPPPPPWK..',
      'KPKWWPPEPPEPK...',
      '.KKWWPPPPPPPK...',
      '...KWPPRPPPRK...',
      '...KKPPPPPPK....',
      '....KKKKKKK.....',
      '..KBKWWWWWBK....',
      '.KBBKWRWRWKBK...',
      '.KBBKWRRRWKPK...',
      '..KKKWWRWWK.....',
      '...KDWWWWWDK....',
      '...KDDDDDDDK....',
      '....KDK.KDK.....',
      '....KDK.KDK.....',
      '....KDK.KDK.....',
      '....KKK.KKK.....',
    ],
    arriba: [4, 10, 12, 'B', 'P'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[11,13,'.'],[12,13,'.'],[11,14,'.'],[12,14,'.'],[2,12,'.'],[3,12,'.'],[1,13,'.'],[2,13,'.'],[3,13,'.'],[1,14,'.'],[2,14,'.'],[3,14,'.'],[2,15,'.'],[3,15,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  tivan: {
    nombre: 'Tiván',
    pal: { K: '#272736', H: '#C2C2D1', h: '#FFFFEB', R: '#EB564B', B: '#4DA6FF', P: '#F2A65E', E: '#272736', G: '#FFFFEB', W: '#FFFFEB', C: '#3D6E70', v: '#66FFE3', g: '#8C3F5D', L: '#323E4F', b: '#5E315B' },
    filas: [
      '................',
      '....K.K.K.......',
      '...KHKHKHKK.....',
      '..KHHHHHHHHK....',
      '..KHhHHHHHHHK...',
      '..KHHRRRBRRHK...',
      '..KHHPPPPPPPK...',
      '..KHPPGEPGEPK...',
      '..KHPPPPPPPPK...',
      '...KKPPPPPPK....',
      '....KKKKKKK.....',
      '...KCWWKWWCK....',
      '..KCCKWWWKCK....',
      '.KCCKCvCvCCKgK..',
      '.KCCKCCvCvCK....',
      '.KCCKCCCCCCK....',
      '..KCKCCCCCCK....',
      '...KKCCKCCCK....',
      '....KLK.KLK.....',
      '....KLK.KLK.....',
      '....KbK.KbK.....',
      '....KKK.KKK.....',
    ],
    arriba: [4, 11, 12, 'C', 'g'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[12,13,'.'],[13,13,'.'],[2,12,'.'],[3,12,'.'],[4,12,'K'],[1,13,'.'],[2,13,'.'],[3,13,'.'],[1,14,'.'],[2,14,'.'],[3,14,'.'],[1,15,'.'],[2,15,'.'],[3,15,'.'],[2,16,'.'],[3,16,'.'],[3,17,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  patroclus: {
    nombre: 'Patroclus',
    pal: { K: '#272736', H: '#272736', h: '#43434F', P: '#F2A65E', E: '#272736', s: '#C2C2D1', R: '#EB564B', W: '#FFFFEB', B: '#4B5BAB', b: '#5E315B' },
    filas: [
      '................',
      '................',
      '.....KKKKK......',
      '....KhhhhhKK....',
      '...KhhhhhhhhK...',
      '...KhhHhhhhhK...',
      '...KhhPPPPPPK...',
      '...KhPPEPPEPK...',
      '...KhPPPPPPPK...',
      '...KsPPPPPPK....',
      '....KKPPPPK.....',
      '...KKRRRRRKK....',
      '..KWKWRRWWWK....',
      '.KWWKWWRWWWKPK..',
      '.KWWKWWWWWWK....',
      '..KKKBBBBBBK....',
      '....KBBBBBBK....',
      '....KBBKBBBK....',
      '....KPK.KPK.....',
      '....KPK.KPK.....',
      '....KbK.KbK.....',
      '....KKK.KKK.....',
    ],
    arriba: [4, 11, 12, 'W', 'P'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[12,13,'.'],[13,13,'.'],[2,12,'.'],[3,12,'.'],[1,13,'.'],[2,13,'.'],[3,13,'.'],[1,14,'.'],[2,14,'.'],[3,14,'.'],[2,15,'.'],[3,15,'.'],[3,17,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  uchis: {
    nombre: 'Uchis',
    pal: { K: '#272736', H: '#BA6156', Y: '#FFE478', B: '#4DA6FF', P: '#FFB5B5', E: '#272736', R: '#FF6B97', C: '#EB564B', T: '#FFFFEB', p: '#3D6E70', L: '#8C3F5D', b: '#BA6156' },
    filas: [
      '................',
      '.....KKKKKK.....',
      '....KHHHHHHK....',
      '...KHHHHHHHHK...',
      '..KHHYYYBYYHHK..',
      '..KHHHPPPPPPHK..',
      '..KHHPPEPPEPHK..',
      '..KHHPPPPPPPK...',
      '..KHHPPPRPPK....',
      '..KHHKPPPPK.....',
      '..KHHHKKKKK.....',
      '..KHHKCCCCCK....',
      '..KHKCTTYTCK....',
      '.KCCKTpYpTCKPK..',
      '.KCCKTpppTCK....',
      '.KCCKTTTTTK.....',
      '..KCKLLLLLK.....',
      '...KKLLKLLK.....',
      '....KLK.KLK.....',
      '....KLK.KLK.....',
      '....KbK.KbK.....',
      '....KKK.KKK.....',
    ],
    arriba: [4, 11, 12, 'T', 'P'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[12,13,'.'],[13,13,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  janet: {
    nombre: 'Janet',
    pal: { K: '#272736', H: '#F2A65E', h: '#FFE478', P: '#FFB5B5', E: '#272736', B: '#BA6156', W: '#FFFFEB', Q: '#8C3F5D', G: '#3CA370', g: '#8FDE5D', L: '#3D6E70', s: '#C2C2D1', b: '#5E315B' },
    filas: [
      '................',
      '.....KKKKKK.....',
      '....KHHhHHHK....',
      '...KHHHHHhHHK...',
      '..KHHHHHHHHHK...',
      '..KHHHPPPPPPK...',
      'KPKHHPPEPPEPK...',
      '.KKHHPPPPPPPK...',
      '..KHHBBPPPBBK...',
      '..KHHBBBBBBBK...',
      '.KWKHKBBBBBK....',
      '.KQKHKKKKKKK....',
      '.KQKGGgGGGGK....',
      '.KQKGgGGgGGKPK..',
      '.KQKGGGgGGGK....',
      '..KKGgGGGgGK....',
      '...KLLLLLLLK....',
      '...KKLLKLLLK....',
      '....KsK.KsK.....',
      '....KsK.KsK.....',
      '....KbK.KbK.....',
      '....KKK.KKK.....',
    ],
    arriba: [3, 11, 12, 'G', 'P'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[12,13,'.'],[13,13,'.'],[3,17,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  edith: {
    nombre: 'Edith',
    pal: { K: '#272736', H: '#43434F', h: '#606070', P: '#F2A65E', E: '#272736', R: '#5E315B', r: '#8C3F5D', W: '#FFFFEB', L: '#43434F', b: '#272736' },
    filas: [
      '................',
      '.....KKKKKK.....',
      '....KHHHHHHK....',
      '...KHHhHHHHHK...',
      '..KHHHHHHHHHHK..',
      '..KHHHPPPPPPHK..',
      '..KHHPPEPPEPHK..',
      '..KHHPPPPPPPK...',
      '..KHHPPPPPPK....',
      '..KHHKPPPPK.....',
      '.KWKHHKKKKKKWK..',
      '.KWWKRRRRRKWWK..',
      '.KWWKRrRRRKWWK..',
      '..KKKRrRRRKPK...',
      '..KHKRrRRRK.....',
      '..KHKRRRRRRK....',
      '..KKRRrRRRRK....',
      '...KRRRRRRRK....',
      '...KKRRRRRKK....',
      '....KLK.KLK.....',
      '....KbK.KbK.....',
      '....KKK.KKK.....',
    ],
    arriba: [4, 10, 13, 'R', 'P'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[11,13,'.'],[12,13,'.'],[1,10,'.'],[2,10,'.'],[1,11,'.'],[2,11,'.'],[3,11,'.'],[1,12,'.'],[2,12,'.'],[3,12,'.'],[12,10,'.'],[13,10,'.'],[11,11,'.'],[12,11,'.'],[13,11,'.'],[11,12,'.'],[12,12,'.'],[13,12,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  uzu: {
    nombre: 'Uzu',
    pal: { K: '#272736', s: '#C2C2D1', M: '#606070', m: '#43434F', G: '#8FDE5D', R: '#EB564B', W: '#FFFFEB', b: '#BA6156', Y: '#FFE478', L: '#8C3F5D' },
    filas: [
      '....K.K.K.......',
      '...KsKsKsK......',
      '..KMMMMMMMK.....',
      '.KMmMMMMMMMK....',
      '.KMMMMMMMMMMK...',
      'KGKKGGGGGGGGK...',
      'KGGKGGGRGGRGK...',
      'KGGKGGGGGGGGGK..',
      '.KGKGWKWKWKWGK..',
      '..KKGGKKKKKGK...',
      '...KKGGGGGGK....',
      '....KKKKKKKK....',
      '..KGKbbbbbbK....',
      '.KGGKbbYbbbKGK..',
      '.KGGKbbbbbbK....',
      '..KKKbbbbbbK....',
      '....KLLLLLLK....',
      '....KLLKLLLK....',
      '....KLK.KLK.....',
      '....KGK.KGK.....',
      '....KbK.KbK.....',
      '....KKK.KKK.....',
    ],
    arriba: [4, 11, 12, 'G', 'G'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[12,13,'.'],[13,13,'.'],[2,12,'.'],[3,12,'.'],[1,13,'.'],[2,13,'.'],[3,13,'.'],[1,14,'.'],[2,14,'.'],[3,14,'.'],[2,15,'.'],[3,15,'.'],[3,17,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  xitin: {
    nombre: 'Xitin',
    pal: { K: '#272736', Y: '#FFE478', W: '#FFFFEB', P: '#FFB5B5', E: '#272736', R: '#FF6B97', B: '#8C3F5D', D: '#43434F', L: '#4B5BAB', s: '#C2C2D1' },
    filas: [
      '................',
      '.....KKKKKK.....',
      '....KYYYYYYK....',
      '...KYWYYYYYYK...',
      '..KYYYYYYYYYYK..',
      'KKKYYYPPPPPPYK..',
      'KYYKYPPEPPEPYK..',
      'KYYKYPPPPPPPK...',
      '.KYYKPPPRPPK....',
      '.KYYKKPPPPK.....',
      '..KYKKKKKKK.....',
      '..KYKWWLLWWK....',
      '.KWWKWLLLLWK....',
      '.KWWKYYYYYKPK...',
      '..KKKLLLLLK.....',
      '....KDDDDDK.....',
      '....KDDDDDK.....',
      '....KDDKDDK.....',
      '....KDK.KDK.....',
      '....KsK.KsK.....',
      '....KsK.KsK.....',
      '....KKK.KKK.....',
    ],
    arriba: [4, 10, 12, 'W', 'P'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[11,13,'.'],[12,13,'.'],[1,12,'.'],[2,12,'.'],[3,12,'.'],[1,13,'.'],[2,13,'.'],[3,13,'.'],[2,14,'.'],[3,14,'.'],[3,17,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },

  latte: {
    nombre: 'Latte',
    pal: { K: '#272736', T: '#43434F', R: '#EB564B', W: '#FFFFEB', O: '#BA6156', o: '#EB564B', P: '#FFB5B5', E: '#272736', B: '#43434F', G: '#3CA370', g: '#3D6E70', J: '#8C3F5D', j: '#5E315B', C: '#66FFE3', L: '#43434F', b: '#BA6156' },
    filas: [
      '.....KKKKKK.....',
      '.....KTTTTK.....',
      '.....KTTTTK.....',
      '.....KRRRWK.....',
      '...KKKKKKKKKK...',
      '...KOOOOOOOOK...',
      '..KOoOOOOOoOOK..',
      '..KOOPPPPPPPOK..',
      '..KOOPPEPPEPK...',
      '..KOOPPPPPPPK...',
      '..KOOBBBBBBBK...',
      '...KKBBBBBBK....',
      '..KGKJJJJJJK....',
      '.KGGKJJjJJJK....',
      '.KGGKJJjJJJCK...',
      '.KgGKJJjJJJK....',
      '..KgKLLLLLLK....',
      '...KKLLKLLLK....',
      '....KLK.KLK.....',
      '....KLK.KLK.....',
      '....KbK.KbK.....',
      '....KKK.KKK.....',
    ],
    arriba: [4, 11, 12, 'J', 'C'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[11,14,'K'],[12,14,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  cupe: {
    nombre: 'Cupe',
    pal: { K: '#272736', Y: '#FFE478', W: '#FFFFEB', w: '#C2C2D1', g: '#7E7E8F', E: '#272736', N: '#272736', R: '#EB564B', r: '#B0305C', d: '#43434F', D: '#606070' },
    filas: [
      '.....K..K..K....',
      '.....KYKYKYK....',
      '.....KYYYYYK....',
      '...KKKKKKKKKKK..',
      '..KWWWWWWWWWWWK.',
      '.KgKWWWWWWWWKgK.',
      '.KgKWWEWWWEWKgK.',
      'KggKWWWWWWWWKggK',
      'KggKWWWWNNWWKggK',
      '.KgKWWWWwWWWKgK.',
      '..KKKWWWWWWKKK..',
      '....KKKKKKKK....',
      '.KRKdddddddK....',
      'KRRKdDDDDDdK....',
      'KRRKdDYYDDdWK...',
      'KRrKdDDDDDdK....',
      '.KrKddddddK.....',
      '..KKddKdddK.....',
      '...KdK.KdK......',
      '...KdK.KdK......',
      '...KDK.KDK......',
      '...KKK.KKK......',
    ],
    arriba: [5, 10, 12, 'D', 'W'], atrasEncima: true,   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[11,14,'K'],[12,14,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  kenny: {
    nombre: 'Kenny',
    pal: { K: '#272736', H: '#5E315B', h: '#73275C', P: '#F2A65E', S: '#66FFE3', B: '#43434F', T: '#3D6E70', J: '#B0305C', j: '#73275C', L: '#323E4F', b: '#8C3F5D' },
    filas: [
      '................',
      '.....KKKKKK.....',
      '....KHHHHHHK....',
      '...KHHhHHHHHK...',
      '..KHHHHHHHHHHK..',
      '..KHHHPPPPPPHK..',
      '..KHHPKKSPKSKK..',
      '..KHHPPPPPPPK...',
      '..KHHBBBBBBBK...',
      '..KHHKBBBBBK....',
      '..KHKTTTTTTTK...',
      '.KHHKJJTJJJJK...',
      '.KHKJJJTJJJK....',
      '..KKJJjJJJJPK...',
      '...KJJjJJJJK....',
      '...KJJjJJJJK....',
      '...KLLLLLLLK....',
      '...KKLLKLLLK....',
      '....KLK.KLK.....',
      '....KLK.KLK.....',
      '....KbK.KbK.....',
      '....KKK.KKK.....',
    ],
    arriba: [3, 11, 12, 'J', 'P'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[11,13,'K'],[12,13,'.'],[3,17,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  july: {
    nombre: 'July',
    pal: { K: '#272736', P: '#FFB5B5', R: '#FF6B97', W: '#FFFFEB', E: '#272736', S: '#8C3F5D', A: '#BA6156', Y: '#FFE478', L: '#43434F', b: '#5E315B' },
    filas: [
      '................',
      '................',
      '......KKKKKK....',
      '.....KPPPPPPK...',
      '....KPWPPPPPPK..',
      '....KPPPPPPPPK..',
      '....KPRPEPPEPK..',
      '....KPRPPPPPPK..',
      '....KPPWWWWWPK..',
      '....KKWWWWWWK...',
      '.....KKWWWWK....',
      '...KKSSKKKKSSK..',
      '..KSSKAAAAAASK..',
      '..KSSKAAAAAASPK.',
      '...KKKAAAAAAK...',
      '.....KAYAYAYK...',
      '.....KAAAAAAK...',
      '.....KLLKLLKK...',
      '.....KLK.KLK....',
      '.....KLK.KLK....',
      '.....KbK.KbK....',
      '.....KKK.KKK....',
    ],
    arriba: [5, 12, 12, 'S', 'P'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[12,12,'K'],[13,12,'.'],[12,13,'K'],[13,13,'.'],[14,13,'.'],[2,12,'.'],[3,12,'.'],[4,12,'.'],[2,13,'.'],[3,13,'.'],[4,13,'.'],[3,14,'.'],[4,14,'.'],[4,17,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },

  malala: {
    nombre: 'Malala',
    pal: { K: '#272736', E: '#272736', A: '#3D6E70', a: '#323E4F', Y: '#F2A65E', H: '#43434F', h: '#606070', P: '#FFB5B5', R: '#FF6B97', G: '#8FDE5D', g: '#3CA370', W: '#FFFFEB', L: '#322947' },
    filas: [
      '.........KK.....',
      '........KAAK....',
      '.......KaAAK....',
      '......KaAAAAK...',
      '.....KaYYYYYK...',
      '.KKKKaaaaaaaaKKK',
      'KAAAAAAAAAAAAAAK',
      '.KaYaaYaaYaaYaK.',
      '.KHHHHhHHHhHHHK.',
      '.KHHHhHHHhHHHHHK',
      '.KHHHPPEPPEPPHK.',
      '.KHHPPRPPPPRPK..',
      '.KHHKPPPPPPPK...',
      '.KHHKKYYYYYK....',
      '.KHKGWGGWGGPK...',
      '..KKgGgGgGgK....',
      '...KGWGGWGGK....',
      '...KgGgGgGgK....',
      '..KGWGGWGGWGK...',
      '..KgGgGgGgGgK...',
      '....KLK..KLK....',
      '....KKK..KKK....',
    ],
    arriba: [3, 11, 14, 'G', 'P'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[11,14,'K'],[12,14,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  jelic: {
    nombre: 'Jelic',
    pal: { K: '#272736', R: '#EB564B', r: '#B0305C', S: '#FFFFEB', s: '#C2C2D1', m: '#7E7E8F', C: '#BA6156', c: '#8C3F5D', W: '#FFFFEB', B: '#4B5BAB', b: '#473B78', Y: '#FFE478', L: '#7E7E8F' },
    filas: [
      '.....KK.........',
      '...KKRRK........',
      '..KRRrKKKKK.....',
      '..KRKKSSSSSKK...',
      '...KSSSSSSSSSK..',
      '..KsSSSSSSSSSSK.',
      '..KsSSSKKKKKKSK.',
      '..KssSKCCCCCCKK.',
      '..KssSKCKCCKCK..',
      '..KmsSKCCCCCCK..',
      '..KmssKCWWWWCK..',
      '...KmsKKCCCCKK..',
      '..KbKKsssssssK..',
      '.KbBKsBRBRBsK...',
      '.KbBKsBRBRBsSK..',
      '.KbBBKBRRRBKsK..',
      '..KbBKBBBBBKK...',
      '...KKKYYYYYK....',
      '....KsK..KsK....',
      '....KmK..KmK....',
      '....KLK..KLK....',
      '....KKK..KKK....',
    ],
    arriba: [4, 12, 12, 's', 'S'],   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[12,14,'K'],[13,14,'.'],[12,15,'.'],[13,15,'.'],[12,16,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
  agattita: {
    nombre: 'Agattita',
    pal: { K: '#272736', F: '#7E7E8F', f: '#606070', D: '#43434F', W: '#FFFFEB', S: '#FFFFEB', w: '#C2C2D1', N: '#FF6B97', E: '#272736', V: '#3CA370', v: '#3D6E70', Y: '#FFE478', G: '#8FDE5D' },
    filas: [
      '................',
      '..KK........KK..',
      '..KFK......KFK..',
      '..KFfK....KfFK..',
      '..KFFFKKKKFFFFK.',
      '.KFFDFFFYGYFFDFK',
      '.KFFFDFFFFFFDFFK',
      'KFFFESEFFFESEFFK',
      'KFFFEEEFFFEEEFFK',
      'KFFFWWWWNNWWWWFK',
      '.KFFFWWWwwWWWFFK',
      '.KFFFFWWwwWWFFFK',
      '..KKFFFFFFFFFKK.',
      '...KVVVVVVVVKKfK',
      '..KVvVGVVGVvVKDK',
      '..KWKvVVVVvKWKfK',
      '...KKFWWWWFK.KDK',
      '....KFWWWWFKKfK.',
      '....KFFFFFFKK...',
      '....KWK..KWK....',
      '....KWK..KWK....',
      '....KKK..KKK....',
    ],
    arriba: [4, 11, 13, 'F', 'W'], atrasEncima: true,   // brazos levantados: hombro izq, hombro der, fila, manga, mano
    quitarAlCelebrar: [[2,15,'.'],[3,15,'.'],[12,15,'.'],[3,16,'.']],   // brazo o mano de reposo (x, y, lo que queda)
  },
}

/* Pinta un chibi; si celebra, sube 2 px y levanta las manos */
/* Al celebrar se borra el brazo o la mano de reposo (marcado a mano en cada chibi): si no, queda una tercera mano. */
function filasCelebrando(c) {
  const f = c.filas.map((r) => [...r])
  for (const [x, y, k] of c.quitarAlCelebrar || []) f[y][x] = k
  return f.map((r) => r.join(''))
}
export function chibi(g, c, x, y, celebra) {
  const dy = celebra ? -2 : 0
  const filas = filasCelebrando(c)   // el cuerpo sin brazos; los brazos se dibujan aparte, iguales para todos
  const en = (i, j) => (filas[j] && filas[j][i]) || '.'
  const px = (i, j, k) => { g.fillStyle = k === 'K' ? '#272736' : c.pal[k]; g.fillRect(x + i, y + j + dy, 1, 1) }
  filas.forEach((f, j) => [...f].forEach((k, i) => { if (k !== '.') px(i, j, k) }))
  /* Cada brazo: manga y mano de 2×2, con contorno. El de adelante (izquierda) va encima de todo (cuerpo, capa, pelo);
     el de atrás (derecha) solo se ve donde no hay cuerpo. */
  const [hi, hd, hy, manga, mano] = c.arriba
  const brazo = (pts, delante, union, soloMismoColor) => {
    const set = new Set(pts.map(([i, j]) => i + ',' + j))
    /* Donde el brazo se une al cuerpo no lleva contorno (si no, queda un pelito). En reposo, solo si se une a ropa
       de su mismo color: si arriba hay pelo, capa o carcaj, el borde sí va. */
    if (!soloMismoColor || en(union[0], union[1]) === pts[0][2]) set.add(union[0] + ',' + union[1])
    /* contorno: el brazo de adelante lo dibuja también sobre el cuerpo (se despega de él); el de atrás, solo en el vacío */
    for (const [i, j] of pts) for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!set.has((i + a) + ',' + (j + b)) && (delante || en(i + a, j + b) === '.')) px(i + a, j + b, 'K')
    for (const [i, j, k] of pts) if (delante || en(i, j) === '.') px(i, j, k)
  }
  const mano2 = (i, j) => [[i, j, mano], [i + 1, j, mano], [i, j + 1, mano], [i + 1, j + 1, mano]]
  if (celebra) {
    brazo([[hd + 1, hy - 1, manga], [hd + 2, hy - 2, manga]], false, [hd + 1, hy])
    brazo(mano2(hd + 2, hy - 4), true, [hd + 2, hy - 2])   // la mano de atrás, levantada, va delante de orejas y pelo (si no, se pierde)
    brazo([[hi - 1, hy - 1, manga], [hi - 2, hy - 2, manga], ...mano2(hi - 3, hy - 4)], true, [hi - 1, hy])
  } else {
    brazo([[hd + 1, hy, manga], [hd + 1, hy + 1, manga], [hd + 1, hy + 2, manga], ...mano2(hd + 1, hy + 3)], !!c.atrasEncima, [hd + 1, hy - 1], true)   // atrasEncima: el brazo de atrás va sobre el borde del cuerpo (Cupe)
    brazo([[hi - 1, hy, manga], [hi - 1, hy + 1, manga], [hi - 1, hy + 2, manga], ...mano2(hi - 1, hy + 3)], true, [hi - 1, hy - 1], true)
  }
}

