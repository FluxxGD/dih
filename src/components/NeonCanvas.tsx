import React, { useEffect, useRef, useCallback } from 'react';
import {
  GameStatus,
  Player,
  Obstacle,
  PowerUp,
  Particle,
  FloatingText,
  GameStats,
  GameSettings,
  ObstacleType,
  PowerUpType,
  Laser,
  Boss,
  HazardWarning,
} from '../types';
import { sound } from '../services/sound';
import { SKINS, ARENA_THEMES } from '../data/missionsAndAchievements';
import { Flame } from 'lucide-react';

interface NeonCanvasProps {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  stats: GameStats;
  setStats: React.Dispatch<React.SetStateAction<GameStats>>;
  settings: GameSettings;
  onGameOver: (finalStats: GameStats) => void;
  onTriggerEMP: () => void;
  onTriggerDash: () => void;
  onAchievementUnlock: (id: string) => void;
  onOpenDemonList?: () => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export const NeonCanvas: React.FC<NeonCanvasProps> = ({
  gameStatus,
  setGameStatus,
  stats,
  setStats,
  settings,
  onGameOver,
  onTriggerEMP,
  onTriggerDash,
  onAchievementUnlock,
  onOpenDemonList,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game State Refs
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 65,
    width: 28,
    height: 28,
    vx: 0,
    speed: 8.5,
    shield: false,
    invulnerableTimer: 0,
    dashCooldown: 0,
    dashActiveTimer: 0,
    blasterTimer: 0,
    magnetTimer: 0,
    empCharges: 1,
    trail: [],
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const lasersRef = useRef<Laser[]>([]);
  const bossRef = useRef<Boss | null>(null);
  const warningsRef = useRef<HazardWarning[]>([]);
  const shockwavesRef = useRef<Array<{ x: number; y: number; radius: number; maxRadius: number; color: string }>>([]);

  const keysDownRef = useRef<{ [key: string]: boolean }>({});
  const nextIdRef = useRef(1);

  // Timers & FX
  const screenShakeRef = useRef(0);
  const slowMoTimerRef = useRef(0);
  const blasterFireTimerRef = useRef(0);
  const gridOffsetYRef = useRef(0);
  const lastTimeRef = useRef<number>(performance.now());
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Touch & Mouse direct position tracking
  const mouseTargetXRef = useRef<number | null>(null);

  // Get active skin & theme info
  const activeSkin = SKINS.find((s) => s.id === settings.skin) || SKINS[0];
  const activeTheme = ARENA_THEMES.find((t) => t.id === settings.theme) || ARENA_THEMES[0];

  // Spawn initial waves of obstacles
  const resetGameEntities = useCallback(() => {
    playerRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 65,
      width: 28,
      height: 28,
      vx: 0,
      speed: settings.difficulty === 'insane' ? 10 : 8.5,
      shield: settings.difficulty === 'casual',
      invulnerableTimer: 0,
      dashCooldown: 0,
      dashActiveTimer: 0,
      blasterTimer: 0,
      magnetTimer: 0,
      empCharges: settings.difficulty === 'casual' ? 2 : 1,
      trail: [],
    };

    obstaclesRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    lasersRef.current = [];
    bossRef.current = null;
    warningsRef.current = [];
    shockwavesRef.current = [];
    slowMoTimerRef.current = 0;
    screenShakeRef.current = 0;

    // Start background music
    if (settings.musicEnabled) {
      sound.startBGM(122);
    }

    const baseCount = settings.difficulty === 'casual' ? 6 : settings.difficulty === 'arcade' ? 8 : 11;
    for (let i = 0; i < baseCount; i++) {
      spawnObstacle(true, i * 65);
    }
  }, [settings.difficulty, settings.musicEnabled]);

  // Spawn Obstacle
  const spawnObstacle = (initial: boolean = false, staggeredOffset: number = 0) => {
    const types: ObstacleType[] = ['standard', 'standard', 'fast', 'zigzag', 'huge', 'homing', 'splitter'];
    const selectedType = types[Math.floor(Math.random() * types.length)];

    let width = 24;
    let height = 24;
    let speedMult = 1;
    let color = '#ff2255'; // Neon Crimson

    if (selectedType === 'fast') {
      width = 18;
      height = 18;
      speedMult = 1.45;
      color = '#ff007f';
    } else if (selectedType === 'zigzag') {
      width = 22;
      height = 22;
      speedMult = 1.1;
      color = '#ff5500';
    } else if (selectedType === 'huge') {
      width = 40;
      height = 40;
      speedMult = 0.72;
      color = '#dc2626';
    } else if (selectedType === 'homing') {
      width = 22;
      height = 22;
      speedMult = 0.95;
      color = '#e11d48';
    } else if (selectedType === 'splitter') {
      width = 28;
      height = 28;
      speedMult = 0.85;
      color = '#f43f5e';
    }

    const currentLevel = statsRef.current.level || 1;
    const diffMultiplier =
      settings.difficulty === 'casual' ? 0.75 : settings.difficulty === 'arcade' ? 1.0 : 1.35;
    const baseSpeed = (2.6 + currentLevel * 0.28) * diffMultiplier * speedMult;

    const spawnY = initial ? -30 - staggeredOffset : -40 - Math.random() * 50;
    const margin = width + 20;
    const spawnX = margin + Math.random() * (CANVAS_WIDTH - margin * 2);

    obstaclesRef.current.push({
      id: nextIdRef.current++,
      x: spawnX,
      y: spawnY,
      width,
      height,
      speedY: baseSpeed,
      speedX: selectedType === 'zigzag' ? (Math.random() > 0.5 ? 2.6 : -2.6) : 0,
      color,
      type: selectedType,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      initialX: spawnX,
      timeAlive: 0,
      dodged: false,
      closeCallChecked: false,
      hp: selectedType === 'huge' ? 3 : 1,
    });
  };

  // Spawn Boss
  const spawnBoss = () => {
    if (bossRef.current && bossRef.current.active) return;
    sound.playBossWarning();
    addFloatingText('⚠️ NEON DREADNOUGHT INCOMING! ⚠️', CANVAS_WIDTH / 2, 180, '#ef4444', 1.4);
    screenShakeRef.current = 18;

    bossRef.current = {
      x: CANVAS_WIDTH / 2,
      y: -80,
      targetY: 90,
      width: 140,
      height: 48,
      hp: 35 + statsRef.current.level * 10,
      maxHp: 35 + statsRef.current.level * 10,
      active: true,
      attackTimer: 0,
      moveDir: 1,
      pulse: 0,
    };
  };

  // Trigger EMP Wave
  const triggerEMP = useCallback(() => {
    const player = playerRef.current;
    if (player.empCharges <= 0) return;

    player.empCharges--;
    sound.playEMP();
    screenShakeRef.current = 22;

    const empColor = settingsRef.current.skin === 'trans' ? '#5BCEFA' : '#06b6d4';
    shockwavesRef.current.push({
      x: player.x,
      y: player.y,
      radius: 20,
      maxRadius: CANVAS_WIDTH * 1.2,
      color: empColor,
    });

    // Destroy all current hazards
    const destroyedCount = obstaclesRef.current.length;
    obstaclesRef.current.forEach((obs) => {
      createExplosion(obs.x, obs.y, obs.color, 16, 'spark');
    });
    obstaclesRef.current = [];

    // Damage boss if active
    if (bossRef.current && bossRef.current.active) {
      bossRef.current.hp -= 15;
      createExplosion(bossRef.current.x, bossRef.current.y, '#ef4444', 25, 'spark');
    }

    addFloatingText('EMP SHOCKWAVE!', player.x, player.y - 40, empColor, 1.3);
    setStats((prev) => ({
      ...prev,
      score: prev.score + destroyedCount * 25 * prev.multiplier,
      enemiesDestroyed: prev.enemiesDestroyed + destroyedCount,
    }));
  }, []);

  // Trigger Hyper-Warp Dash
  const triggerDash = useCallback(() => {
    const player = playerRef.current;
    if (player.dashCooldown > 0) return;

    sound.playDash();
    player.dashCooldown = 2.8;
    player.dashActiveTimer = 0.22;
    player.invulnerableTimer = 0.35;

    // Dash direction based on last velocity or keys
    let dir = 0;
    if (keysDownRef.current['arrowleft'] || keysDownRef.current['a']) dir = -1;
    else if (keysDownRef.current['arrowright'] || keysDownRef.current['d']) dir = 1;
    else dir = player.vx >= 0 ? 1 : -1;

    const dashDist = 120 * dir;
    const targetX = Math.max(30, Math.min(CANVAS_WIDTH - 30, player.x + dashDist));

    // Create ghost trail echoes along the path
    const dashSteps = 5;
    for (let s = 1; s <= dashSteps; s++) {
      const stepX = player.x + (targetX - player.x) * (s / dashSteps);
      player.trail.push({
        x: stepX,
        y: player.y,
        alpha: 0.85,
        color: settingsRef.current.skin === 'trans' ? '#F5A9B8' : '#22c55e',
      });
    }

    player.x = targetX;
    createExplosion(player.x, player.y, activeSkin.primaryColor, 18, 'spark');
    addFloatingText('WARP DASH!', player.x, player.y - 30, activeSkin.primaryColor);

    onAchievementUnlock('dash_master');
  }, [activeSkin.primaryColor, onAchievementUnlock]);

  // Connect props
  useEffect(() => {
    // expose helpers
  }, [triggerEMP, triggerDash]);

  // Helper to spawn varied powerups
  const spawnPowerUp = (x?: number, y?: number) => {
    const types: PowerUpType[] = ['star', 'star', 'shield', 'slowmo', 'blaster', 'magnet', 'emp'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    powerUpsRef.current.push({
      id: nextIdRef.current++,
      x: x !== undefined ? x : 40 + Math.random() * (CANVAS_WIDTH - 80),
      y: y !== undefined ? y : -30,
      size: 22,
      type: chosenType,
      speedY: 2.1,
      pulse: 0,
    });
  };

  // Add floating text
  const addFloatingText = (
    text: string,
    x: number,
    y: number,
    color: string,
    scale: number = 1.0
  ) => {
    floatingTextsRef.current.push({
      id: nextIdRef.current++,
      x,
      y,
      text,
      color,
      alpha: 1.0,
      vy: -1.3,
      scale,
    });
  };

  // Spawn particle explosion
  const createExplosion = (
    x: number,
    y: number,
    color: string,
    count: number = 24,
    shape: 'square' | 'circle' | 'spark' | 'star' = 'square'
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 6.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 5,
        color,
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.03,
        shape,
      });
    }
  };

  // Start / reset game
  useEffect(() => {
    if (gameStatus === 'playing') {
      resetGameEntities();
    } else if (gameStatus === 'paused' || gameStatus === 'gameover') {
      sound.stopBGM();
    }
  }, [gameStatus, resetGameEntities]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }

      keysDownRef.current[e.key.toLowerCase()] = true;
      keysDownRef.current[e.code] = true;

      // Abilities
      if (gameStatus === 'playing') {
        if (e.code === 'Space' || e.key === 'Shift') {
          triggerDash();
        }
        if (e.key === 'q' || e.key === 'Q' || e.key === 'b' || e.key === 'B') {
          triggerEMP();
        }
      }

      // Pause toggle
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameStatus === 'playing') {
          setGameStatus('paused');
          sound.playClick();
        } else if (gameStatus === 'paused') {
          setGameStatus('playing');
          sound.playClick();
        }
      }

      // Start / restart
      if (e.code === 'Enter') {
        if (gameStatus === 'idle' || gameStatus === 'gameover') {
          setGameStatus('playing');
          sound.playClick();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.key.toLowerCase()] = false;
      keysDownRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStatus, setGameStatus, triggerDash, triggerEMP]);

  // Pointer / Touch / Mouse Handling
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const canvasX = (e.clientX - rect.left) * scaleX;
    mouseTargetXRef.current = Math.max(
      playerRef.current.width / 2,
      Math.min(CANVAS_WIDTH - playerRef.current.width / 2, canvasX)
    );
  };

  const handlePointerLeave = () => {
    mouseTargetXRef.current = null;
  };

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const player = playerRef.current;
      const keys = keysDownRef.current;

      // 1. UPDATE GAME STATE (If Playing)
      if (gameStatus === 'playing') {
        // Slow-mo decay
        const slowMoActive = slowMoTimerRef.current > 0;
        if (slowMoActive) {
          slowMoTimerRef.current -= dt;
        }

        // Blaster timer decay
        if (player.blasterTimer > 0) {
          player.blasterTimer -= dt;
          blasterFireTimerRef.current += dt;
          if (blasterFireTimerRef.current >= 0.15) {
            blasterFireTimerRef.current = 0;
            sound.playLaser();
            const laserColor = settingsRef.current.skin === 'trans' ? '#F5A9B8' : '#38bdf8';
            lasersRef.current.push(
              { id: nextIdRef.current++, x: player.x - 10, y: player.y - 12, vy: -14, color: laserColor, width: 3.5, height: 16 },
              { id: nextIdRef.current++, x: player.x + 10, y: player.y - 12, vy: -14, color: laserColor, width: 3.5, height: 16 }
            );
          }
        }

        // Magnet timer decay
        if (player.magnetTimer > 0) {
          player.magnetTimer -= dt;
        }

        // Dash timers
        if (player.dashCooldown > 0) {
          player.dashCooldown -= dt;
        }
        if (player.dashActiveTimer > 0) {
          player.dashActiveTimer -= dt;
        }

        // Invulnerable timer decay
        if (player.invulnerableTimer > 0) {
          player.invulnerableTimer -= dt;
        }

        // Screen shake decay
        if (screenShakeRef.current > 0) {
          screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
        }

        // Background grid progression
        gridOffsetYRef.current = (gridOffsetYRef.current + (slowMoActive ? 60 : 160) * dt) % 40;

        // Player movement
        let moveDir = 0;
        if (keys['arrowleft'] || keys['keya'] || keys['a']) moveDir -= 1;
        if (keys['arrowright'] || keys['keyd'] || keys['d']) moveDir += 1;

        if (mouseTargetXRef.current !== null) {
          const dx = mouseTargetXRef.current - player.x;
          player.x += dx * 0.28;
          player.vx = dx * 0.2;
        } else {
          if (moveDir !== 0) {
            player.vx = moveDir * player.speed;
          } else {
            player.vx *= 0.74; // Friction
          }
          player.x += player.vx;
        }

        // Arena boundary clamping
        const halfW = player.width / 2;
        if (player.x < halfW + 12) {
          player.x = halfW + 12;
          player.vx = 0;
        } else if (player.x > CANVAS_WIDTH - halfW - 12) {
          player.x = CANVAS_WIDTH - halfW - 12;
          player.vx = 0;
        }

        // Player trail record (with skin-specific color cycling)
        const isTransSkin = settingsRef.current.skin === 'trans';
        let currentTrailColor = activeSkin.trailColor;
        if (isTransSkin) {
          const transPalette = ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8'];
          currentTrailColor = transPalette[Math.floor(Date.now() / 120) % transPalette.length];
        }

        player.trail.push({ x: player.x, y: player.y, alpha: 0.75, color: currentTrailColor });
        if (player.trail.length > 9) {
          player.trail.shift();
        }

        // Thruster sparks beneath player
        if (Math.random() < 0.8) {
          particlesRef.current.push({
            x: player.x + (Math.random() - 0.5) * 14,
            y: player.y + player.height / 2 + 2,
            vx: (Math.random() - 0.5) * 1.6,
            vy: 2 + Math.random() * 3.8,
            size: 1.5 + Math.random() * 2.8,
            color: isTransSkin ? (Math.random() > 0.5 ? '#5BCEFA' : '#F5A9B8') : activeSkin.primaryColor,
            alpha: 0.9,
            decay: 0.05,
            shape: isTransSkin ? 'star' : 'circle',
          });
        }

        // Check Trans Pride Score Achievement
        if (isTransSkin && statsRef.current.score >= 200) {
          onAchievementUnlock('trans_pride');
        }

        // Update Survival Time & Level Ramp & Boss Trigger
        setStats((prev) => {
          const newTime = prev.timeSurvived + dt;
          const targetLevel = Math.floor(prev.score / 150) + 1;
          if (targetLevel > prev.level) {
            sound.playLevelUp();
            addFloatingText(`LEVEL ${targetLevel}!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, '#00ffff', 1.3);

            // Boss spawn every 3 levels
            if (targetLevel % 3 === 0 && !bossRef.current) {
              spawnBoss();
            }
          }

          // Check First Reflex
          if (prev.obstaclesDodged >= 10) {
            onAchievementUnlock('first_blood');
          }
          if (prev.timeSurvived >= 100) {
            onAchievementUnlock('centurion');
          }

          return {
            ...prev,
            timeSurvived: newTime,
            level: targetLevel,
          };
        });

        // 2. UPDATE LASERS
        const lasers = lasersRef.current;
        for (let i = lasers.length - 1; i >= 0; i--) {
          const l = lasers[i];
          l.y += l.vy;

          // Check laser vs obstacles
          let hit = false;
          for (let j = obstaclesRef.current.length - 1; j >= 0; j--) {
            const obs = obstaclesRef.current[j];
            if (
              Math.abs(l.x - obs.x) < obs.width / 2 + l.width &&
              Math.abs(l.y - obs.y) < obs.height / 2 + l.height
            ) {
              hit = true;
              createExplosion(obs.x, obs.y, obs.color, 16, 'spark');
              sound.playExplosion();

              if (obs.hp && obs.hp > 1) {
                obs.hp--;
                addFloatingText('-1 HP', obs.x, obs.y - 15, '#ff2255');
              } else {
                // Check splitter
                if (obs.type === 'splitter') {
                  // Spawn two smaller fast shards
                  obstaclesRef.current.push(
                    {
                      id: nextIdRef.current++,
                      x: obs.x - 14,
                      y: obs.y,
                      width: 14,
                      height: 14,
                      speedY: obs.speedY * 1.3,
                      speedX: -2.2,
                      color: '#fb7185',
                      type: 'fast',
                      rotation: 0,
                      rotationSpeed: 0.1,
                      initialX: obs.x,
                      timeAlive: 0,
                      dodged: false,
                      closeCallChecked: true,
                      isSplitChild: true,
                    },
                    {
                      id: nextIdRef.current++,
                      x: obs.x + 14,
                      y: obs.y,
                      width: 14,
                      height: 14,
                      speedY: obs.speedY * 1.3,
                      speedX: 2.2,
                      color: '#fb7185',
                      type: 'fast',
                      rotation: 0,
                      rotationSpeed: -0.1,
                      initialX: obs.x,
                      timeAlive: 0,
                      dodged: false,
                      closeCallChecked: true,
                      isSplitChild: true,
                    }
                  );
                }

                obstaclesRef.current.splice(j, 1);
                spawnObstacle(false);

                setStats((prev) => {
                  const newDestroyed = prev.enemiesDestroyed + 1;
                  if (newDestroyed >= 8) onAchievementUnlock('laser_rampage');
                  return {
                    ...prev,
                    score: prev.score + 25 * prev.multiplier,
                    enemiesDestroyed: newDestroyed,
                  };
                });
                addFloatingText('+25 BLAST!', obs.x, obs.y - 15, '#38bdf8');
              }
              break;
            }
          }

          // Laser vs Boss
          if (!hit && bossRef.current && bossRef.current.active) {
            const b = bossRef.current;
            if (
              Math.abs(l.x - b.x) < b.width / 2 &&
              Math.abs(l.y - b.y) < b.height / 2
            ) {
              hit = true;
              b.hp--;
              createExplosion(l.x, l.y, '#ef4444', 8, 'spark');
              if (b.hp <= 0) {
                // Boss Defeated!
                b.active = false;
                bossRef.current = null;
                sound.playBossDefeat();
                screenShakeRef.current = 28;
                createExplosion(b.x, b.y, '#ef4444', 60, 'square');
                createExplosion(b.x, b.y, '#38bdf8', 40, 'circle');
                addFloatingText('★ BOSS SLAIN! +500 PTS ★', b.x, b.y, '#eab308', 1.5);
                onAchievementUnlock('boss_slayer');

                setStats((prev) => ({
                  ...prev,
                  score: prev.score + 500,
                  bossesDefeated: prev.bossesDefeated + 1,
                }));
              }
            }
          }

          if (hit || l.y < -30) {
            lasers.splice(i, 1);
          }
        }

        // 3. UPDATE BOSS
        if (bossRef.current && bossRef.current.active) {
          const b = bossRef.current;
          b.pulse += dt * 4;

          // Float down to target Y
          if (b.y < b.targetY) {
            b.y += (b.targetY - b.y) * 0.05;
          } else {
            // Sweep side to side
            b.x += b.moveDir * 2.8;
            if (b.x < 100) b.moveDir = 1;
            if (b.x > CANVAS_WIDTH - 100) b.moveDir = -1;

            // Attack shoot pattern
            b.attackTimer += dt;
            if (b.attackTimer >= 1.6) {
              b.attackTimer = 0;
              // Drop 2 firebombs
              obstaclesRef.current.push(
                {
                  id: nextIdRef.current++,
                  x: b.x - 35,
                  y: b.y + 20,
                  width: 22,
                  height: 22,
                  speedY: 4.2,
                  speedX: -1.2,
                  color: '#ef4444',
                  type: 'standard',
                  rotation: 0,
                  rotationSpeed: 0.1,
                  initialX: b.x - 35,
                  timeAlive: 0,
                  dodged: false,
                  closeCallChecked: false,
                },
                {
                  id: nextIdRef.current++,
                  x: b.x + 35,
                  y: b.y + 20,
                  width: 22,
                  height: 22,
                  speedY: 4.2,
                  speedX: 1.2,
                  color: '#ef4444',
                  type: 'standard',
                  rotation: 0,
                  rotationSpeed: -0.1,
                  initialX: b.x + 35,
                  timeAlive: 0,
                  dodged: false,
                  closeCallChecked: false,
                }
              );
            }
          }
        }

        // 4. UPDATE OBSTACLES
        const speedFactor = slowMoActive ? 0.45 : 1.0;
        const obstacles = obstaclesRef.current;

        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.timeAlive += dt;
          obs.y += obs.speedY * speedFactor;
          obs.rotation += obs.rotationSpeed * speedFactor;

          if (obs.type === 'zigzag') {
            obs.x += obs.speedX * speedFactor;
            if (obs.x < 30 || obs.x > CANVAS_WIDTH - 30) obs.speedX *= -1;
          } else if (obs.type === 'homing') {
            // Gently steer towards player X
            const homingDir = player.x > obs.x ? 1 : -1;
            obs.x += homingDir * 1.2 * speedFactor;
          } else if (obs.isSplitChild) {
            obs.x += obs.speedX * speedFactor;
          }

          // Check Close Call
          if (!obs.closeCallChecked && obs.y > player.y - 12 && obs.y < player.y + 40) {
            const dist = Math.abs(obs.x - player.x);
            if (dist > 23 && dist < 48) {
              obs.closeCallChecked = true;
              sound.playDodge();
              const bonusColor = isTransSkin ? '#F5A9B8' : '#facc15';
              addFloatingText('CLOSE CALL! +35', obs.x, obs.y - 15, bonusColor);

              setStats((prev) => {
                const newClose = prev.closeCalls + 1;
                const newStreak = prev.comboStreak + 1;
                if (newClose >= 5) onAchievementUnlock('close_call_ace');

                // Trigger Fever mode if combo streak >= 8
                if (newStreak >= 8 && !prev.feverActive) {
                  sound.playFever();
                  addFloatingText('★ NEON FEVER ACTIVATED! ★', CANVAS_WIDTH / 2, 220, '#facc15', 1.4);
                  onAchievementUnlock('fever_overdrive');
                }

                return {
                  ...prev,
                  score: prev.score + 35 * prev.multiplier,
                  closeCalls: newClose,
                  comboStreak: newStreak,
                  feverActive: newStreak >= 8,
                  multiplier: newStreak >= 8 ? 4 : Math.min(3, 1 + Math.floor(newStreak / 6)),
                };
              });
            }
          }

          // Check If Dodged
          if (!obs.dodged && obs.y > CANVAS_HEIGHT + 25) {
            obs.dodged = true;
            setStats((prev) => {
              const newScore = prev.score + 10 * prev.multiplier;
              const newDodged = prev.obstaclesDodged + 1;
              const newHighScore = Math.max(prev.highScore, newScore);
              if (newHighScore > prev.highScore) {
                try {
                  localStorage.setItem('neon_dodge_highscore', newHighScore.toString());
                } catch {
                  // ignore
                }
              }

              // Opportunity to spawn powerup
              if (newDodged % 8 === 0 && Math.random() < 0.65) {
                spawnPowerUp(obs.x, -20);
              }

              return {
                ...prev,
                score: newScore,
                highScore: newHighScore,
                obstaclesDodged: newDodged,
              };
            });

            obstacles.splice(i, 1);
            spawnObstacle(false);
            continue;
          }

          // 5. COLLISION DETECTION
          if (player.invulnerableTimer <= 0 && player.dashActiveTimer <= 0) {
            const halfPW = player.width * 0.42;
            const halfPH = player.height * 0.42;
            const halfOW = obs.width * 0.44;
            const halfOH = obs.height * 0.44;

            const collide =
              Math.abs(player.x - obs.x) < halfPW + halfOW &&
              Math.abs(player.y - obs.y) < halfPH + halfOH;

            if (collide) {
              if (player.shield) {
                // Shield absorbs hit
                player.shield = false;
                player.invulnerableTimer = 1.3;
                screenShakeRef.current = 14;
                sound.playShieldBreak();
                createExplosion(player.x, player.y, '#06b6d4', 30, 'spark');
                addFloatingText('SHIELD SHATTERED!', player.x, player.y - 30, '#06b6d4');
                onAchievementUnlock('shield_guardian');
                obstacles.splice(i, 1);
                spawnObstacle(false);
                continue;
              } else {
                // Fatal Crash!
                sound.playExplosion();
                sound.stopBGM();
                screenShakeRef.current = 26;
                createExplosion(player.x, player.y, activeSkin.primaryColor, 45, 'square');
                createExplosion(obs.x, obs.y, '#ef4444', 30, 'spark');

                setGameStatus('gameover');
                onGameOver(statsRef.current);
                break;
              }
            }
          }
        }

        // 6. UPDATE POWER-UPS
        const powerUps = powerUpsRef.current;
        for (let i = powerUps.length - 1; i >= 0; i--) {
          const p = powerUps[i];
          p.y += p.speedY * speedFactor;
          p.pulse += dt * 4;

          // Magnet Attraction Effect
          if (player.magnetTimer > 0) {
            const dx = player.x - p.x;
            const dy = player.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 260) {
              p.x += (dx / dist) * 7.5;
              p.y += (dy / dist) * 7.5;
            }
          }

          // Collection Check
          const dist = Math.hypot(p.x - player.x, p.y - player.y);
          if (dist < player.width / 2 + p.size / 2) {
            if (p.type === 'shield') {
              player.shield = true;
              sound.playShield();
              addFloatingText('SHIELD ONLINE!', player.x, player.y - 30, '#06b6d4');
              createExplosion(p.x, p.y, '#06b6d4', 20, 'spark');
            } else if (p.type === 'slowmo') {
              slowMoTimerRef.current = 4.5;
              sound.playSlowmo();
              addFloatingText('SLOW MOTION 4.5s!', player.x, player.y - 30, '#a855f7');
              createExplosion(p.x, p.y, '#a855f7', 25, 'circle');
            } else if (p.type === 'blaster') {
              player.blasterTimer = 6.0;
              sound.playShield();
              addFloatingText('TWIN BLASTER 6s!', player.x, player.y - 30, '#38bdf8');
              createExplosion(p.x, p.y, '#38bdf8', 25, 'spark');
            } else if (p.type === 'magnet') {
              player.magnetTimer = 8.0;
              sound.playMagnet();
              addFloatingText('ITEM MAGNET 8s!', player.x, player.y - 30, '#ec4899');
              createExplosion(p.x, p.y, '#ec4899', 25, 'circle');
            } else if (p.type === 'emp') {
              player.empCharges = Math.min(3, player.empCharges + 1);
              sound.playLevelUp();
              addFloatingText('+1 EMP BOMB!', player.x, player.y - 30, '#06b6d4');
              createExplosion(p.x, p.y, '#06b6d4', 30, 'star');
            } else if (p.type === 'star') {
              sound.playStar();
              const starBonusColor = isTransSkin ? '#F5A9B8' : '#eab308';
              addFloatingText('+100 BONUS STAR!', player.x, player.y - 30, starBonusColor);
              createExplosion(p.x, p.y, '#eab308', 25, 'spark');
              setStats((prev) => ({
                ...prev,
                score: prev.score + 100 * prev.multiplier,
                starsCollected: prev.starsCollected + 1,
                comboStreak: prev.comboStreak + 2,
              }));
            }
            powerUps.splice(i, 1);
            continue;
          }

          if (p.y > CANVAS_HEIGHT + 30) {
            powerUps.splice(i, 1);
          }
        }

        // Ensure minimum obstacle count is maintained
        const desiredCount =
          settings.difficulty === 'casual' ? 6 : settings.difficulty === 'arcade' ? 8 : 11;
        while (obstaclesRef.current.length < desiredCount) {
          spawnObstacle(false);
        }
      }

      // 7. UPDATE SHOCKWAVES & PARTICLES
      const shockwaves = shockwavesRef.current;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 24;
        if (sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) particles.splice(i, 1);
      }

      const floatingTexts = floatingTextsRef.current;
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.018;
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
      }

      // 8. RENDER CANVAS
      ctx.save();

      // Screen shake transform
      if (settings.screenShakeEnabled && screenShakeRef.current > 0) {
        const mag = screenShakeRef.current;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      // Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGrad.addColorStop(0, activeTheme.bgGradient[0]);
      bgGrad.addColorStop(1, activeTheme.bgGradient[1]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Retro Cyber Grid
      ctx.strokeStyle = activeTheme.gridColor;
      ctx.lineWidth = 1;
      const gridCols = 16;
      const colStep = CANVAS_WIDTH / gridCols;
      for (let c = 0; c <= gridCols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * colStep, 0);
        ctx.lineTo(c * colStep, CANVAS_HEIGHT);
        ctx.stroke();
      }

      const gridOffsetY = gridOffsetYRef.current;
      for (let y = gridOffsetY; y < CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Arena Border Rails
      const bloom = settings.bloomIntensity === 'high';
      ctx.save();
      if (bloom) {
        ctx.shadowColor = activeTheme.railColor;
        ctx.shadowBlur = 12;
      }
      ctx.strokeStyle = activeTheme.railColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(8, CANVAS_HEIGHT);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH - 8, 0);
      ctx.lineTo(CANVAS_WIDTH - 8, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.restore();

      // Threat Radar Warning Markers at Top
      obstaclesRef.current.forEach((obs) => {
        if (obs.y < 0 && (obs.type === 'fast' || obs.type === 'huge' || obs.type === 'homing')) {
          ctx.save();
          ctx.fillStyle = obs.color;
          ctx.beginPath();
          ctx.moveTo(obs.x, 10);
          ctx.lineTo(obs.x - 7, 2);
          ctx.lineTo(obs.x + 7, 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });

      // Draw Shockwaves
      shockwavesRef.current.forEach((sw) => {
        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
        if (bloom) {
          ctx.shadowColor = sw.color;
          ctx.shadowBlur = 20;
        }
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Draw Lasers
      lasersRef.current.forEach((l) => {
        ctx.save();
        if (bloom) {
          ctx.shadowColor = l.color;
          ctx.shadowBlur = 12;
        }
        ctx.fillStyle = l.color;
        ctx.fillRect(l.x - l.width / 2, l.y, l.width, l.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(l.x - 1, l.y + 2, 2, l.height - 4);
        ctx.restore();
      });

      // Draw Boss
      if (bossRef.current && bossRef.current.active) {
        const b = bossRef.current;
        ctx.save();
        ctx.translate(b.x, b.y);

        if (bloom) {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 20;
        }

        // Boss Hull
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(0, b.height / 2 + 10);
        ctx.lineTo(b.width / 2, -b.height / 2);
        ctx.lineTo(-b.width / 2, -b.height / 2);
        ctx.closePath();
        ctx.fill();

        // Glowing core
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, 14 + Math.sin(b.pulse) * 3, 0, Math.PI * 2);
        ctx.fill();

        // HP Bar
        ctx.restore();
        ctx.save();
        const hpPercent = Math.max(0, b.hp / b.maxHp);
        const hpBarW = 160;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(b.x - hpBarW / 2, b.y - b.height / 2 - 16, hpBarW, 8);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(b.x - hpBarW / 2, b.y - b.height / 2 - 16, hpBarW * hpPercent, 8);
        ctx.strokeStyle = '#f87171';
        ctx.strokeRect(b.x - hpBarW / 2, b.y - b.height / 2 - 16, hpBarW, 8);
        ctx.restore();
      }

      // Draw Obstacles
      obstaclesRef.current.forEach((obs) => {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        ctx.rotate(obs.rotation);

        if (bloom) {
          ctx.shadowColor = obs.color;
          ctx.shadowBlur = 14;
        }

        ctx.fillStyle = obs.color;
        const hw = obs.width / 2;
        const hh = obs.height / 2;

        ctx.beginPath();
        if (obs.type === 'fast') {
          ctx.moveTo(0, -hh);
          ctx.lineTo(hw, 0);
          ctx.lineTo(0, hh);
          ctx.lineTo(-hw, 0);
          ctx.closePath();
        } else if (obs.type === 'homing') {
          // Spiky Mine shape
          ctx.roundRect(-hw, -hh, obs.width, obs.height, 6);
        } else {
          ctx.roundRect(-hw, -hh, obs.width, obs.height, 4);
        }
        ctx.fill();

        // White core highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-hw * 0.4, -hh * 0.4, obs.width * 0.4, obs.height * 0.4, 2);
        ctx.fill();

        ctx.restore();
      });

      // Draw Power-Ups
      powerUpsRef.current.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        const scale = 1 + Math.sin(p.pulse) * 0.12;
        ctx.scale(scale, scale);

        if (p.type === 'shield') {
          if (bloom) {
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 16;
          }
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'star') {
          if (bloom) {
            ctx.shadowColor = '#eab308';
            ctx.shadowBlur = 16;
          }
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          const r1 = p.size / 2;
          const r2 = p.size / 5;
          for (let s = 0; s < 8; s++) {
            const rad = (s * Math.PI) / 4;
            const r = s % 2 === 0 ? r1 : r2;
            const px = Math.cos(rad) * r;
            const py = Math.sin(rad) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'blaster') {
          if (bloom) {
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 16;
          }
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-p.size / 3, -p.size / 3, (p.size * 2) / 3, (p.size * 2) / 3);
        } else if (p.type === 'magnet') {
          if (bloom) {
            ctx.shadowColor = '#ec4899';
            ctx.shadowBlur = 16;
          }
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI);
          ctx.stroke();
        } else if (p.type === 'emp') {
          if (bloom) {
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 18;
          }
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'slowmo') {
          if (bloom) {
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 16;
          }
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Draw Player (with Skin Customization & Trans Pride Stripes)
      if (gameStatus !== 'gameover') {
        // Player trail
        player.trail.forEach((t) => {
          ctx.save();
          ctx.fillStyle = t.color || activeSkin.trailColor;
          ctx.globalAlpha = t.alpha * 0.35;
          ctx.fillRect(
            t.x - player.width / 2 + 3,
            t.y - player.height / 2 + 3,
            player.width - 6,
            player.height - 6
          );
          ctx.restore();
        });

        const isInvulnerable = player.invulnerableTimer > 0;
        const visible = !isInvulnerable || Math.floor(player.invulnerableTimer * 18) % 2 === 0;

        if (visible) {
          ctx.save();
          ctx.translate(player.x, player.y);

          // Forcefield shield bubble
          if (player.shield) {
            ctx.save();
            const shieldColor = settingsRef.current.skin === 'trans' ? '#F5A9B8' : '#06b6d4';
            ctx.strokeStyle = shieldColor;
            ctx.lineWidth = 2.2;
            if (bloom) {
              ctx.shadowColor = shieldColor;
              ctx.shadowBlur = 20;
            }
            ctx.fillStyle = 'rgba(91, 206, 250, 0.2)';
            ctx.beginPath();
            ctx.arc(0, 0, player.width * 0.95, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }

          // Magnet Attraction Aura
          if (player.magnetTimer > 0) {
            ctx.save();
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 45, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // PLAYER SHIP DRAWING BY SKIN
          const hw = player.width / 2;
          const hh = player.height / 2;

          if (settingsRef.current.skin === 'trans') {
            // TRANS PRIDE STYLE: 3 Official Stripes (Pastel Blue #5BCEFA, Pink #F5A9B8, White #FFFFFF)
            if (bloom) {
              ctx.shadowColor = '#5BCEFA';
              ctx.shadowBlur = 22;
            }

            // Outer hull
            ctx.fillStyle = '#5BCEFA'; // Pastel blue
            ctx.beginPath();
            ctx.roundRect(-hw, -hh, player.width, player.height, 4);
            ctx.fill();

            // Middle Pink Stripe
            ctx.fillStyle = '#F5A9B8'; // Pastel pink
            ctx.fillRect(-hw, -hh * 0.4, player.width, player.height * 0.4);

            // Center White Core
            ctx.fillStyle = '#FFFFFF'; // White
            ctx.beginPath();
            ctx.roundRect(-hw * 0.4, -hh * 0.2, player.width * 0.4, player.height * 0.4, 2);
            ctx.fill();
          } else if (settingsRef.current.skin === 'phoenix') {
            // Solar Phoenix
            if (bloom) {
              ctx.shadowColor = '#f59e0b';
              ctx.shadowBlur = 20;
            }
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.roundRect(-hw, -hh, player.width, player.height, 4);
            ctx.fill();

            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-hw * 0.4, -hh * 0.4, player.width * 0.4, player.height * 0.4);
          } else if (settingsRef.current.skin === 'cyberpunk') {
            // Cyberpunk Ronin
            if (bloom) {
              ctx.shadowColor = '#a855f7';
              ctx.shadowBlur = 20;
            }
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.roundRect(-hw, -hh, player.width, player.height, 4);
            ctx.fill();

            ctx.fillStyle = '#ec4899';
            ctx.fillRect(-hw * 0.45, -hh * 0.45, player.width * 0.45, player.height * 0.45);
          } else {
            // Classic Neon Lime
            if (bloom) {
              ctx.shadowColor = activeSkin.glowColor;
              ctx.shadowBlur = 18;
            }
            ctx.fillStyle = activeSkin.primaryColor;
            ctx.beginPath();
            ctx.roundRect(-hw, -hh, player.width, player.height, 4);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(-hw * 0.45, -hh * 0.45, player.width * 0.45, player.height * 0.45, 2);
            ctx.fill();
          }

          // Dash Cooldown Meter Indicator above player
          if (player.dashCooldown > 0) {
            const cooldownPct = 1 - player.dashCooldown / 2.8;
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.fillRect(-hw, -hh - 8, player.width, 3);
            ctx.fillStyle = activeSkin.primaryColor;
            ctx.fillRect(-hw, -hh - 8, player.width * cooldownPct, 3);
          }

          ctx.restore();
        }
      }

      // Draw Particles
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'spark') {
          ctx.fillRect(p.x - p.size, p.y - 0.5, p.size * 2, 1);
        } else if (p.shape === 'star') {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.restore();
      });

      // Draw Floating Text Popups
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `bold ${Math.round(15 * (ft.scale || 1))}px Orbitron, monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        if (bloom) {
          ctx.shadowColor = ft.color;
          ctx.shadowBlur = 10;
        }
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // Fever Mode Border Pulse
      if (statsRef.current.feverActive) {
        ctx.save();
        const feverGlow = 0.5 + Math.sin(Date.now() / 150) * 0.3;
        ctx.strokeStyle = `rgba(250, 204, 21, ${feverGlow})`;
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, CANVAS_WIDTH - 6, CANVAS_HEIGHT - 6);
        ctx.restore();
      }

      ctx.restore(); // Restore screen shake

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    gameStatus,
    settings,
    setStats,
    onGameOver,
    activeSkin,
    activeTheme,
    onAchievementUnlock,
  ]);

  return (
    <div
      id="neon-game-container"
      className="relative w-full max-w-[800px] aspect-[4/3] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl flex items-center justify-center select-none"
    >
      <canvas
        id="neon-canvas"
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="w-full h-full object-contain cursor-crosshair touch-none"
      />

      {/* Optional CRT Scanlines Layer */}
      {settings.crtFilter && (
        <div className="absolute inset-0 crt-scanlines pointer-events-none rounded-xl" />
      )}

      {/* In-Game Active Ability Badges Overlay (Dash & EMP) */}
      {gameStatus === 'playing' && (
        <div className="absolute top-3 right-4 flex items-center gap-2 pointer-events-none">
          {/* Dash Ready Badge */}
          <div
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-arcade font-bold flex items-center gap-1.5 transition-all ${
              playerRef.current.dashCooldown <= 0
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
            }`}
          >
            <span>DASH [SPACE]</span>
          </div>

          {/* EMP Bombs Count */}
          <div
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-arcade font-bold flex items-center gap-1.5 transition-all ${
              playerRef.current.empCharges > 0
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
            }`}
          >
            <span>EMP x{playerRef.current.empCharges} [Q]</span>
          </div>
        </div>
      )}

      {/* Idle / Start Screen Overlay */}
      {gameStatus === 'idle' && (
        <div
          id="neon-idle-screen"
          className="absolute inset-0 bg-neutral-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Arcade Expansion 2.0
          </div>

          <h1 className="text-4xl md:text-5xl font-arcade font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 tracking-wider mb-2">
            NEON DODGE
          </h1>
          <p className="text-neutral-400 text-sm md:text-base max-w-md mb-6">
            Dodge falling hazards, shoot lasers, unleash EMP bombs, battle the Dreadnought Boss, and equip custom styles like the Trans Pride Cruiser!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="start-game-btn"
              onClick={() => {
                setGameStatus('playing');
                sound.playClick();
              }}
              className="px-8 py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-arcade font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(34,197,94,0.45)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)] hover:scale-105 active:scale-95"
            >
              Launch Mission [SPACE]
            </button>

            {/* Geometry Dash Demon List Button (Pointercrate API) */}
            <button
              id="main-menu-gd-demonlist-btn"
              onClick={() => {
                sound.playClick();
                onOpenDemonList?.();
              }}
              title="View the Geometry Dash Demon List (Main & Extended List)"
              className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-red-600/30 via-orange-600/30 to-amber-600/30 hover:from-red-600/50 hover:via-orange-600/50 hover:to-amber-600/50 border border-red-500/60 hover:border-red-400 text-red-200 hover:text-white font-arcade font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Flame size={16} className="text-orange-400 animate-pulse" />
              <span>GD Demon List</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/40 text-white font-mono border border-red-500/50">
                Pointercrate
              </span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-3 max-w-lg w-full text-xs text-neutral-400">
            <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col items-center">
              <span className="font-bold text-emerald-400 mb-1">STEER</span>
              <span>Left / Right / Mouse</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col items-center">
              <span className="font-bold text-cyan-400 mb-1">DASH</span>
              <span>Space / Shift</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col items-center">
              <span className="font-bold text-blue-400 mb-1">EMP BOMB</span>
              <span>Q / B Key</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col items-center">
              <span className="font-bold text-pink-400 mb-1">TRANS STYLE</span>
              <span>Pride Hull & Trail</span>
            </div>
          </div>
        </div>
      )}

      {/* Paused Screen Overlay */}
      {gameStatus === 'paused' && (
        <div
          id="neon-paused-screen"
          className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200"
        >
          <h2 className="text-3xl font-arcade font-extrabold text-cyan-400 tracking-wider mb-2">
            GAME PAUSED
          </h2>
          <p className="text-neutral-400 text-sm mb-6">Press P or Resume to continue</p>
          <button
            id="resume-game-btn"
            onClick={() => {
              setGameStatus('playing');
              sound.playClick();
            }}
            className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-arcade font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95"
          >
            Resume Mission
          </button>
        </div>
      )}

      {/* Touch / Mobile Virtual Controls */}
      {gameStatus === 'playing' && (
        <div className="md:hidden absolute bottom-3 inset-x-3 flex justify-between items-center pointer-events-auto">
          <div className="flex gap-2">
            <button
              id="touch-left-btn"
              onPointerDown={() => {
                keysDownRef.current['arrowleft'] = true;
              }}
              onPointerUp={() => {
                keysDownRef.current['arrowleft'] = false;
              }}
              onPointerLeave={() => {
                keysDownRef.current['arrowleft'] = false;
              }}
              className="w-14 h-14 rounded-xl bg-neutral-900/80 border border-emerald-500/40 active:bg-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-bold shadow-lg"
            >
              ◀
            </button>
            <button
              id="touch-right-btn"
              onPointerDown={() => {
                keysDownRef.current['arrowright'] = true;
              }}
              onPointerUp={() => {
                keysDownRef.current['arrowright'] = false;
              }}
              onPointerLeave={() => {
                keysDownRef.current['arrowright'] = false;
              }}
              className="w-14 h-14 rounded-xl bg-neutral-900/80 border border-emerald-500/40 active:bg-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-bold shadow-lg"
            >
              ▶
            </button>
          </div>

          <div className="flex gap-2">
            <button
              id="touch-dash-btn"
              onClick={triggerDash}
              className="w-14 h-14 rounded-xl bg-emerald-500/20 border border-emerald-500/60 active:bg-emerald-500/40 flex flex-col items-center justify-center text-emerald-300 text-xs font-arcade font-bold shadow-lg"
            >
              <span>DASH</span>
            </button>
            <button
              id="touch-emp-btn"
              onClick={triggerEMP}
              className="w-14 h-14 rounded-xl bg-cyan-500/20 border border-cyan-500/60 active:bg-cyan-500/40 flex flex-col items-center justify-center text-cyan-300 text-xs font-arcade font-bold shadow-lg"
            >
              <span>EMP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
