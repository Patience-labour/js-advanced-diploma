import { MOVEMENT_RANGES, ATTACK_RANGES } from './constants.js';

/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;

  if (row === 0) {
    if (col === 0) return 'top-left';
    if (col === boardSize - 1) return 'top-right';
    return 'top';
  }

  if (row === boardSize - 1) {
    if (col === 0) return 'bottom-left';
    if (col === boardSize - 1) return 'bottom-right';
    return 'bottom';
  }

  if (col === 0) return 'left';
  if (col === boardSize - 1) return 'right';

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function characterInfo(character) {
  if (!character || typeof character !== 'object') {
    return '';
  }

  const { level, attack, defence, health } = character;

  return `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`;
}

export function getMovementCells(position, moveRange, boardSize) {
  const cells = [];
  const row = Math.floor(position / boardSize);
  const col = position % boardSize;

  for (let r = Math.max(0, row - moveRange); r <= Math.min(boardSize - 1, row + moveRange); r++) {
    for (let c = Math.max(0, col - moveRange); c <= Math.min(boardSize - 1, col + moveRange); c++) {
      const newPosition = r * boardSize + c;

      if (newPosition !== position && getDistance(position, newPosition, boardSize) <= moveRange) {
        cells.push(newPosition);
      }
    }
  }

  return cells;
}

export function getAttackCells(position, attackRange, boardSize) {
  const cells = [];
  const row = Math.floor(position / boardSize);
  const col = position % boardSize;

  for (let r = Math.max(0, row - attackRange); r <= Math.min(boardSize - 1, row + attackRange); r++) {
    for (let c = Math.max(0, col - attackRange); c <= Math.min(boardSize - 1, col + attackRange); c++) {
      const targetPosition = r * boardSize + c;

      if (targetPosition !== position && getDistance(position, targetPosition, boardSize) <= attackRange) {
        cells.push(targetPosition);
      }
    }
  }

  return cells;
}

export function getDistance(from, to, boardSize) {
  const fromRow = Math.floor(from / boardSize);
  const fromCol = from % boardSize;
  const toRow = Math.floor(to / boardSize);
  const toCol = to % boardSize;

  return Math.max(Math.abs(fromRow - toRow), Math.abs(fromCol - toCol));
}

export function getMoveRange(characterType) {
  return MOVEMENT_RANGES[characterType] || 0;
}

export function getAttackRange(characterType) {
  return ATTACK_RANGES[characterType] || 0;
}