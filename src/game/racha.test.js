import { describe, expect, it } from 'vitest'
import { conRacha, nivelRacha } from './racha.js'

describe('distintivo de racha', () => {
  it('niveles: arma brillante desde 3, aura desde 5, entero dorado desde 8', () => {
    expect([0, 2, 3, 4, 5, 7, 8, 15].map(nivelRacha)).toEqual([0, 0, 1, 1, 2, 2, 3, 3])
    expect(nivelRacha(undefined)).toBe(0)
  })

  it('sin racha queda el mismo personaje; con racha, siempre el mismo objeto (las escenas no se reinician)', () => {
    const heroe = { id: 'x', hd: { contorno: '#272736' } }
    expect(conRacha(heroe, 2)).toBe(heroe)
    expect(conRacha(heroe, 5).hd.racha).toBe(2)
    expect(conRacha(heroe, 6)).toBe(conRacha(heroe, 5))
  })
})
