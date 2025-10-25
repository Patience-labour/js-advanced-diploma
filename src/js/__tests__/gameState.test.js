import GameState from '../GameState.js';
import GameController from '../GameController.js';
import GamePlay from '../GamePlay.js';

const mockGamePlay = {
  drawUi: jest.fn(),
  redrawPositions: jest.fn(),
  redrawStats: jest.fn(),
  addCellClickListener: jest.fn(),
  addCellEnterListener: jest.fn(),
  addCellLeaveListener: jest.fn(),
  addNewGameListener: jest.fn(),
  showCellTooltip: jest.fn(),
  hideCellTooltip: jest.fn(),
  setCursor: jest.fn(),
  selectCell: jest.fn(),
  deselectCell: jest.fn(),
  showError: jest.fn(),
  showDamage: jest.fn().mockResolvedValue(),
  showMessage: jest.fn(),
};

describe('Game State and New Game', () => {
  describe('GameState', () => {
    test('should track max scores across games', () => {
      const gameState = new GameState();
      
      gameState.addScores(100);
      expect(gameState.scores).toBe(100);
      expect(gameState.maxScores).toBe(100);
      
      gameState.addScores(50);
      expect(gameState.scores).toBe(150);
      expect(gameState.maxScores).toBe(150);
    });

    test('should preserve max scores on reset', () => {
      const gameState = new GameState();
      
      gameState.addScores(200);
      gameState.reset();
      
      expect(gameState.scores).toBe(0);
      expect(gameState.maxScores).toBe(200);
    });

    test('should detect game over state', () => {
      const gameState = new GameState();
      
      expect(gameState.isGameActive()).toBe(true);
      
      gameState.setGameOver();
      expect(gameState.isGameActive()).toBe(false);
      
      gameState.reset();
      expect(gameState.isGameActive()).toBe(true);
    });
  });

  describe('New Game Functionality', () => {
    let gameController;

    beforeEach(() => {
      gameController = new GameController(mockGamePlay, {});
      jest.clearAllMocks();
    });

    test('should start new game on button click', () => {
      gameController.onNewGame();
      
      expect(gameController.currentLevel).toBe(1);
      expect(mockGamePlay.drawUi).toHaveBeenCalled();
    });

    test('should block events when game over', () => {
      gameController.gameState.setGameOver();
      
      // Эти вызовы не должны приводить к ошибкам
      gameController.onCellClick(10);
      gameController.onCellEnter(10);
      gameController.onCellLeave(10);
      
      // Должен установиться обычный курсор
      expect(mockGamePlay.setCursor).toHaveBeenCalledWith('auto');
    });

    test('should update statistics display', () => {
      gameController.gameState.addScores(150);
      gameController.updateStatistics();
      
      expect(mockGamePlay.redrawStats).toHaveBeenCalledWith({
        level: 1,
        score: 150,
        maxScore: 150
      });
    });
  });
});
