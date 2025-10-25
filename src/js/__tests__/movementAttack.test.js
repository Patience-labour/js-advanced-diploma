import { getMovementCells, getAttackCells, getDistance, getMoveRange, getAttackRange } from '../utils.js';

describe('Movement and Attack', () => {
  const boardSize = 8;

  describe('getDistance', () => {
    test('should calculate Chebyshev distance correctly', () => {
      expect(getDistance(0, 0, boardSize)).toBe(0);
      expect(getDistance(0, 1, boardSize)).toBe(1);
      expect(getDistance(0, 8, boardSize)).toBe(1);
      expect(getDistance(0, 9, boardSize)).toBe(1);
      expect(getDistance(0, 18, boardSize)).toBe(2);
      expect(getDistance(35, 28, boardSize)).toBe(1);
    });
  });

  describe('getMovementCells', () => {
    test('should return correct movement cells for center position', () => {
      const cells = getMovementCells(27, 1, boardSize);
      expect(cells).toHaveLength(8);
      expect(cells).toEqual(expect.arrayContaining([18, 19, 20, 26, 28, 34, 35, 36]));
    });

    test('should return correct movement cells for corner position', () => {
      const cells = getMovementCells(0, 2, boardSize);
      expect(cells).toHaveLength(6);
      expect(cells).toEqual(expect.arrayContaining([1, 2, 8, 9, 16, 17]));
    });

    test('should respect movement range', () => {
      const cells = getMovementCells(35, 2, boardSize);
      cells.forEach(cell => {
        expect(getDistance(35, cell, boardSize)).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('getAttackCells', () => {
    test('should return correct attack cells', () => {
      const cells = getAttackCells(0, 1, boardSize);
      expect(cells).toHaveLength(3);
      expect(cells).toEqual(expect.arrayContaining([1, 8, 9]));
    });

    test('should respect attack range', () => {
      const cells = getAttackCells(35, 3, boardSize);
      cells.forEach(cell => {
        expect(getDistance(35, cell, boardSize)).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('getMoveRange', () => {
    test('should return correct move ranges', () => {
      expect(getMoveRange('swordsman')).toBe(4);
      expect(getMoveRange('bowman')).toBe(2);
      expect(getMoveRange('magician')).toBe(1);
      expect(getMoveRange('vampire')).toBe(2);
      expect(getMoveRange('undead')).toBe(4);
      expect(getMoveRange('daemon')).toBe(1);
    });
  });

  describe('getAttackRange', () => {
    test('should return correct attack ranges', () => {
      expect(getAttackRange('swordsman')).toBe(1);
      expect(getAttackRange('bowman')).toBe(2);
      expect(getAttackRange('magician')).toBe(4);
      expect(getAttackRange('vampire')).toBe(2);
      expect(getAttackRange('undead')).toBe(1);
      expect(getAttackRange('daemon')).toBe(4);
    });
  });
});
