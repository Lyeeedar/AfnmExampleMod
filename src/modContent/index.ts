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
