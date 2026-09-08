export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export type DifficultyMode = 'casual' | 'arcade' | 'insane';

export type ControlScheme = 'keyboard' | 'mouse' | 'touch';

export type PlayerSkin = 'trans' | 'classic' | 'cyberpunk' | 'phoenix' | 'stealth' | 'pixel';

export type ArenaTheme = 'transNebula' | 'synthwave' | 'cyberCity' | 'deepCosmos';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  speed: number;
  shield: boolean;
  invulnerableTimer: number; // in seconds
  dashCooldown: number;
  dashActiveTimer: number;
  blasterTimer: number;
  magnetTimer: number;
  empCharges: number;
  trail: Array<{ x: number; y: number; alpha: number; color?: string }>;
}

export type ObstacleType =
  | 'standard'
  | 'fast'
  | 'zigzag'
  | 'splitter'
  | 'huge'
  | 'homing'
  | 'beam';

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speedY: number;
  speedX: number;
  color: string;
  type: ObstacleType;
  rotation: number;
  rotationSpeed: number;
  initialX: number;
  timeAlive: number;
  dodged: boolean;
  closeCallChecked: boolean;
  hp?: number; // for heavy obstacles
  isSplitChild?: boolean;
}

export interface HazardWarning {
  id: number;
  x: number;
  width: number;
  timer: number;
  duration: number;
}

export type PowerUpType = 'shield' | 'slowmo' | 'star' | 'blaster' | 'magnet' | 'emp';

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  size: number;
  type: PowerUpType;
  speedY: number;
  pulse: number;
}

export interface Laser {
  id: number;
  x: number;
  y: number;
  vy: number;
  color: string;
  width: number;
  height: number;
}

export interface Boss {
  x: number;
  y: number;
  targetY: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  active: boolean;
  attackTimer: number;
  moveDir: number;
  pulse: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'square' | 'circle' | 'spark' | 'star';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale?: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  obstaclesDodged: number;
  closeCalls: number;
  starsCollected: number;
  enemiesDestroyed: number;
  bossesDefeated: number;
  timeSurvived: number; // in seconds
  level: number;
  multiplier: number;
  comboStreak: number;
  feverActive: boolean;
  feverTimer: number;
  revivesUsed: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  category: 'score' | 'skill' | 'style' | 'boss';
}

export interface Mission {
  id: string;
  title: string;
  progress: number;
  target: number;
  completed: boolean;
  rewardText: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  volume: number;
  musicEnabled: boolean;
  musicVolume: number;
  difficulty: DifficultyMode;
  controlScheme: ControlScheme;
  crtFilter: boolean;
  bloomIntensity: 'low' | 'high';
  skin: PlayerSkin;
  theme: ArenaTheme;
  screenShakeEnabled: boolean;
}
