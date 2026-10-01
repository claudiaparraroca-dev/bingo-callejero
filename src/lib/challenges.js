// Banco de retos. Cada día se eligen 9 (4 fáciles, 3 medios, 2 difíciles)
// con una semilla basada en la fecha, así todo el mundo juega el mismo cartón.
// `hint` es lo que lee la IA para decidir si la foto vale; `text` es lo que ve el jugador.

export const CHALLENGES = [
  // ── Fáciles ─────────────────────────────────────────────
  { id: 'rojo-ruedas', level: 1, emoji: '🛞', text: 'Algo rojo con ruedas', hint: 'Any object with wheels that is mostly red (car, bike, scooter, trolley, toy...).' },
  { id: 'perro', level: 1, emoji: '🐕', text: 'Un perro', hint: 'A real, living dog. Statues or drawings do not count.' },
  { id: 'numero-7', level: 1, emoji: '7️⃣', text: 'El número 7 en la calle', hint: 'The digit 7 visible somewhere in a real-world setting (door, sign, plate, bus, price...).' },
  { id: 'paloma', level: 1, emoji: '🐦', text: 'Una paloma', hint: 'A pigeon or dove, real and alive.' },
  { id: 'banco', level: 1, emoji: '🪑', text: 'Un banco para sentarse', hint: 'A bench (street, park, station...).' },
  { id: 'flor', level: 1, emoji: '🌼', text: 'Una flor de verdad', hint: 'A real flower (not printed or artificial if clearly fake).' },
  { id: 'bici', level: 1, emoji: '🚲', text: 'Una bicicleta', hint: 'A bicycle.' },
  { id: 'reloj', level: 1, emoji: '🕰️', text: 'Un reloj en la calle', hint: 'A public clock visible outdoors or in a public building (street clock, pharmacy display with time, station clock).' },
  { id: 'tapa', level: 1, emoji: '⚙️', text: 'Una tapa de alcantarilla', hint: 'A manhole cover or drain cover on the ground.' },
  { id: 'farola', level: 1, emoji: '💡', text: 'Una farola', hint: 'A street lamp.' },
  { id: 'gato', level: 1, emoji: '🐈', text: 'Un gato', hint: 'A real, living cat.' },
  { id: 'arbol', level: 1, emoji: '🌳', text: 'Un árbol más alto que una casa', hint: 'A tree that looks taller than a nearby building or at least clearly very tall.' },
  { id: 'paso-cebra', level: 1, emoji: '🦓', text: 'Un paso de cebra', hint: 'A zebra crossing / pedestrian crosswalk painted on the road.' },
  { id: 'buzon', level: 1, emoji: '📮', text: 'Un buzón de correos', hint: 'A public mailbox or postbox (e.g. yellow Correos box in Spain) or a building letterbox.' },
  { id: 'algo-azul', level: 1, emoji: '🔵', text: 'Una puerta azul', hint: 'A door that is mostly blue.' },
  { id: 'nube', level: 1, emoji: '☁️', text: 'Una nube con forma de algo', hint: 'Clouds in the sky. Be lenient: any visible cloud counts.' },
  { id: 'papelera', level: 1, emoji: '🗑️', text: 'Una papelera', hint: 'A public bin or rubbish container.' },
  { id: 'semaforo-verde', level: 1, emoji: '🟢', text: 'Un semáforo en verde', hint: 'A traffic light (for cars or pedestrians) showing green.' },
  { id: 'fruta', level: 1, emoji: '🍊', text: 'Fruta de verdad', hint: 'Real fruit (in a shop, market, tree, hand...).' },
  { id: 'escalera', level: 1, emoji: '🪜', text: 'Unas escaleras', hint: 'Stairs or steps.' },

  // ── Medios ──────────────────────────────────────────────
  { id: 'perro-ropa', level: 2, emoji: '🧥', text: 'Un perro con ropa', hint: 'A real dog wearing clothing (coat, jumper, bandana, raincoat...). A plain collar or harness does NOT count.' },
  { id: 'grafiti-cara', level: 2, emoji: '🎨', text: 'Un grafiti con una cara', hint: 'Street art / graffiti / mural that contains a face (human, animal or character).' },
  { id: 'cara-cosas', level: 2, emoji: '😮', text: 'Algo que parezca una cara (sin serlo)', hint: 'Pareidolia: an inanimate object that looks like it has a face (plugs, windows, cars, rocks...). Be generous if a face can plausibly be seen.' },
  { id: 'reflejo', level: 2, emoji: '🪞', text: 'Un reflejo en un charco o escaparate', hint: 'A clear reflection of the surroundings on water, a puddle, a shop window or a shiny surface.' },
  { id: 'coche-clasico', level: 2, emoji: '🚗', text: 'Un coche de antes del 2000', hint: 'A car that clearly looks like an older model (roughly pre-2000 design). Be reasonable, not strict.' },
  { id: 'letra-z', level: 2, emoji: '🔠', text: 'Una palabra que empiece por Z', hint: 'A written word starting with the letter Z visible in the real world (sign, shop, poster, product).' },
  { id: 'sombra-rara', level: 2, emoji: '👤', text: 'Una sombra con forma curiosa', hint: 'A clearly visible shadow that is the main subject of the photo.' },
  { id: 'corazon', level: 2, emoji: '❤️', text: 'Un corazón que no sea un emoji', hint: 'A heart shape found in the real world (sign, sticker, graffiti, object, natural shape).' },
  { id: 'gnomo', level: 2, emoji: '🗿', text: 'Una estatua o escultura', hint: 'A statue or sculpture in a public space.' },
  { id: 'tres-colores', level: 2, emoji: '🌈', text: 'Tres coches de colores distintos juntos', hint: 'At least three cars visible in one shot, each a clearly different color.' },
  { id: 'cartel-a-mano', level: 2, emoji: '✍️', text: 'Un cartel escrito a mano', hint: 'A handwritten sign or note (shop menu chalkboard, notice, lost pet poster...).' },
  { id: 'globo', level: 2, emoji: '🎈', text: 'Un globo', hint: 'A balloon (party balloon, foil balloon, hot air balloon).' },
  { id: 'ventana-planta', level: 2, emoji: '🪴', text: 'Una ventana o balcón lleno de plantas', hint: 'A window or balcony with several visible plants.' },
  { id: 'bandera', level: 2, emoji: '🏳️', text: 'Una bandera ondeando', hint: 'A flag hanging or waving.' },
  { id: 'sombrero', level: 2, emoji: '🎩', text: 'Alguien con sombrero (con permiso)', hint: 'A person wearing a hat or cap. Faces need not be visible; a back view is fine.' },
  { id: 'pajaro-no-paloma', level: 2, emoji: '🦜', text: 'Un pájaro que no sea paloma', hint: 'A real bird that is not a pigeon (sparrow, seagull, parrot, duck...).' },
  { id: 'fecha-antigua', level: 2, emoji: '🏛️', text: 'Una fecha anterior a 1950 en un edificio', hint: 'A year earlier than 1950 written on a building, plaque, fountain or monument.' },
  { id: 'bicicleta-cesta', level: 2, emoji: '🧺', text: 'Una bici con cesta', hint: 'A bicycle that has a basket attached.' },
  { id: 'mismo-color', level: 2, emoji: '🟡', text: 'Algo amarillo más grande que tú', hint: 'A yellow object or surface that is clearly larger than a person (wall, bus, crane, door, awning...).' },
  { id: 'pegatina', level: 2, emoji: '🏷️', text: 'Una pegatina en una farola o señal', hint: 'A sticker stuck on a street lamp, traffic sign or pole.' },

  // ── Difíciles ───────────────────────────────────────────
  { id: 'perro-gato', level: 3, emoji: '🐾', text: 'Un perro y un gato en la misma foto', hint: 'At least one real dog and one real cat both visible in the same photo.' },
  { id: 'numero-hoy', level: 3, emoji: '📅', text: 'El número del día de hoy (fuera de un móvil)', hint: 'The current day-of-month number, written somewhere in the real world (not on a phone/computer screen). The day number is given below.' },
  { id: 'matricula-repe', level: 3, emoji: '🔤', text: 'Una matrícula con dos números iguales', hint: 'A vehicle license plate where at least two of the digits are the same.' },
  { id: 'arcoiris', level: 3, emoji: '🌈', text: 'Un arcoíris (o algo con sus 6 colores)', hint: 'A real rainbow, OR a single object/flag/mural showing at least 6 rainbow colors together.' },
  { id: 'caballo', level: 3, emoji: '🐴', text: 'Un caballo, burro o vaca', hint: 'A real horse, donkey, pony or cow.' },
  { id: 'tres-perros', level: 3, emoji: '🐕‍🦺', text: 'Tres perros en la misma foto', hint: 'At least three real dogs visible in one photo.' },
  { id: 'cabina', level: 3, emoji: '☎️', text: 'Una cabina de teléfono', hint: 'A public telephone booth or public payphone.' },
  { id: 'piano', level: 3, emoji: '🎹', text: 'Un instrumento musical en la calle', hint: 'A musical instrument outdoors or in a public space (busker, music shop window counts).' },
  { id: 'reloj-sol', level: 3, emoji: '☀️', text: 'Un reloj de sol', hint: 'A sundial.' },
  { id: 'coche-amarillo', level: 3, emoji: '🚕', text: 'Un coche amarillo', hint: 'A car whose body is mostly yellow (taxis count).' },
  { id: 'nido', level: 3, emoji: '🪺', text: 'Un nido de pájaro', hint: 'A bird nest (in a tree, building, lamp...).' },
  { id: 'gemelos', level: 3, emoji: '👯', text: 'Dos cosas idénticas una al lado de otra', hint: 'Two clearly identical objects placed side by side (e.g. two identical cars, doors, statues, bins). Be reasonable.' },
  { id: 'agua-fuente', level: 3, emoji: '⛲', text: 'Una fuente echando agua', hint: 'A fountain with visibly flowing water.' },
  { id: 'menu-precio', level: 3, emoji: '☕', text: 'Un café a menos de 1,50 €', hint: 'A menu or price board showing a coffee (café, cortado, etc.) priced below 1.50 EUR.' },
]

const BY_LEVEL = [1, 2, 3].map(l => CHALLENGES.filter(c => c.level === l))
const PICK = { 1: 4, 2: 3, 3: 2 }

// Generador pseudoaleatorio reproducible (mulberry32)
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Hash FNV-1a para que días consecutivos den semillas muy distintas
function hash(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 0x01000193)
  return h >>> 0
}

function shuffle(arr, rand) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function cardForDay(dayNumber) {
  const rand = rng(hash(`bingo-callejero:${dayNumber}`))
  const picked = [1, 2, 3].flatMap(l => shuffle(BY_LEVEL[l - 1], rand).slice(0, PICK[l]))
  return shuffle(picked, rand)
}
