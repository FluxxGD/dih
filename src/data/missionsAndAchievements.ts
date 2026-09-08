import { Achievement, Mission, PlayerSkin, ArenaTheme } from '../types';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Dodge 25 Hazards',
    progress: 0,
    target: 25,
    completed: false,
    rewardText: '+250 Bonus Pts',
  },
  {
    id: 'm2',
    title: 'Perform 3 Close Calls',
    progress: 0,
    target: 3,
    completed: false,
    rewardText: 'Unlock Phoenix Aura',
  },
  {
    id: 'm3',
    title: 'Collect 4 Energy Pickups',
    progress: 0,
    target: 4,
    completed: false,
    rewardText: '+1 EMP Charge',
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Reflex',
    desc: 'Dodge your first 10 obstacles without taking damage.',
    icon: '⚡',
    unlocked: false,
    category: 'skill',
  },
  {
    id: 'close_call_ace',
    title: 'Adrenaline Junkie',
    desc: 'Perform 5 Close Calls in a single run.',
    icon: '🔥',
    unlocked: false,
    category: 'skill',
  },
  {
    id: 'trans_pride',
    title: 'Pride Radiance',
    desc: 'Play a run wearing the Trans Style skin and score over 200 points.',
    icon: '🏳️‍⚧️',
    unlocked: false,
    category: 'style',
  },
  {
    id: 'shield_guardian',
    title: 'Titan Aegis',
    desc: 'Survive a fatal crash using an active Energy Shield.',
    icon: '🛡️',
    unlocked: false,
    category: 'skill',
  },
  {
    id: 'laser_rampage',
    title: 'Neon Vindicator',
    desc: 'Destroy 8 obstacles using the Twin Laser Blaster.',
    icon: '💥',
    unlocked: false,
    category: 'boss',
  },
  {
    id: 'boss_slayer',
    title: 'Mothership Demolisher',
    desc: 'Defeat a Neon Dreadnought Boss.',
    icon: '👑',
    unlocked: false,
    category: 'boss',
  },
  {
    id: 'dash_master',
    title: 'Phase Shifter',
    desc: 'Use Hyper-Warp Dash 10 times in a run.',
    icon: '🚀',
    unlocked: false,
    category: 'skill',
  },
  {
    id: 'fever_overdrive',
    title: 'Neon Fever',
    desc: 'Trigger Fever Mode by sustaining a high combo streak.',
    icon: '🌟',
    unlocked: false,
    category: 'score',
  },
  {
    id: 'centurion',
    title: 'Centurion',
    desc: 'Survive for over 100 seconds in a single mission.',
    icon: '⏱️',
    unlocked: false,
    category: 'score',
  },
];

export interface SkinConfig {
  id: PlayerSkin;
  name: string;
  tagline: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  trailColor: string;
  glowColor: string;
  description: string;
}

export const SKINS: SkinConfig[] = [
  {
    id: 'trans',
    name: 'Trans Pride Cruiser',
    tagline: 'Authentic Pride Flag Stripes',
    badge: '🏳️‍⚧️ PRIDE STYLE',
    primaryColor: '#5BCEFA', // Trans pastel blue
    accentColor: '#F5A9B8',  // Trans pastel pink
    trailColor: '#FFFFFF',   // Trans white
    glowColor: '#5BCEFA',
    description:
      'Gleaming three-tier hull striped with official Trans Pride flag colors (Pastel Blue, Pink & White), leaving a sparkling prismatic stardust trail.',
  },
  {
    id: 'classic',
    name: 'Classic Neon Lime',
    tagline: 'Retro Arcade Original',
    badge: 'ORIGINAL',
    primaryColor: '#22c55e',
    accentColor: '#4ade80',
    trailColor: '#16a34a',
    glowColor: '#22c55e',
    description: 'The iconic glowing lime square with twin green plasma thruster flares.',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Ronin',
    tagline: 'Neon Violet & Magenta',
    badge: 'VAPORWAVE',
    primaryColor: '#a855f7',
    accentColor: '#ec4899',
    trailColor: '#d946ef',
    glowColor: '#a855f7',
    description: 'Ultraviolet neon chassis with dual magenta ion exhaust lines.',
  },
  {
    id: 'phoenix',
    name: 'Solar Phoenix',
    tagline: 'Blazing Gold & Amber',
    badge: 'SUNBURST',
    primaryColor: '#f59e0b',
    accentColor: '#ef4444',
    trailColor: '#fbbf24',
    glowColor: '#f59e0b',
    description: 'Radiant gilded hull forged in solar flares with flame particle sparks.',
  },
  {
    id: 'stealth',
    name: 'Dark Matter Stealth',
    tagline: 'Monochrome Laser Pulse',
    badge: 'STEALTH',
    primaryColor: '#e2e8f0',
    accentColor: '#38bdf8',
    trailColor: '#64748b',
    glowColor: '#38bdf8',
    description: 'Futuristic slate-and-cyan stealth craft with deep shadow dissipation.',
  },
  {
    id: 'pixel',
    name: '8-Bit Retro Bit',
    tagline: 'Chunky Pixel Nostalgia',
    badge: '8-BIT',
    primaryColor: '#06b6d4',
    accentColor: '#facc15',
    trailColor: '#06b6d4',
    glowColor: '#06b6d4',
    description: 'Chunky segmented retro pixel craft with digital glitch dust particles.',
  },
];

export interface ThemeConfig {
  id: ArenaTheme;
  name: string;
  bgGradient: [string, string];
  gridColor: string;
  railColor: string;
  description: string;
}

export const ARENA_THEMES: ThemeConfig[] = [
  {
    id: 'transNebula',
    name: 'Trans Pride Nebula',
    bgGradient: ['#0a0814', '#150f24'],
    gridColor: 'rgba(91, 206, 250, 0.25)',
    railColor: '#F5A9B8',
    description: 'Soft celestial aura with pastel cyan and pink neon aurora light.',
  },
  {
    id: 'synthwave',
    name: 'Synthwave Highway',
    bgGradient: ['#08040d', '#1a0524'],
    gridColor: 'rgba(217, 70, 239, 0.28)',
    railColor: '#06b6d4',
    description: '80s retro grid moving towards a distant glowing neon magenta horizon.',
  },
  {
    id: 'cyberCity',
    name: 'Cyber City Core',
    bgGradient: ['#030712', '#081325'],
    gridColor: 'rgba(6, 182, 212, 0.25)',
    railColor: '#22c55e',
    description: 'High-tech subterranean grid with cyan cyber conduits.',
  },
  {
    id: 'deepCosmos',
    name: 'Deep Cosmos Void',
    bgGradient: ['#020204', '#07070d'],
    gridColor: 'rgba(30, 41, 59, 0.35)',
    railColor: '#38bdf8',
    description: 'Pitch obsidian void with drifting star particles.',
  },
];
