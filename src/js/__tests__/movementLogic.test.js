import GameController from '../GameController.js';
import GamePlay from '../GamePlay.js';
import { Bowman } from '../characters/index.js';
import PositionedCharacter from '../PositionedCharacter.js';

// Mock для GamePlay
const mockGamePlay = {
  drawUi: jest.fn(),
  redrawPositions: jest.fn(),
  addCellClickListener: jest.fn(),
  addCellEnterListener: jest.fn(),
  addCellLeaveListener: jest.fn(),
  showCellTooltip: jest.fn(),
  hideCellTooltip: jest.fn(),
  setCursor: jest.fn(),
  selectCell: jest.fn(),
  deselectCell: jest.fn(),
  showError: jest.fn(),
};

describe('Movement Logic', () => {
  let gameController;

  beforeEach(() => {
    gameController = new GameController(mockGamePlay, {});
    
    // Создаем тестового персонажа
    const bowman = new Bowman(1);
    gameController.playerPositions = [new PositionedCharacter(bowman, 10)];
    gameController.boardSize = 8;
    
    // Сбрасываем моки
    jest.clearAllMocks();
  });

  test('should move character to valid position', () => {
    // Выбираем персонажа
    gameController.selectCharacter(gameController.playerPositions[0].character, 10);
    
    // Перемещаем на валидную позицию (соседнюю клетку)
    gameController.moveCharacter(11);
    
    expect(gameController.playerPositions[0].position).toBe(11);
    expect(mockGamePlay.redrawPositions).toHaveBeenCalled();
    expect(mockGamePlay.deselectCell).toHaveBeenCalledWith(10);
  });

  test('should clear highlights after movement', () => {
    gameController.movementCells = [11, 12];
    gameController.attackCells = [18];
    
    gameController.selectCharacter(gameController.playerPositions[0].character, 10);
    gameController.moveCharacter(11);
    
    expect(gameController.movementCells).toHaveLength(0);
    expect(gameController.attackCells).toHaveLength(0);
  });

  test('should switch turn after movement', () => {
    gameController.selectCharacter(gameController.playerPositions[0].character, 10);
    
    const initialTurn = gameController.gameState.currentTurn;
    gameController.moveCharacter(11);
    
    expect(gameController.gameState.currentTurn).not.toBe(initialTurn);
  });

  test('should not move if no character selected', () => {
    gameController.moveCharacter(11);
    
    expect(mockGamePlay.showError).toHaveBeenCalledWith('Персонаж не выбран!');
    expect(gameController.playerPositions[0].position).toBe(10); // позиция не изменилась
  });
});
