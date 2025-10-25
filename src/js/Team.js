/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  constructor(characters = []) {
    this._characters = new Set(characters);
  }

  get characters() {
    return Array.from(this._characters);
  }

  add(character) {
    this._characters.add(character);
    return this;
  }

  addAll(...characters) {
    characters.forEach(character => this._characters.add(character));
    return this;
  }

  remove(character) {
    this._characters.delete(character);
    return this;
  }

  get size() {
    return this._characters.size;
  }

  has(character) {
    return this._characters.has(character);
  }

  [Symbol.iterator]() {
    return this._characters.values();
  }
}
