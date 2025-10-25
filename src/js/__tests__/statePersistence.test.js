import GameState from '../GameState.js';
import GameController from '../GameController.js';
import GamePlay from '../GamePlay.js';
import GameStateService from '../GameStateService.js';

const createMockGamePlay = () => ({
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
});

describe('State Persistence', () => {
  describe('GameState Serialization', () => {
    test('should serialize and deserialize correctly', () => {
      const originalState = new GameState();
      originalState.currentTurn = 'computer';
      originalState.scores = 150;
      originalState.maxScores = 200;
      originalState.currentLevel = 2;
      
      const serialized = originalState.toObject();
      const restoredState = GameState.from(serialized);
      
      expect(restoredState.currentTurn).toBe('computer');
      expect(restoredState.scores).toBe(150);
      expect(restoredState.maxScores).toBe(200);
      expect(restoredState.currentLevel).toBe(2);
    });

    test('should handle empty state', () => {
      const state = GameState.from(null);
      expect(state.currentTurn).toBe('player');
      expect(state.scores).toBe(0);
    });

    test('should handle partial state', () => {
      const partialState = { currentTurn: 'computer', scores: 100 };
      const state = GameState.from(partialState);
      
      expect(state.currentTurn).toBe('computer');
      expect(state.scores).toBe(100);
      expect(state.maxScores).toBe(0);
    });
  });

  describe('GameController State Management', () => {
    let gameController;
    let mockGamePlay;
    let mockStateService;

    beforeEach(() => {
      mockGamePlay = createMockGamePlay();
      mockStateService = {
        load: jest.fn(),
        save: jest.fn(),
        clear: jest.fn(),
      };
      
      gameController = new GameController(mockGamePlay, mockStateService);
      jest.clearAllMocks();
    });

    test('should load game successfully', () => {
      const savedState = {
        currentTurn: 'computer',
        scores: 300,
        maxScores: 400,
        currentLevel: 3,
        playerPositions: [],
        enemyPositions: []
      };
      
      mockStateService.load.mockReturnValue(savedState);
      
      gameController.loadGame();
      
      expect(mockStateService.load).toHaveBeenCalled();
      expect(gameController.gameState.scores).toBe(300);
      expect(gameController.gameState.currentLevel).toBe(3);
    });

    test('should handle load error gracefully', () => {
      mockStateService.load.mockImplementation(() => {
        throw new Error('Load failed');
      });
      
      gameController.loadGame();
      
      expect(mockGamePlay.showError).toHaveBeenCalledWith('Не удалось загрузить сохраненную игру');
    });

    test('should save game on significant actions', () => {
      gameController.playerPositions = [];
      gameController.enemyPositions = [];
      
      gameController.saveGame();
      
      expect(mockStateService.save).toHaveBeenCalled();
    });

    test('should handle save error gracefully', () => {
      mockStateService.save.mockImplementation(() => {
        throw new Error('Save failed');
      });
      
      gameController.saveGame();
      
      expect(mockGamePlay.showError).toHaveBeenCalledWith('Не удалось сохранить игру');
    });

    test('should clear state on new game', () => {
      gameController.onNewGame();
      
      expect(mockStateService.clear).toHaveBeenCalled();
      expect(gameController.currentLevel).toBe(1);
    });
  });

  describe('Integration - Successful Load', () => {
    test('should restore game from saved state', () => {
      const mockGamePlay = createMockGamePlay();
      const mockStateService = {
        load: jest.fn().mockReturnValue({
          currentTurn: 'computer',
          scores: 500,
          maxScores: 600,
          currentLevel: 2,
          playerPositions: [
            {
              character: { type: 'bowman', level: 2, attack: 30, defence: 30, health: 80 },
              position: 10
            }
          ],
          enemyPositions: []
        }),
        save: jest.fn(),
        clear: jest.fn(),
      };

      const gameController = new GameController(mockGamePlay, mockStateService);
      gameController.init();

      expect(gameController.gameState.scores).toBe(500);
      expect(gameController.currentLevel).toBe(2);
      expect(mockGamePlay.drawUi).toHaveBeenCalled();
    });
  });

  describe('Integration - Failed Load', () => {
    test('should start new game when load fails', () => {
      const mockGamePlay = createMockGamePlay();
      const mockStateService = {
        load: jest.fn().mockImplementation(() => {
          throw new Error('Corrupted save');
        }),
        save: jest.fn(),
        clear: jest.fn(),
      };

      const gameController = new GameController(mockGamePlay, mockStateService);
      gameController.init();

      expect(mockGamePlay.showError).toHaveBeenCalledWith('Не удалось загрузить сохраненную игру');
      expect(gameController.currentLevel).toBe(1);
    });
  });
});
