import { characterGenerator } from '../generators.js';
import { Bowman, Swordsman, Magician } from '../characters/index.js';

describe('characterGenerator', () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 3;

  test('should generate infinite sequence of characters', () => {
    const generator = characterGenerator(allowedTypes, maxLevel);
    
    const characters = [
      generator.next().value,
      generator.next().value,
      generator.next().value,
      generator.next().value,
      generator.next().value,
    ];

    characters.forEach(character => {
      expect(character).toBeDefined();
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(maxLevel);
    });

    expect(generator.next().value).toBeDefined();
    expect(generator.next().value).toBeDefined();
  });

  test('should generate characters only from allowedTypes', () => {
    const generator = characterGenerator(allowedTypes, maxLevel);
    const allowedTypeNames = allowedTypes.map(Type => new Type(1).type);
    
    for (let i = 0; i < 10; i++) {
      const character = generator.next().value;
      expect(allowedTypeNames).toContain(character.type);
    }
  });

  test('should respect maxLevel parameter', () => {
    const testMaxLevel = 4;
    const generator = characterGenerator(allowedTypes, testMaxLevel);
    
    const levels = new Set();
    for (let i = 0; i < 20; i++) {
      const character = generator.next().value;
      levels.add(character.level);
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(testMaxLevel);
    }
    
    expect(levels.size).toBeGreaterThan(1);
  });
});