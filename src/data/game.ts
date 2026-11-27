// Facts about the game, taken from the game's code (frozen-valley/src/index.html).
// Keep them in step with the game when it changes.

export const game = {
  name: 'FrostSpear: Tundra Hunt',
  short: 'FrostSpear',
  studio: 'PlayFlex',
  email: 'contact@playflex.net',
  url: 'https://frostspear.playflex.net',
  // Set this to the Google Play link when the game is public; the site then shows a "Get it on Google Play" button.
  playUrl: '',
  testMail: 'mailto:contact@playflex.net?subject=FrostSpear%20closed%20test',
};

// In the order a player meets them. `level` = first level the beast appears on (bosses included).
export const beasts = [
  { id: 'wolf', name: 'Dire Wolf', level: 1, habit: 'Hunts in packs. Take the closest one first.' },
  { id: 'eagle', name: 'Bald Eagle', level: 3, habit: 'Screeches, then dives straight at you. Hit it before the dive.' },
  { id: 'saber', name: 'Sabertooth', level: 6, habit: 'Crouches before it pounces. That pause is your chance.' },
  { id: 'moose', name: 'Stag-Moose', level: 9, habit: 'Charges, stops to snort, then charges again. Strike while it waits.' },
  { id: 'mam', name: 'Woolly Mammoth', level: 10, habit: 'The first boss. Smash the ice boulders it throws, then go for the mammoth.' },
  { id: 'hyena', name: 'Cave Hyena', level: 13, habit: 'Dodges your first spear, so be ready to throw again.' },
  { id: 'rhino', name: 'Woolly Rhino', level: 17, habit: 'Scrapes the snow, then charges fast.' },
  { id: 'alpha', name: 'Alpha Wolf', level: 20, habit: 'Leads the pack. Bring it down and the rest run away.' },
  { id: 'bear', name: 'Polar Bear', level: 22, habit: 'Rears up to roar. A hit while it stands does double damage.' },
  { id: 'terat', name: 'Teratorn', level: 28, habit: 'A giant bird that glides in high, then dives.' },
] as const;

// 20 levels each; a boss on every tenth level.
export const regions = [
  { name: 'Frozen Valley', bosses: ['The Old Mammoth', 'The Pack King'] },
  { name: 'Pine Taiga', bosses: ['The Ice Giant', 'Sabertooth Queen'] },
  { name: 'Glacier Caves', bosses: ['Thunder Horn', 'The Antler Lord'] },
  { name: 'Mammoth Steppe', bosses: ['The Mammoth King', 'Shadow Pack King'] },
  { name: 'Aurora Valley', bosses: ['The Frost Titan', 'Saber Empress'] },
  { name: 'Snowbound Forest', bosses: ['Iron Horn', 'The Elder Stag'] },
  { name: 'Crystal Caverns', bosses: ['The Ancient Mammoth', 'Moon Howler'] },
  { name: 'Storm Steppe', bosses: ['The White Fury', 'Ghost Saber'] },
  { name: 'Blizzard Pass', bosses: ['Mountain Breaker', 'Storm Antlers'] },
  { name: 'Frost Kingdom', bosses: ['The Blizzard King', 'The Last Mammoth King'] },
].map((r, i) => ({ ...r, img: `/img/regions/${String(i + 1).padStart(2, '0')}.webp`, from: i * 20 + 1, to: i * 20 + 20 }));

export const screens = [
  { id: 'hunt', alt: 'A pack of dire wolves running across the snow toward the player, with two eagles overhead', caption: 'Wolves come in packs. Tap the closest first.' },
  { id: 'storm', alt: 'Spear Storm: a rain of spears falling on the beasts in an ice cave', caption: 'Fill the fury bar, then call down a Spear Storm.' },
  { id: 'boss', alt: 'The Mammoth King boss fight on level 70, with the boss health bar at the top', caption: 'Every tenth level ends in a boss fight.' },
  { id: 'trophies', alt: 'The Trophy Cave, with every beast painted on the cave wall', caption: 'Each beast you hunt is painted on your cave wall.' },
] as const;
