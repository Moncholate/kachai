import { describe, expect, it } from 'vitest'
import { FONDO_POR_TEMA, NOMBRES_ESCENARIOS, TEMAS_CON_FONDO, escenarioDe } from './fondos.js'
import { answeringTrack, finalTrack } from '../host/sound.js'

describe('escenarios de los duelos', () => {
  it('cada tema de juego tiene su propio escenario, y todos existen', () => {
    const usados = TEMAS_CON_FONDO.map((t) => FONDO_POR_TEMA[t])
    usados.forEach((e) => expect(NOMBRES_ESCENARIOS).toContain(e))
    expect(new Set(usados).size).toBe(TEMAS_CON_FONDO.length)
  })

  it('el duelo usa el escenario de la canción que sonó en esa pregunta', () => {
    for (const round of [0, 1, 2]) {
      for (let q = -1; q < 9; q++) {   // -1: la de práctica
        const state = { phase: 'leaderboard', round, qIndex: q, total: 10, practice: q < 0 }
        expect(escenarioDe(state)).toBe(FONDO_POR_TEMA[answeringTrack(round, q)])
      }
      expect(escenarioDe({ phase: 'leaderboard', round, qIndex: 9, total: 10 })).toBe(FONDO_POR_TEMA[finalTrack(round)])
      expect(escenarioDe({ phase: 'end', round, qIndex: 9, total: 10 })).toBe(FONDO_POR_TEMA[finalTrack(round)])
    }
  })

  it('sin estado, el bosque', () => {
    expect(escenarioDe(null)).toBe('bosque')
  })
})
