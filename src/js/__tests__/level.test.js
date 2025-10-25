import Character from '../Character.js';
import { Bowman, Vampire } from '../characters/index.js';
import GameController from '../GameController.js';
import GamePlay from '../GamePlay.js';

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
  showMessage: jest.fn(),
};

describe('Level System', () => {
  describe('Character Level Up', () => {
    test('should create character with correct level', () => {
      const bowman = new Bowman(3);
      expect(bowman.level).toBe(3);
    });

    test('should increase health correctly on level up', () => {
      const bowman = new Bowman(1);
      bowman.health = 10; // Низкое здоровье
      
      bowman.levelUp();
      
      // Здоровье должно стать: уровень(2) + 80 = 82
      expect(bowman.health).toBe(82);
      expect(bowman.level).toBe(2);
    });

    test('should cap health at 100', () => {
      const bowman = new Bowman(1);
      bowman.health = 90; // Высокое здоровье
      
      bowman.levelUp();
      
      // Здоровье не должно превышать 100
      expect(bowman.health).toBe(100);
    });

    test('should improve stats based on remaining health', () => {
      const vampire = new Vampire(1);
      const initialAttack = vampire.attack;
      const initialDefence = vampire.defence;
      
      vampire.health = 50; // 50% здоровья
      vampire.levelUp();
      
      // Статы должны улучшиться на ~30% (80 + 50)/100 = 1.3
      expect(vampire.attack).toBeGreaterThan(initialAttack);
      expect(vampire.defence).toBeGreaterThan(initialDefence);
    });
  });

  describe('Game Level Progression', () => {
    let gameController;

    beforeEach(() => {
      gameController = new GameController(mockGamePlay, {});
      jest.clearAllMocks();
    });

    test('should level up surviving characters after victory', () => {
      const bowman = new Bowman(1);
      gameController.playerPositions = [{ character: bowman, position: 10 }];
      gameController.enemyPositions = []; // Все враги мертвы
      
      gameController.levelUpSurvivingCharacters();
      
      expect(bowman.level).toBe(2);
    });

    test('should advance to next level after victory', async () => {
      gameController.currentLevel = 1;
      gameController.playerPositions = [{ character: new Bowman(1), position: 10 }];
      gameController.enemyPositions = [];
      
      await gameController.handlePlayerVictory();
      
      expect(gameController.currentLevel).toBe(2);
      expect(mockGamePlay.drawUi).toHaveBeenCalled();
    });

    test('should reset game after defeat', async () => {
      gameController.currentLevel = 3;
      gameController.playerPositions = []; // Все игроки мертвы
      gameController.enemyPositions = [{ character: new Vampire(1), position: 50 }];
      
      await gameController.handlePlayerDefeat();
      
      expect(gameController.currentLevel).toBe(1);
      expect(mockGamePlay.drawUi).toHaveBeenCalled();
    });
  });
});
