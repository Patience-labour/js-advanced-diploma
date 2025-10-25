import { Bowman, Swordsman, Magician, Vampire, Undead, Daemon } from '../characters/index.js';

describe('Characters Level 1', () => {
  const testCases = [
    { Class: Bowman, expected: { attack: 25, defence: 25, health: 50, type: 'bowman' } },
    { Class: Swordsman, expected: { attack: 40, defence: 10, health: 50, type: 'swordsman' } },
    { Class: Magician, expected: { attack: 10, defence: 40, health: 50, type: 'magician' } },
    { Class: Vampire, expected: { attack: 25, defence: 25, health: 50, type: 'vampire' } },
    { Class: Undead, expected: { attack: 40, defence: 10, health: 50, type: 'undead' } },
    { Class: Daemon, expected: { attack: 10, defence: 10, health: 50, type: 'daemon' } },
  ];

  testCases.forEach(({ Class, expected }) => {
    test(`${Class.name} should have correct level 1 stats`, () => {
      const character = new Class(1);
      
      expect(character.level).toBe(1);
      expect(character.attack).toBe(expected.attack);
      expect(character.defence).toBe(expected.defence);
      expect(character.health).toBe(expected.health);
      expect(character.type).toBe(expected.type);
    });
  });
});