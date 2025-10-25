/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    for (let i = 1; i < level; i++) {
      this.levelUp();
    }


    if (new.target.name === 'Character') {
      throw new Error('Cannot create instance of abstract Character class');
    }
  }
  levelUp() {
    this.level += 1;

    const currentHealthPercent = (this.health / 100) * 100;

    this.health = Math.min(this.level + 80, 100);

    const improvementMultiplier = (80 + currentHealthPercent) / 100;

    this.attack = Math.max(this.attack, Math.round(this.attack * improvementMultiplier));
    this.defence = Math.max(this.defence, Math.round(this.defence * improvementMultiplier));
  }

}
