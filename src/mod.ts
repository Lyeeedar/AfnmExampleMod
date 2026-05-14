import './modContent';
import { GAME_VERSION } from "afnm-types"

declare const MOD_METADATA: {
  name: string;
  version: string;
  author: { name: string };
  description: string;
  gameVersion: string;
};

export default {
  getMetadata: () => ({
    ...MOD_METADATA,
    gameVersion: GAME_VERSION
  }),
};
