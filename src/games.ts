// The game list. Add a new game here, then give it a folder in src/pages/<slug>/.
export type Game = {
  slug: string;
  name: string;
  tagline: string;
  about: string;
  features: string[];
  playUrl?: string; // Google Play link, once the game is public
  accent: string;
};

export const games: Game[] = [
  {
    slug: 'frostspear',
    name: 'FrostSpear: Tundra Hunt',
    tagline: 'Tap, throw, hunt. An Ice Age adventure for kids and teens.',
    about:
      'Throw your spear at wolves, sabre-tooths, woolly rhinos and mighty mammoths across 200 levels of frozen tundra, caves and starry nights. Gentle first levels teach the basics, Golden Hunts and boss beasts keep it exciting, and new spears and hoods unlock as you go.',
    features: ['200 levels', 'No ads', 'No in-app purchases', 'Plays offline', 'Made for families'],
    accent: '#3d8bff',
  },
];
