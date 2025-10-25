import Character from '../Character.js';
import { Bowman, Swordsman, Magician, Vampire, Undead, Daemon } from '../characters/index.js';

describe('Character Class', () => {
  test('should throw error when creating Character instance directly', () => {
    expect(() => {
      new Character(1);
    }).toThrow('Cannot create instance of abstract Character class');
  });

  test('should not throw error when creating inherited class instances', () => {
    expect(() => new Bowman(1)).not.toThrow();
    expect(() => new Swordsman(1)).not.toThrow();
    expect(() => new Magician(1)).not.toThrow();
    expect(() => new Vampire(1)).not.toThrow();
    expect(() => new Undead(1)).not.toThrow();
    expect(() => new Daemon(1)).not.toThrow();
  });
});
