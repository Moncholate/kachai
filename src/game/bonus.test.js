import { LEXICO } from './bonusLexico.js'
import { describe, it, expect } from 'vitest'
import { preguntaDelBonus, multiplicadores, metaDelCurso, metasLogradas, puntosBonus, CATEGORIAS, explicarError, nuevaPalabra, categoriasPara, AMBIGUAS, ritmoBonus, horasDoradas, BONUS_SEG } from './bonus.js'

describe('ronda bonus', () => {
  it('burbujas doradas: raras, más para el bonus ×2/×3, dentro de la ronda y en orden', () => {
    expect(horasDoradas(1)).toHaveLength(1)
    expect(horasDoradas(2)).toHaveLength(2)
    expect(horasDoradas(3)).toHaveLength(3)
    for (const r of [() => 0, () => 0.999]) {
      const h = horasDoradas(3, r)
      for (const s of h) { expect(s).toBeGreaterThanOrEqual(5); expect(s).toBeLessThanOrEqual(BONUS_SEG - 5) }
      expect([...h].sort((a, b) => a - b)).toEqual(h)
    }
  })

  it('aparece a la mitad, o mitad + 1 si es impar', () => {
    expect(preguntaDelBonus(10)).toBe(4)   // tras la 5.ª
    expect(preguntaDelBonus(9)).toBe(4)    // tras la 5.ª
    expect(preguntaDelBonus(4)).toBe(1)
    expect(preguntaDelBonus(3)).toBe(null) // muy corta: sin ronda
    expect(preguntaDelBonus(undefined)).toBe(null)
  })

  it('bonus oculto: ×1 mitad de arriba, ×2 tercer cuarto, ×3 último cuarto', () => {
    const m = multiplicadores(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])
    expect([m.a, m.d, m.e, m.f, m.g, m.h]).toEqual([1, 1, 2, 2, 3, 3])
    expect(multiplicadores(['solo'])).toEqual({ solo: 1 })
  })

  it('la meta crece con el curso y las 3 metas se marcan en tercios', () => {
    expect(metaDelCurso(1)).toBe(12)
    expect(metaDelCurso(30)).toBe(300)
    expect(ritmoBonus(0)).toEqual({ frecuencia: 1, caida: 1 })
    expect(ritmoBonus(1).frecuencia).toBeCloseTo(1.45)
    expect(ritmoBonus(5)).toEqual(ritmoBonus(1))
    expect(metasLogradas(0, 30)).toBe(0)
    expect(metasLogradas(10, 30)).toBe(1)
    expect(metasLogradas(20, 30)).toBe(2)
    expect(metasLogradas(31, 30)).toBe(3)
  })

  it('30 puntos por burbuja, por el bonus, nunca negativo', () => {
    expect(puntosBonus(10, 3)).toBe(900)
    expect(puntosBonus(-4, 2)).toBe(0)
  })

  it('ninguna palabra está a la vez en el sí y en el no de una categoría', () => {
    for (const [id, c] of Object.entries(CATEGORIAS)) {
      const no = new Set(c.no.map(([w]) => w))
      for (const w of c.si) expect(no.has(w), `${id}: ${w}`).toBe(false)
    }
  })

  it('explica el error en el idioma de la sala', () => {
    expect(explicarError('irregulares', 'played', 'regular', 'es')).toContain('regular')
    expect(explicarError('colores', 'table', 'noun', 'en')).toBe('<b>table</b> is a noun, not a color.')
    expect(explicarError('frecuencia', 'quickly', 'adverb', 'es')).toContain('frecuencia')
  })

  it('no repite palabras que ya están en pantalla', () => {
    const vistas = new Set(CATEGORIAS.colores.si)
    let r = 0; const rand = () => ((r = (r * 9301 + 49297) % 233280) / 233280)
    for (let i = 0; i < 20; i++) {
      const w = nuevaPalabra('colores', vistas, rand)
      if (w.correcta) continue
      expect(vistas.has(w.palabra)).toBe(false)
    }
  })
})

describe('categorías léxicas por nivel', () => {
  const todas = Object.entries(CATEGORIAS)
  it('cada categoría tiene palabras de sobra y trampas con explicación', () => {
    for (const [id, c] of todas) {
      expect(c.si.length, id).toBeGreaterThanOrEqual(7)   // los días de la semana son 7
      expect(c.no.length, id).toBeGreaterThanOrEqual(7)
      for (const w of c.no) {
        const [palabra, tipo] = Array.isArray(w) ? w : [w, null]
        expect(explicarError(id, palabra, tipo, 'es'), `${id}/${palabra}`).toMatch(/<b>.+<\/b> (es|is)/)
        expect(explicarError(id, palabra, tipo, 'en'), `${id}/${palabra}`).not.toMatch(/undefined/)
      }
    }
  })
  it('una trampa nunca es del grupo (sin importar mayúsculas)', () => {
    for (const [id, c] of todas) {
      const si = new Set(c.si.map((w) => w.toLowerCase()))
      for (const w of c.no) expect(si.has((Array.isArray(w) ? w[0] : w).toLowerCase()), `${id}/${w}`).toBe(false)
    }
  })
  it('las palabras ambiguas no se usan de trampa', () => {
    for (const c of LEXICO) for (const w of c.no) expect(AMBIGUAS.has((Array.isArray(w) ? w[0] : w).toLowerCase()), `${c.id}/${w}`).toBe(false)
  })
  it('las trampas de un grupo no incluyen palabras de otro nivel más alto', () => {
    for (const [id, c] of Object.entries(CATEGORIAS)) {
      if (!c.contra) continue
      for (const o of c.contra) expect(CATEGORIAS[o], `${id}→${o}`).toBeTruthy()
    }
  })
  it('el selector ofrece algo en todos los cursos y EA, y lo nuevo va primero', () => {
    for (const curso of ['basico1', 'basico2', 'basicoInt', 'elemental1', 'elemental2', 'elementalInt', 'intermedio1', 'intermedio2', 'intermedioInt']) {
      for (const ea of [0, 1]) {
        const r = categoriasPara(curso, ea)
        expect(r.nuevas.length + r.antes.length, `${curso} EA${ea + 1}`).toBeGreaterThan(0)
        for (const id of [...r.nuevas, ...r.antes]) expect(CATEGORIAS[id], id).toBeTruthy()
      }
    }
    expect(categoriasPara('basico2', 0).nuevas).toEqual(['actividades', 'clima'])
    expect(categoriasPara('intermedioInt', 1).nuevas).toContain('animales')
    expect(categoriasPara('basico1', 0).antes).toEqual([])
    expect(categoriasPara('elemental1', 1).antes).toContain('irregulares')
    expect(categoriasPara(undefined, 0).antes.length).toBeGreaterThan(30)
  })
  it('do/make, -ed/-ing, países/nacionalidades se confunden entre sí', () => {
    expect(CATEGORIAS.hacerDo.no.every(([, t]) => t === 'lex:hacerMake')).toBe(true)
    expect(explicarError('hacerDo', 'bed', 'lex:hacerMake', 'en')).toContain('goes with MAKE')
    expect(explicarError('paises', 'Spanish', 'lex:nacionalidades', 'es')).toContain('una nacionalidad')
  })
})
