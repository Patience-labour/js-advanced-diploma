import { Bowman, Swordsman, Magician, Vampire, Undead, Daemon } from './characters/index.js';
import { generateTeam } from './generators.js';
import PositionedCharacter from './PositionedCharacter.js';
import { characterInfo, getMovementCells, getAttackCells, getMoveRange, getAttackRange } from './utils.js';
import GameState from './GameState.js';
import cursors from './cursors.js';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.playerTeam = null;
    this.enemyTeam = null;
    this.playerPositions = [];
    this.enemyPositions = [];
    this.boardSize = 8;
    this.movementCells = [];
    this.attackCells = [];
    this.currentLevel = 1;
    this.themes = ['prairie', 'desert', 'arctic', 'mountain'];
    this.maxLevel = 4;
    
    this.bindUnloadHandler();
  }

  init() {
    this.loadGame();
    
    if (!this.gameState.playerPositions || this.gameState.playerPositions.length === 0) {
      this.startNewGame();
    } else {
      this.restoreGameFromState();
    }
    
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
  }

  loadGame() {
    try {
      const state = this.stateService.load();
      if (state) {
        this.gameState = GameState.from(state);
        console.log('Game loaded successfully');
        return true;
      }
    } catch (error) {
      console.error('Error loading game:', error);
      this.gamePlay.showError('Не удалось загрузить сохраненную игру');
    }
    return false;
  }

  saveGame() {
    try {
      const state = this.gameState.toObject();
      this.stateService.save(state);
      console.log('Game saved successfully');
    } catch (error) {
      console.error('Error saving game:', error);
      this.gamePlay.showError('Не удалось сохранить игру');
    }
  }

  restoreGameFromState() {
    this.currentLevel = this.gameState.currentLevel;
    
    this.playerPositions = this.restorePositionedCharacters(this.gameState.playerPositions);
    this.enemyPositions = this.restorePositionedCharacters(this.gameState.enemyPositions);
    
    this.playerTeam = { characters: this.playerPositions.map(pos => pos.character) };
    this.enemyTeam = { characters: this.enemyPositions.map(pos => pos.character) };
    
    const themeIndex = Math.min(this.currentLevel - 1, this.themes.length - 1);
    const theme = this.themes[themeIndex];
    this.gamePlay.drawUi(theme);
    
    this.updateStatistics();
    this.redrawBoard();
    
    console.log('Game restored from state');
  }

  restorePositionedCharacters(positionsData) {
    return positionsData.map(posData => {
      const character = this.createCharacterFromData(posData.character);
      return new PositionedCharacter(character, posData.position);
    });
  }

  createCharacterFromData(characterData) {
    const characterClasses = {
      bowman: Bowman,
      swordsman: Swordsman,
      magician: Magician,
      vampire: Vampire,
      undead: Undead,
      daemon: Daemon
    };
    
    const CharacterClass = characterClasses[characterData.type];
    if (!CharacterClass) {
      throw new Error(`Unknown character type: ${characterData.type}`);
    }
    
    const character = new CharacterClass(characterData.level);
    character.attack = characterData.attack;
    character.defence = characterData.defence;
    character.health = characterData.health;
    
    return character;
  }

  bindUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      this.saveGame();
    });
  }

  startNewGame() {
    this.currentLevel = 1;
    this.resetGameState();
    this.startNewLevel();
    
    console.log('New game started');
  }

  startNewLevel() {
    const themeIndex = Math.min(this.currentLevel - 1, this.themes.length - 1);
    const theme = this.themes[themeIndex];
    
    this.gamePlay.drawUi(theme);
    this.updateStatistics();
    
    if (!this.playerTeam || this.playerTeam.characters.length === 0) {
      this.generateTeams();
    }
    
    this.redrawBoard();
    this.saveGame();
    
    console.log(`Starting level ${this.currentLevel} with theme: ${theme}`);
  }

  updateStatistics() {
    this.gamePlay.redrawStats({
      level: this.currentLevel,
      score: this.gameState.scores,
      maxScore: this.gameState.maxScores
    });
  }

  generateTeams() {
    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Vampire, Undead, Daemon];

    this.playerTeam = generateTeam(playerTypes, this.currentLevel, 2);
    this.enemyTeam = generateTeam(enemyTypes, this.currentLevel, 2);

    this.placeCharacters(this.playerTeam.characters, 0, 2, this.playerPositions);
    this.placeCharacters(this.enemyTeam.characters, 6, 2, this.enemyPositions);
  }

  placeCharacters(characters, startRow, rowCount, positionsArray) {
    const occupiedPositions = new Set();

    characters.forEach(character => {
      let position;
      let attempts = 0;

      do {
        const row = startRow + Math.floor(Math.random() * rowCount);
        const col = Math.floor(Math.random() * this.boardSize);
        position = row * this.boardSize + col;
        attempts++;

        if (attempts > 50) {
          for (let r = startRow; r < startRow + rowCount; r++) {
            for (let c = 0; c < this.boardSize; c++) {
              const pos = r * this.boardSize + c;
              if (!occupiedPositions.has(pos) && !this.isPositionOccupied(pos)) {
                position = pos;
                break;
              }
            }
          }
          break;
        }
      } while (this.isPositionOccupied(position) || occupiedPositions.has(position));

      occupiedPositions.add(position);
      positionsArray.push(new PositionedCharacter(character, position));
    });
  }

  isPositionOccupied(position) {
    const allPositions = [...this.playerPositions, ...this.enemyPositions];
    return allPositions.some(posChar => posChar.position === position);
  }

  redrawBoard() {
    const allPositionedCharacters = [...this.playerPositions, ...this.enemyPositions];
    this.gamePlay.redrawPositions(allPositionedCharacters);
  }

  onCellClick(index) {
    if (!this.gameState.isGameActive()) {
      return;
    }

    this.updateGameState();
    this.saveGame();

    console.log('Cell clicked:', index);
    console.log('Current turn:', this.gameState.currentTurn);

    if (!this.gameState.isPlayerTurn()) {
      this.gamePlay.showError('Сейчас ход противника!');
      return;
    }

    const positionedChar = this.findCharacterAtPosition(index);
    
    if (!positionedChar) {
      if (this.gameState.hasSelectedCharacter()) {
        if (this.movementCells.includes(index)) {
          this.moveCharacter(index);
        } else {
          this.gamePlay.showError('Невозможно переместиться в эту клетку!');
        }
      } else {
        this.gamePlay.showError('Выберите своего персонажа!');
      }
      return;
    }

    const { character } = positionedChar;

    if (this.isPlayerCharacter(character)) {
      this.selectCharacter(character, index);
    } else {
      if (this.gameState.hasSelectedCharacter()) {
        if (this.attackCells.includes(index)) {
          this.attackCharacter(index, positionedChar);
        } else {
          this.gamePlay.showError('Невозможно атаковать этого противника!');
        }
      } else {
        this.gamePlay.showError('Вы можете выбирать только своих персонажей!');
      }
    }
  }

  onCellEnter(index) {
    if (!this.gameState.isGameActive()) {
      this.gamePlay.setCursor(cursors.auto);
      return;
    }

    const positionedChar = this.findCharacterAtPosition(index);
    
    if (positionedChar) {
      const info = characterInfo(positionedChar.character);
      this.gamePlay.showCellTooltip(info, index);
    }

    this.updateCursor(index);
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  onNewGame() {
    console.log('New Game button clicked');
    
    try {
      this.stateService.clear();
    } catch (error) {
      console.error('Error clearing saved game:', error);
    }
    
    this.startNewGame();
  }

  selectCharacter(character, index) {
    if (this.gameState.selectedCellIndex !== null) {
      this.gamePlay.deselectCell(this.gameState.selectedCellIndex);
      this.resetCellHighlights();
    }
    
    this.gamePlay.selectCell(index);
    this.gameState.selectCharacter(character, index);
    
    this.calculateAvailableCells(character, index);
    
    console.log('Player character selected:', {
      type: character.type,
      level: character.level,
      position: index
    });
  }

  moveCharacter(newPosition) {
    const selectedCharacter = this.gameState.selectedCharacter;
    const oldPosition = this.gameState.selectedCellIndex;
    
    if (!selectedCharacter || oldPosition === null) {
      this.gamePlay.showError('Персонаж не выбран!');
      return;
    }

    const positionedCharIndex = this.playerPositions.findIndex(
      posChar => posChar.character === selectedCharacter && posChar.position === oldPosition
    );

    if (positionedCharIndex === -1) {
      this.gamePlay.showError('Ошибка: персонаж не найден!');
      return;
    }

    this.playerPositions[positionedCharIndex].position = newPosition;
    
    this.gamePlay.deselectCell(oldPosition);
    this.resetCellHighlights();
    this.gameState.deselectCharacter();
    
    this.redrawBoard();
    this.endPlayerTurn();
    
    console.log(`Character moved from ${oldPosition} to ${newPosition}`);
  }

  async attackCharacter(targetIndex, targetPositionedChar) {
    const attacker = this.gameState.selectedCharacter;
    const target = targetPositionedChar.character;
    
    if (!attacker) {
      this.gamePlay.showError('Атакующий персонаж не выбран!');
      return;
    }

    const damage = this.calculateDamage(attacker, target);
    
    console.log(`Attack: ${attacker.type} (attack:${attacker.attack}) -> ${target.type} (defence:${target.defence}), damage: ${damage}`);

    this.gameState.addScores(Math.round(damage));
    this.updateStatistics();

    target.health -= damage;
    
    if (target.health < 0) {
      target.health = 0;
    }

    try {
      await this.gamePlay.showDamage(targetIndex, damage);
    } catch (error) {
      console.error('Error showing damage animation:', error);
    }

    if (target.health <= 0) {
      this.gameState.addScores(10);
      this.updateStatistics();
      
      this.removeCharacter(target);
      console.log(`Character ${target.type} died!`);
      
      await this.checkRoundEnd();
    } else {
      this.redrawBoard();
    }

    this.gamePlay.deselectCell(this.gameState.selectedCellIndex);
    this.resetCellHighlights();
    this.gameState.deselectCharacter();
    
    this.updateGameState();
    this.saveGame();
    
    if (this.gameState.isGameActive() && this.enemyPositions.length > 0 && this.playerPositions.length > 0) {
      this.endPlayerTurn();
    }
  }

  calculateDamage(attacker, target) {
    const baseDamage = attacker.attack - target.defence;
    const minDamage = attacker.attack * 0.1;
    
    return Math.max(baseDamage, minDamage);
  }

  removeCharacter(character) {
    this.playerPositions = this.playerPositions.filter(
      posChar => posChar.character !== character
    );
    
    this.enemyPositions = this.enemyPositions.filter(
      posChar => posChar.character !== character
    );
    
    if (this.playerTeam) {
      this.playerTeam.characters = this.playerTeam.characters.filter(
        char => char !== character
      );
    }
    
    if (this.enemyTeam) {
      this.enemyTeam.characters = this.enemyTeam.characters.filter(
        char => char !== character
      );
    }
  }

  async checkRoundEnd() {
    this.redrawBoard();
    
    if (this.enemyPositions.length === 0) {
      await this.handlePlayerVictory();
    } else if (this.playerPositions.length === 0) {
      await this.handlePlayerDefeat();
    }
  }

  async handlePlayerVictory() {
    console.log('Player victory! Leveling up characters...');
    
    this.gameState.addScores(this.currentLevel * 50);
    this.updateStatistics();
    
    await this.delay(1500);
    
    this.levelUpSurvivingCharacters();
    
    if (this.currentLevel >= this.maxLevel) {
      await this.handleGameCompleted();
    } else {
      this.currentLevel += 1;
      this.resetGameState();
      this.startNewLevel();
      
      this.gamePlay.showMessage(`Победа! Переход на уровень ${this.currentLevel}`);
    }
  }

  async handlePlayerDefeat() {
    console.log('Player defeated! Game over.');
    
    await this.delay(1500);
    
    this.gameState.setGameOver();
    this.updateStatistics();
    
    this.gamePlay.showMessage('Игра окончена! Нажмите "New Game" для новой игры.');
  }

  async handleGameCompleted() {
    console.log('Game completed! All levels finished.');
    
    this.gameState.addScores(1000);
    this.gameState.setGameCompleted();
    this.updateStatistics();
    
    await this.delay(1500);
    
    this.gamePlay.showMessage('Поздравляем! Вы прошли все уровни игры!');
  }

  levelUpSurvivingCharacters() {
    this.playerPositions.forEach(positionedChar => {
      const character = positionedChar.character;
      console.log(`Leveling up ${character.type} from level ${character.level} with ${character.health} health`);
            
      character.levelUp();
      
      console.log(`After level up: level ${character.level}, health ${character.health}, attack ${character.attack}, defence ${character.defence}`);
    });
  }

  calculateAvailableCells(character, position) {
    const moveRange = getMoveRange(character.type);
    const attackRange = getAttackRange(character.type);
    
    this.movementCells = getMovementCells(position, moveRange, this.boardSize)
      .filter(cell => !this.isPositionOccupied(cell));
    
    this.attackCells = getAttackCells(position, attackRange, this.boardSize)
      .filter(cell => {
        const targetChar = this.findCharacterAtPosition(cell);
        return targetChar && this.isEnemyCharacter(targetChar.character);
      });
    
    this.highlightAvailableCells();
  }

  highlightAvailableCells() {
    this.movementCells.forEach(cell => {
      this.gamePlay.selectCell(cell, 'green');
    });
    
    this.attackCells.forEach(cell => {
      this.gamePlay.selectCell(cell, 'red');
    });
  }

  resetCellHighlights() {
    this.movementCells.forEach(cell => {
      this.gamePlay.deselectCell(cell);
    });
    
    this.attackCells.forEach(cell => {
      this.gamePlay.deselectCell(cell);
    });
    
    this.movementCells = [];
    this.attackCells = [];
  }

  updateCursor(index) {
    const positionedChar = this.findCharacterAtPosition(index);
    
    if (this.gameState.hasSelectedCharacter()) {
      if (positionedChar) {
        if (this.isPlayerCharacter(positionedChar.character)) {
          this.gamePlay.setCursor(cursors.pointer);
        } else if (this.attackCells.includes(index)) {
          this.gamePlay.setCursor(cursors.crosshair);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      } else {
        if (this.movementCells.includes(index)) {
          this.gamePlay.setCursor(cursors.pointer);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    } else {
      if (positionedChar && this.isPlayerCharacter(positionedChar.character)) {
        this.gamePlay.setCursor(cursors.pointer);
      } else {
        this.gamePlay.setCursor(cursors.auto);
      }
    }
  }

  async computerTurn() {
    console.log('Computer thinking...');

    await this.delay(1000);

    const aliveEnemies = this.enemyPositions.filter(posChar => posChar.character.health > 0);
    
    if (aliveEnemies.length === 0) {
      console.log('No alive enemies, skipping computer turn');
      this.endComputerTurn();
      return;
    }

    let bestAction = null;
    let bestScore = -Infinity;

    for (const enemyPos of aliveEnemies) {
      const action = this.findBestAction(enemyPos);
      if (action && action.score > bestScore) {
        bestScore = action.score;
        bestAction = action;
      }
    }

    if (bestAction) {
      await this.executeComputerAction(bestAction);
    } else {
      console.log('No available actions for computer');
    }

    this.endComputerTurn();
  }

  findBestAction(enemyPositionedChar) {
    const enemy = enemyPositionedChar.character;
    const enemyPosition = enemyPositionedChar.position;
    
    const moveRange = getMoveRange(enemy.type);
    const attackRange = getAttackRange(enemy.type);
    
    const movementCells = getMovementCells(enemyPosition, moveRange, this.boardSize)
      .filter(cell => !this.isPositionOccupied(cell));
    
    const attackCellsFromCurrent = getAttackCells(enemyPosition, attackRange, this.boardSize)
      .filter(cell => {
        const targetChar = this.findCharacterAtPosition(cell);
        return targetChar && this.isPlayerCharacter(targetChar.character);
      });

    let bestAction = null;
    let bestScore = -Infinity;

    if (attackCellsFromCurrent.length > 0) {
      const bestAttackFromCurrent = this.findBestAttackTarget(attackCellsFromCurrent, enemy);
      if (bestAttackFromCurrent && bestAttackFromCurrent.score > bestScore) {
        bestScore = bestAttackFromCurrent.score;
        bestAction = bestAttackFromCurrent;
      }
    }

    for (const moveCell of movementCells) {
      const attackCellsAfterMove = getAttackCells(moveCell, attackRange, this.boardSize)
        .filter(cell => {
          const targetChar = this.findCharacterAtPosition(cell);
          return targetChar && this.isPlayerCharacter(targetChar.character);
        });

      if (attackCellsAfterMove.length > 0) {
        const bestAttackAfterMove = this.findBestAttackTarget(attackCellsAfterMove, enemy);
        if (bestAttackAfterMove) {
          const movePenalty = 0.1;
          const scoreWithMove = bestAttackAfterMove.score * (1 - movePenalty);
          
          if (scoreWithMove > bestScore) {
            bestScore = scoreWithMove;
            bestAction = {
              type: 'move-and-attack',
              enemy: enemyPositionedChar,
              moveTo: moveCell,
              attackTarget: bestAttackAfterMove.target,
              targetPosition: bestAttackAfterMove.targetPosition,
              score: scoreWithMove
            };
          }
        }
      }
    }

    return bestAction;
  }

  findBestAttackTarget(attackCells, attacker) {
    let bestTarget = null;
    let bestScore = -Infinity;

    for (const cell of attackCells) {
      const targetChar = this.findCharacterAtPosition(cell);
      if (targetChar && this.isPlayerCharacter(targetChar.character)) {
        const score = this.calculateAttackScore(attacker, targetChar.character);
        
        if (score > bestScore) {
          bestScore = score;
          bestTarget = {
            target: targetChar.character,
            targetPosition: cell,
            score: score
          };
        }
      }
    }

    return bestTarget;
  }

  calculateAttackScore(attacker, target) {
    const damage = this.calculateDamage(attacker, target);
    const killBonus = target.health <= damage ? 10 : 0;
    const defencePenalty = target.defence * 0.1;
    const threatBonus = target.attack * 0.05;
    
    return damage + killBonus - defencePenalty + threatBonus;
  }

  async executeComputerAction(action) {
    console.log('Computer action:', action.type);
    
    switch (action.type) {
      case 'attack':
        await this.executeComputerAttack(action.enemy, action.targetPosition);
        break;
      
      case 'move-and-attack':
        await this.executeComputerMoveAndAttack(action.enemy, action.moveTo, action.targetPosition);
        break;
      
      default:
        console.log('Unknown computer action type:', action.type);
    }
  }

  async executeComputerAttack(enemyPositionedChar, targetPosition) {
    const targetChar = this.findCharacterAtPosition(targetPosition);
    
    if (!targetChar) {
      console.error('Target not found at position:', targetPosition);
      return;
    }

    const damage = this.calculateDamage(enemyPositionedChar.character, targetChar.character);
    
    console.log(`Computer attack: ${enemyPositionedChar.character.type} -> ${targetChar.character.type}, damage: ${damage}`);

    targetChar.character.health -= damage;
    
    if (targetChar.character.health < 0) {
      targetChar.character.health = 0;
    }

    try {
      await this.gamePlay.showDamage(targetPosition, damage);
    } catch (error) {
      console.error('Error showing damage animation:', error);
    }

    if (targetChar.character.health <= 0) {
      this.removeCharacter(targetChar.character);
      console.log(`Player character ${targetChar.character.type} died!`);
    }

    this.redrawBoard();
  }

  async executeComputerMoveAndAttack(enemyPositionedChar, moveTo, targetPosition) {
    const enemyIndex = this.enemyPositions.findIndex(
      posChar => posChar === enemyPositionedChar
    );

    if (enemyIndex !== -1) {
      const oldPosition = enemyPositionedChar.position;
      this.enemyPositions[enemyIndex].position = moveTo;
      
      console.log(`Computer moved ${enemyPositionedChar.character.type} from ${oldPosition} to ${moveTo}`);
      
      this.redrawBoard();
      await this.delay(500);
    }

    await this.executeComputerAttack(enemyPositionedChar, targetPosition);
  }

  endComputerTurn() {
    this.gameState.switchTurn();
    console.log('Computer turn finished. Current turn:', this.gameState.currentTurn);
  }

  endPlayerTurn() {
    this.gameState.switchTurn();
    console.log('Player turn finished. Current turn:', this.gameState.currentTurn);
    
    this.updateGameState();
    this.saveGame();
    
    this.computerTurn();
  }

  updateGameState() {
    this.gameState.currentLevel = this.currentLevel;
    this.gameState.playerPositions = this.playerPositions.map(pos => ({
      character: this.gameState.serializeCharacter(pos.character),
      position: pos.position
    }));
    this.gameState.enemyPositions = this.enemyPositions.map(pos => ({
      character: this.gameState.serializeCharacter(pos.character),
      position: pos.position
    }));
  }

  resetGameState() {
    const maxScores = this.gameState.maxScores;
    
    this.gameState = new GameState();
    this.gameState.maxScores = maxScores;
    
    this.playerTeam = null;
    this.enemyTeam = null;
    this.playerPositions = [];
    this.enemyPositions = [];
    this.movementCells = [];
    this.attackCells = [];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  findCharacterAtPosition(position) {
    const allPositions = [...this.playerPositions, ...this.enemyPositions];
    return allPositions.find(posChar => posChar.position === position) || null;
  }

  isPlayerCharacter(character) {
    const playerTypes = ['bowman', 'swordsman', 'magician'];
    return playerTypes.includes(character.type);
  }

  isEnemyCharacter(character) {
    const enemyTypes = ['vampire', 'undead', 'daemon'];
    return enemyTypes.includes(character.type);
  }
}