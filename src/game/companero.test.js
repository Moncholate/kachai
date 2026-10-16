import { describe, expect, it } from 'vitest'
import { momentoDe } from './companero.js'

describe('el momento del compañero tras cada pregunta', () => {
  it('al acertar celebra, y sube la racha justo al llegar a 3, 5 u 8', () => {
    expect(momentoDe('right', 1)).toBe('correcta')
    expect(momentoDe('right', 3)).toBe('sube')
    expect(momentoDe('right', 4)).toBe('correcta')
    expect(momentoDe('right', 5)).toBe('sube')
    expect(momentoDe('right', 8)).toBe('sube')
    expect(momentoDe('right', 9)).toBe('correcta')
  })
  it('parcial, incorrecta y sin respuesta tienen su propio gesto', () => {
    expect(momentoDe('partial', 0)).toBe('parcial')
    expect(momentoDe('wrong', 0)).toBe('incorrecta')
    expect(momentoDe('none', 0)).toBe('sinRespuesta')
  })
})
