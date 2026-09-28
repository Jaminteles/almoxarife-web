import { podeEditar, podeVer } from './auth/permissions';

test('aplica a permissão existente de equipamentos', () => {
  expect(podeVer('CONSULTA', 'equipamentos')).toBe(true);
  expect(podeEditar('CONSULTA', 'equipamentos')).toBe(false);
  expect(podeEditar('ALMOXARIFE', 'equipamentos')).toBe(true);
});
