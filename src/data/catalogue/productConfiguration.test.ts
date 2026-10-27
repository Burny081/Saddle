import { describe, expect, test } from 'vitest';
import { catalogueProducts } from './index';
import { getProductConfigurationFields } from './productConfiguration';

describe('getProductConfigurationFields', () => {
  test('offers protection choices relevant to circuit protection', () => {
    const product = catalogueProducts.find((item) => item.categorie === 'Protection et sécurité électrique')!;

    expect(getProductConfigurationFields(product).map(({ key }) => key)).toEqual(
      expect.arrayContaining(['poles', 'ratedCurrent', 'voltage', 'ipRequirement']),
    );
  });

  test('offers solar choices relevant to energy autonomy', () => {
    const product = catalogueProducts.find((item) => item.categorie === 'Solaire, stockage et alimentation de secours')!;

    expect(getProductConfigurationFields(product).map(({ key }) => key)).toEqual(
      expect.arrayContaining(['ratedPower', 'systemVoltage', 'autonomy']),
    );
  });
});
