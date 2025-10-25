import GameController from '../GameController.js';
import GamePlay from '../GamePlay.js';
import { Bowman, Swordsman, Vampire, Undead } from '../characters/index.js';
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
  showDamage: jest.fn().mockResolvedValue(),
};

describe('Computer AI', () => {
  let gameController;

  beforeEach(() => {
    gameController = new GameController(mockGamePlay, {});
    gameController.boardSize = 8;
    jest.clearAllMocks();
  });

  test('should calculate attack score correctly', () => {
    const vampire = new Vampire(1); // attack: 25, defence: 25
    const bowman = new Bowman(1); // attack: 25, defence: 25
    
    // Устанавливаем низкое здоровье лучнику (добивание)
    bowman.health = 5;
    
    const score = gameController.calculateAttackScore(vampire, bowman);
    
    // Должен быть бонус за добивание + базовый урон
    expect(score).toBeGreaterThan(0);
  });

  test('should find best attack target', () => {
    const vampire = new Vampire(1);
    const weakBowman = new Bowman(1);
    const strongSwordsman = new Swordsman(1);
    
    weakBowman.health = 10; // Слабый лучник
    strongSwordsman.health = 50; // Сильный мечник
    
    gameController.playerPositions = [
      new PositionedCharacter(weakBowman, 10),
      new PositionedCharacter(strongSwordsman, 11)
    ];
    
    const attackCells = [10, 11];
    const bestTarget = gameController.findBestAttackTarget(attackCells, vampire);
    
    // Должен выбрать слабого лучника для добивания
    expect(bestTarget.target).toBe(weakBowman);
  });

  test('should find move-and-attack action when needed', () => {
    const vampire = new Vampire(1);
    const bowman = new Bowman(1);
    
    // Размещаем врага далеко от игрока
    gameController.enemyPositions = [new PositionedCharacter(vampire, 60)];
    gameController.playerPositions = [new PositionedCharacter(bowman, 10)];
    
    const action = gameController.findBestAction(gameController.enemyPositions[0]);
    
    // Должен найти действие перемещения и атаки
    expect(action).toBeDefined();
    expect(action.type).toBe('move-and-attack');
  });

  test('should prefer attack over move when possible', () => {
    const vampire = new Vampire(1);
    const bowman = new Bowman(1);
    
    // Размещаем врага рядом с игроком
    gameController.enemyPositions = [new PositionedCharacter(vampire, 9)];
    gameController.playerPositions = [new PositionedCharacter(bowman, 10)];
    
    const action = gameController.findBestAction(gameController.enemyPositions[0]);
    
    // Должен выбрать прямую атаку без перемещения
    expect(action.type).toBe('attack');
  });
});
