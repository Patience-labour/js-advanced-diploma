import { generateTeam } from '../generators.js';
import { Bowman, Swordsman, Magician, Vampire } from '../characters/index.js';
import Team from '../Team.js';

describe('generateTeam', () => {
  const allowedTypes = [Bowman, Swordsman, Magician, Vampire];
  
  test('should create team with correct number of characters', () => {
    const characterCount = 5;
    const team = generateTeam(allowedTypes, 3, characterCount);
    
    expect(team).toBeInstanceOf(Team);
    expect(team.characters).toHaveLength(characterCount);
  });

  test('should create characters with levels in correct range', () => {
    const maxLevel = 4;
    const characterCount = 8;
    const team = generateTeam(allowedTypes, maxLevel, characterCount);
    
    team.characters.forEach(character => {
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(maxLevel);
    });

    const levels = team.characters.map(char => char.level);
    const uniqueLevels = new Set(levels);
    expect(uniqueLevels.size).toBeGreaterThan(1);
  });

  test('should create characters only from allowed types', () => {
    const characterCount = 10;
    const team = generateTeam(allowedTypes, 2, characterCount);
    const allowedTypeNames = allowedTypes.map(Type => new Type(1).type);
    
    team.characters.forEach(character => {
      expect(allowedTypeNames).toContain(character.type);
    });
  });

  test('should work with different parameters', () => {
    const team1 = generateTeam([Bowman, Swordsman], 5, 10);
    expect(team1.characters).toHaveLength(10);
    team1.characters.forEach(char => {
      expect(char.level).toBeLessThanOrEqual(5);
    });

    const team2 = generateTeam([Magician], 1, 2);
    expect(team2.characters).toHaveLength(2);
    team2.characters.forEach(char => {
      expect(char.level).toBe(1);
    });
  });
});