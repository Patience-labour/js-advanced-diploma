import { calcTileType } from '../utils';

describe('calcTileType', () => {
  const boardSize = 8;

  test('should return correct tile types for corners', () => {
    expect(calcTileType(0, boardSize)).toBe('top-left');
    expect(calcTileType(7, boardSize)).toBe('top-right');
    expect(calcTileType(56, boardSize)).toBe('bottom-left');
    expect(calcTileType(63, boardSize)).toBe('bottom-right');
  });

  test('should return correct tile types for top row', () => {
    expect(calcTileType(1, boardSize)).toBe('top');
    expect(calcTileType(2, boardSize)).toBe('top');
    expect(calcTileType(5, boardSize)).toBe('top');
    expect(calcTileType(6, boardSize)).toBe('top');
  });

  test('should return correct tile types for bottom row', () => {
    expect(calcTileType(57, boardSize)).toBe('bottom');
    expect(calcTileType(58, boardSize)).toBe('bottom');
    expect(calcTileType(61, boardSize)).toBe('bottom');
    expect(calcTileType(62, boardSize)).toBe('bottom');
  });

  test('should return correct tile types for left column', () => {
    expect(calcTileType(8, boardSize)).toBe('left');
    expect(calcTileType(16, boardSize)).toBe('left');
    expect(calcTileType(40, boardSize)).toBe('left');
    expect(calcTileType(48, boardSize)).toBe('left');
  });

  test('should return correct tile types for right column', () => {
    expect(calcTileType(15, boardSize)).toBe('right');
    expect(calcTileType(23, boardSize)).toBe('right');
    expect(calcTileType(47, boardSize)).toBe('right');
    expect(calcTileType(55, boardSize)).toBe('right');
  });

  test('should return center for inner tiles', () => {
    expect(calcTileType(9, boardSize)).toBe('center');
    expect(calcTileType(18, boardSize)).toBe('center');
    expect(calcTileType(45, boardSize)).toBe('center');
    expect(calcTileType(54, boardSize)).toBe('center');
  });

  test('should work with different board sizes', () => {
    expect(calcTileType(0, 5)).toBe('top-left');
    expect(calcTileType(4, 5)).toBe('top-right');
    expect(calcTileType(20, 5)).toBe('bottom-right');
    expect(calcTileType(12, 5)).toBe('center');
  });
});