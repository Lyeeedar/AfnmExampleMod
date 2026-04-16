import { TreasureItem, Technique } from 'afnm-types';

const simplifiedTechniques = Object.values(window.modAPI.gameData.techniques).map(e => {
  let type: string = e.type
  if (type === "none") {
    type = e.noneType ?? "none"
  } else if (e.secondaryType) {
    type += `/${e.secondaryType}`
  }

  return {
    name: e.name,
    type: type,
    masteries: e.upgradeMasteries ? Object.values(e.upgradeMasteries).map(m => m.transcendent?.kind + " " + m.transcendent?.tooltip) : [],
  }
})

const simplifiedCrafting = Object.values(window.modAPI.gameData.craftingTechniques).map(e => {
  return {
    name: e.name,
    type: e.type,
    masteries: e.upgradeMasteries ? Object.values(e.upgradeMasteries).map(m => m.transcendent?.kind + " " + m.transcendent?.tooltip) : [],
  }
})

// Helper function to download JSON to disk
function downloadJson(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Download both files
downloadJson(simplifiedTechniques, 'techniques.json');
downloadJson(simplifiedCrafting, 'crafting.json');

