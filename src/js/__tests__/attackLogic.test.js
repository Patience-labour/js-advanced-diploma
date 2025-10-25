import GameController from '../GameController.js';
import GamePlay from '../GamePlay.js';
import { Bowman, Vampire } from '../characters/index.js';
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
  showDamage: jest.fn().mockResolvedValue(), // Mock для showDamage
};

describe('Attack Logic', () => {
  let gameController;

  beforeEach(() => {
    gameController = new GameController(mockGamePlay, {});
    
    // Создаем тестовых персонажей
    const bowman = new Bowman(1); // attack: 25, defence: 25
    const vampire = new Vampire(1); // attack: 25, defence: 25
    
    gameController.playerPositions = [new PositionedCharacter(bowman, 10)];
    gameController.enemyPositions = [new PositionedCharacter(vampire, 11)];
    gameController.boardSize = 8;
    
    // Сбрасываем моки
    jest.clearAllMocks();
  });

  test('should calculate damage correctly', () => {
    const bowman = gameController.playerPositions[0].character;
    const vampire = gameController.enemyPositions[0].character;
    
    const damage = gameController.calculateDamage(bowman, vampire);
    
    // 25 - 25 = 0, но минимальный урон 25 * 0.1 = 2.5
    expect(damage).toBe(2.5);
  });

  test('should apply damage to target', async () => {
    const bowman = gameController.playerPositions[0].character;
    const vampire = gameController.enemyPositions[0].character;
    const initialHealth = vampire.health;
    
    gameController.selectCharacter(bowman, 10);
    await gameController.attackCharacter(11, gameController.enemyPositions[0]);
    
    expect(vampire.health).toBe(initialHealth - 2.5);
    expect(mockGamePlay.showDamage).toHaveBeenCalledWith(11, 2.5);
  });

  test('should remove dead character', async () => {
    const bowman = gameController.playerPositions[0].character;
    const vampire = gameController.enemyPositions[0].character;
    
    // Устанавливаем здоровье врага меньше урона
    vampire.health = 2;
    
    gameController.selectCharacter(bowman, 10);
    await gameController.attackCharacter(11, gameController.enemyPositions[0]);
    
    expect(gameController.enemyPositions).toHaveLength(0);
    expect(vampire.health).toBe(0);
  });

  test('should switch turn after attack', async () => {
    const bowman = gameController.playerPositions[0].character;
    
    gameController.selectCharacter(bowman, 10);
    const initialTurn = gameController.gameState.currentTurn;
    
    await gameController.attackCharacter(11, gameController.enemyPositions[0]);
    
    expect(gameController.gameState.currentTurn).not.toBe(initialTurn);
  });

  test('should clear highlights after attack', async () => {
    const bowman = gameController.playerPositions[0].character;
    
    gameController.selectCharacter(bowman, 10);
    gameController.movementCells = [12];
    gameController.attackCells = [11];
    
    await gameController.attackCharacter(11, gameController.enemyPositions[0]);
    
    expect(gameController.movementCells).toHaveLength(0);
    expect(gameController.attackCells).toHaveLength(0);
  });
});
