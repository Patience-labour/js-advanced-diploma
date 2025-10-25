import { characterInfo } from '../utils.js';

describe('characterInfo', () => {
  test('should format character info correctly', () => {
    const character = {
      level: 1,
      attack: 25,
      defence: 25,
      health: 50
    };

    const result = characterInfo(character);
    expect(result).toBe('🎖1 ⚔25 🛡25 ❤50');
  });

  test('should handle different character stats', () => {
    const character = {
      level: 3,
      attack: 40,
      defence: 10,
      health: 80
    };

    const result = characterInfo(character);
    expect(result).toBe('🎖3 ⚔40 🛡10 ❤80');
  });

  test('should return empty string for invalid input', () => {
    expect(characterInfo(null)).toBe('');
    expect(characterInfo(undefined)).toBe('');
    expect(characterInfo('invalid')).toBe('');
    expect(characterInfo(123)).toBe('');
  });

  test('should handle missing properties', () => {
    const character = {
      level: 2,
      defence: 30,
      health: 60
    };

    const result = characterInfo(character);
    expect(result).toContain('🎖2');
    expect(result).toContain('🛡30');
    expect(result).toContain('❤60');
  });

  test('should work with zero values', () => {
    const character = {
      level: 0,
      attack: 0,
      defence: 0,
      health: 0
    };

    const result = characterInfo(character);
    expect(result).toBe('🎖0 ⚔0 🛡0 ❤0');
  });
});