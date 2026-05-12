import { TreasureItem, Technique } from 'afnm-types';

window.modAPI.hooks.onCreatePlayerCombatEntity((player, combatEntity, breakthrough, flags) => {
  combatEntity.stats.maxhp = 1
  combatEntity.stats.hp = 1

  return combatEntity
})