import { describe, expect, it } from 'vitest'
import { HD_POR_ID } from './heroesHD.js'
import { PARTES, alAzar, colorMuestra, materialesDe, personaliza } from './personaliza.js'

const heroe = (id) => ({ id, hd: HD_POR_ID[id] })

describe('personalización', () => {
  it('sin elección (o con opciones que no existen) queda el mismo personaje', () => {
    const h = heroe('edith')
    expect(personaliza(h, null)).toBe(h)
    expect(personaliza(h, {})).toBe(h)
    expect(personaliza(h, { piel: 'verde', pelo: 'naranjo' })).toBe(h)   // naranjo es pelaje de gata, no pelo
  })

  it('la misma elección da siempre el mismo objeto (las escenas no se reinician)', () => {
    const h = heroe('kenny')
    expect(personaliza(h, { pelo: 'rubio' })).toBe(personaliza(h, { pelo: 'rubio' }))
    expect(personaliza(h, { pelo: 'rubio' }).variante).toBe('kenny||rubio||')
  })

  it('cambia solo las letras del material: el sombrero de Malala no cambia con el pelo', () => {
    const h = heroe('malala'), p = personaliza(h, { pelo: 'rubio' })
    expect(p.hd.pal.H).toBe(h.hd.pal.H)
    expect(p.hd.pal.L).not.toBe(h.hd.pal.L)
  })

  it('el pelo nunca queda del color de la piel, y sus tonos no se repiten (los rulos de Edith)', () => {
    const p = personaliza(heroe('edith'), { pelo: 'rubio' }).hd   // piel tostada (F2A65E), como la base del rubio
    const tr = (v) => ((p.mapa && p.mapa[v.toUpperCase()]) || v).toUpperCase()
    expect(p.pal.H).not.toBe(tr(p.pal.S))
    expect(p.pal.H).not.toBe(p.pal.h)
  })

  it('ninguna opción usa el color del contorno (la racha lo reconoce por ese color)', () => {
    for (const partes of Object.values(PARTES)) for (const m of Object.values(partes))
      for (const r of Object.values(m.opciones)) if (Array.isArray(r)) expect(r).not.toContain('#272736')
  })

  it('al azar solo elige opciones que existen, y cada círculo tiene color', () => {
    for (const id of Object.keys(PARTES)) {
      const c = alAzar(id)
      for (const [m, op] of Object.entries(c)) expect(PARTES[id][m].opciones[op]).toBeTruthy()
      for (const [m, ops] of materialesDe(id)) {
        expect(colorMuestra(heroe(id), m, null)).toBeTruthy()
        ops.forEach((op) => expect(colorMuestra(heroe(id), m, op)).toBeTruthy())
      }
    }
  })
})
