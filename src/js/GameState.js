export default class GameState {
  constructor() {
    this.currentTurn = 'player';
    this.selectedCharacter = null;
    this.selectedCellIndex = null;
    this.turnNumber = 1;
    this.scores = 0;
    this.maxScores = 0;
    this.gameOver = false;
    this.gameCompleted = false;
    this.currentLevel = 1;
    this.playerPositions = [];
    this.enemyPositions = [];
  }

  static from(object) {
    if (!object || typeof object !== 'object') {
      return new GameState();
    }

    const gameState = new GameState();

    gameState.currentTurn = object.currentTurn || 'player';
    gameState.selectedCharacter = object.selectedCharacter || null;
    gameState.selectedCellIndex = object.selectedCellIndex || null;
    gameState.turnNumber = object.turnNumber || 1;
    gameState.scores = object.scores || 0;
    gameState.maxScores = object.maxScores || 0;
    gameState.gameOver = object.gameOver || false;
    gameState.gameCompleted = object.gameCompleted || false;
    gameState.currentLevel = object.currentLevel || 1;

    gameState.playerPositions = this.restorePositions(object.playerPositions || []);
    gameState.enemyPositions = this.restorePositions(object.enemyPositions || []);

    return gameState;
  }

  static restorePositions(positionsData) {
    return positionsData.map(posData => {
      return {
        character: {
          level: posData.character.level,
          attack: posData.character.attack,
          defence: posData.character.defence,
          health: posData.character.health,
          type: posData.character.type
        },
        position: posData.position
      };
    });
  }


  switchTurn() {
    this.currentTurn = this.currentTurn === 'player' ? 'computer' : 'player';
    if (this.currentTurn === 'player') {
      this.turnNumber += 1;
    }
    this.deselectCharacter();
  }

  selectCharacter(character, cellIndex) {
    this.selectedCharacter = character;
    this.selectedCellIndex = cellIndex;
  }

  deselectCharacter() {
    this.selectedCharacter = null;
    this.selectedCellIndex = null;
  }

  isPlayerTurn() {
    return this.currentTurn === 'player';
  }

  hasSelectedCharacter() {
    return this.selectedCharacter !== null;
  }

  addScores(points) {
    this.scores += points;
    if (this.scores > this.maxScores) {
      this.maxScores = this.scores;
    }
  }
  setGameOver() {
    this.gameOver = true;
    this.updateMaxScores();
  }

  setGameCompleted() {
    this.gameCompleted = true;
    this.updateMaxScores();
  }

  updateMaxScores() {
    if (this.scores > this.maxScores) {
      this.maxScores = this.scores;
    }
  }

  reset() {
    this.currentTurn = 'player';
    this.turnNumber = 1;
    this.scores = 0;
    this.gameOver = false;
    this.gameCompleted = false;
    this.deselectCharacter();
  }

  isGameActive() {
    return !this.gameOver && !this.gameCompleted;
  }


  toObject() {
    return {
      currentTurn: this.currentTurn,
      selectedCharacter: this.selectedCharacter ? this.serializeCharacter(this.selectedCharacter) : null,
      selectedCellIndex: this.selectedCellIndex,
      turnNumber: this.turnNumber,
      scores: this.scores,
      maxScores: this.maxScores,
      gameOver: this.gameOver,
      gameCompleted: this.gameCompleted,
      currentLevel: this.currentLevel,
      playerPositions: this.serializePositions(this.playerPositions),
      enemyPositions: this.serializePositions(this.enemyPositions)
    };
  }
  serializePositions(positions) {
    return positions.map(pos => ({
      character: this.serializeCharacter(pos.character),
      position: pos.position
    }));
  }

  serializeCharacter(character) {
    return {
      level: character.level,
      attack: character.attack,
      defence: character.defence,
      health: character.health,
      type: character.type
    };
  }

}