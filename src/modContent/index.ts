import { EnemyEntity, GameLocation, Realm } from 'afnm-types';

const herbGarden = window.modAPI.gameData.locations['Spirit Herb Garden'];
herbGarden.buildings?.forEach((building) => {
  if (building.kind === 'herbField') {
    building.disabled = undefined;
  }
});

const mine = window.modAPI.gameData.locations['Spirit Ore Mine'];
mine.buildings?.forEach((building) => {
  if (building.kind === 'mine') {
    building.disabled = undefined;
  }
});

const liangTiao = window.modAPI.gameData.locations['Liang Tiao Village'];

const getPromotionEnemies = (realm: Realm): EnemyEntity[] => {
  const earlyLocations = Object.values(window.modAPI.gameData.locations).filter(
    (e) => e.realm === realm && e.realmProgress === 'Early' && e.enemies,
  );
  const middleLocations = Object.values(
    window.modAPI.gameData.locations,
  ).filter(
    (e) => e.realm === realm && e.realmProgress === 'Middle' && e.enemies,
  );
  const lateLocations = Object.values(window.modAPI.gameData.locations).filter(
    (e) => e.realm === realm && e.realmProgress === 'Late' && e.enemies,
  );
  return [
    earlyLocations[0].enemies!![0].enemy,
    middleLocations[0].enemies!![0].enemy,
    lateLocations[0].enemies!![0].enemy,
  ];
};

const arena: GameLocation = {
  name: 'Arena',
  description: 'An arena where you can prove your worth.',
  image: liangTiao.image,
  icon: liangTiao.icon,
  screenEffect: 'rain',
  music: 'Liangtiao',
  ambience: 'Market',
  position: {
    x: liangTiao.position.x + 50,
    y: liangTiao.position.y + 350,
  },
  size: 'tiny',
  unlocks: [],
  buildings: [
    {
      kind: 'healer',
    },
    {
      kind: 'custom',
      condition: '1',
      name: 'Arena',
      icon: liangTiao.icon,
      position: 'middle',
      eventSteps: [
        {
          kind: 'text',
          text: 'The arena stands before you, a place where you can prove a worth far beyond your realm.',
        },
        {
          kind: 'choice',
          choices: [
            {
              text: `Attempt a promotion to 'Core Formation'`,
              showCondition: 'realm == qiCondensation',
              children: [
                {
                  kind: 'text',
                  text: "As you approach the arena, you see a sign that reads 'Promotion to Core Formation'. Entering it, you find yourself face-to-face with a dangerous collection of beasts. If you overcome them, you can earn yourself a promotion.",
                },
                {
                  kind: 'combat',
                  enemies: getPromotionEnemies('coreFormation'),
                  victory: [
                    {
                      kind: 'text',
                      text: 'Elation floods through you as the last of the beasts fall.',
                    },
                    {
                      kind: 'overridePlayerRealm',
                      realm: 'coreFormation',
                    },
                    {
                      kind: 'exit',
                    },
                  ],
                  defeat: [
                    {
                      kind: 'text',
                      text: 'You were defeated in the arena. You leave with your head hanging low.',
                    },
                    {
                      kind: 'exit',
                    },
                  ],
                },
              ],
            },
            {
              text: `Attempt a promotion to 'Qi Condensation'`,
              showCondition: 'realm == meridianOpening',
              children: [
                {
                  kind: 'text',
                  text: "As you approach the arena, you see a sign that reads 'Promotion to Qi Condensation'. Entering it, you find yourself face-to-face with a dangerous collection of beasts. If you overcome them, you can earn yourself a promotion.",
                },
                {
                  kind: 'combat',
                  enemies: getPromotionEnemies('qiCondensation'),
                  victory: [
                    {
                      kind: 'text',
                      text: 'Elation floods through you as the last of the beasts fall.',
                    },
                    {
                      kind: 'overridePlayerRealm',
                      realm: 'qiCondensation',
                    },
                    {
                      kind: 'exit',
                    },
                  ],
                  defeat: [
                    {
                      kind: 'text',
                      text: 'You were defeated in the arena. You leave with your head hanging low.',
                    },
                    {
                      kind: 'exit',
                    },
                  ],
                },
              ],
            },
            {
              text: `Attempt a promotion to 'Meridian Opening'`,
              showCondition: 'realm == bodyForging',
              children: [
                {
                  kind: 'text',
                  text: "As you approach the arena, you see a sign that reads 'Promotion to Meridian Opening'. Entering it, you find yourself face-to-face with a dangerous collection of beasts. If you overcome them, you can earn yourself a promotion.",
                },
                {
                  kind: 'combat',
                  enemies: getPromotionEnemies('meridianOpening'),
                  victory: [
                    {
                      kind: 'text',
                      text: 'Elation floods through you as the last of the beasts fall.',
                    },
                    {
                      kind: 'overridePlayerRealm',
                      realm: 'meridianOpening',
                    },
                    {
                      kind: 'exit',
                    },
                  ],
                  defeat: [
                    {
                      kind: 'text',
                      text: 'You were defeated in the arena. You leave with your head hanging low.',
                    },
                    {
                      kind: 'exit',
                    },
                  ],
                },
              ],
            },
            {
              text: `Attempt a promotion to 'Body Forging'`,
              showCondition: 'realm == mundane',
              children: [
                {
                  kind: 'text',
                  text: "As you approach the arena, you see a sign that reads 'Promotion to Body Forging'. Entering it, you find yourself face-to-face with a dangerous collection of beasts. If you overcome them, you can earn yourself a promotion.",
                },
                {
                  kind: 'combat',
                  enemies: getPromotionEnemies('bodyForging'),
                  victory: [
                    {
                      kind: 'text',
                      text: 'Elation floods through you as the last of the beasts fall.',
                    },
                    {
                      kind: 'overridePlayerRealm',
                      realm: 'bodyForging',
                    },
                    {
                      kind: 'exit',
                    },
                  ],
                  defeat: [
                    {
                      kind: 'text',
                      text: 'You were defeated in the arena. You leave with your head hanging low.',
                    },
                    {
                      kind: 'exit',
                    },
                  ],
                },
              ],
            },
            {
              text: 'Leave',
              children: [
                {
                  kind: 'text',
                  text: 'You decide to leave the arena for now.',
                },
                {
                  kind: 'exit',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

window.modAPI.actions.addLocation(arena);
window.modAPI.actions.linkLocations(liangTiao.name, {
  condition: '1',
  distance: 1,
  location: arena,
});
