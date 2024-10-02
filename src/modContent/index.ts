import { TreasureItem, Technique } from 'afnm-types';

import icon from '../assets/image.png';

const myTreasure: TreasureItem = {
  kind: 'treasure',
  name: 'The Best Treasure',
  description: 'Wooo mod content.',
  icon: icon,
  stacks: 1,
  rarity: 'mundane',
  realm: 'coreFormation',
};
window.modAPI.actions.addItem(myTreasure);

const myTechnique: Technique = {
  name: 'Test technique',
  icon: '',
  type: 'fist',
  effects: [
    {
      kind: 'buffSelf',
      buff: window.modAPI.gameData.techniqueBuffs.fist.flow,
      amount: {
        value: 1,
        stat: undefined,
      },
    },
  ],
};
window.modAPI.actions.addTechnique(myTechnique);
