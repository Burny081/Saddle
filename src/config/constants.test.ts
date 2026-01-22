import { describe, it, expect } from 'vitest';
import {
  generateId,
  generateShortId,
  formatCurrency,
  safeJsonParse,
  COMPANY,
  VALIDATION,
} from './constants';

describe('constants', () => {
  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateShortId', () => {
    it('should generate a short ID', () => {
      const id = generateShortId();
      expect(id).toHaveLength(8);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with default locale', () => {
      const formatted = formatCurrency(1000);
      expect(formatted).toContain('1');
      expect(formatted).toContain('000');
      expect(formatted).toContain('FCFA');
    });

    it('should format currency with FCFA suffix', () => {
      const formatted = formatCurrency(1000);
      expect(formatted).toContain('FCFA');
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"name": "test"}', {});
      expect(result).toEqual({ name: 'test' });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { default: true };
      const result = safeJsonParse('invalid json', fallback);
      expect(result).toBe(fallback);
    });

    it('should return fallback for null input', () => {
      const fallback = { default: true };
      const result = safeJsonParse(null, fallback);
      expect(result).toBe(fallback);
    });
  });

  describe('COMPANY', () => {
    it('should have required company information', () => {
      expect(COMPANY.name).toBeDefined();
      expect(COMPANY.email).toBeDefined();
      expect(COMPANY.phone).toBeDefined();
      expect(COMPANY.address).toBeDefined();
    });
  });

  describe('VALIDATION', () => {
    it('should validate correct email format', () => {
      expect(VALIDATION.email.test('test@example.com')).toBe(true);
      expect(VALIDATION.email.test('invalid-email')).toBe(false);
    });

    it('should validate correct phone format', () => {
      expect(VALIDATION.phone.test('+237600000000')).toBe(true);
      expect(VALIDATION.phone.test('123-456-7890')).toBe(true);
    });
  });
});
