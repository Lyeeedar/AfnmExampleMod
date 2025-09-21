import { EnemyEntity, GameLocation, Realm } from 'afnm-types';
import { ArenaScreen } from './ArenaScreen';

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
      kind: "modBuilding",
      name: "Proving Grounds Arena",
      icon: liangTiao.icon,
      position: 'middle',
      screen: "arena"
    }
  ],
};

window.modAPI.actions.addLocation(arena);
window.modAPI.actions.linkLocations(liangTiao.name, {
  condition: '1',
  distance: 1,
  location: arena,
});

// Register the arena screen
window.modAPI.actions.addScreen({
  key: "arena",
  component: ArenaScreen,
});