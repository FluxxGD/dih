import React from 'react';
import { GameStatus, GameStats, GameSettings } from '../types';
import {
  Volume2,
  VolumeX,
  Music,
  Pause,
  Play,
  Settings,
  Code2,
  RotateCcw,
  Palette,
  Trophy,
  Flame,
} from 'lucide-react';
import { sound } from '../services/sound';

interface HUDProps {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  stats: GameStats;
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  onOpenSettings: () => void;
  onOpenPythonCode: () => void;
  onOpenCustomizer: () => void;
  onOpenAchievements: () => void;
  onOpenDemonList: () => void;
  onRestart: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameStatus,
  setGameStatus,
  stats,
  settings,
  setSettings,
  onOpenSettings,
  onOpenPythonCode,
  onOpenCustomizer,
  onOpenAchievements,
  onOpenDemonList,
  onRestart,
}) => {
  const toggleSound = () => {
    const next = !settings.soundEnabled;
    sound.enabled = next;
    setSettings((prev) => ({ ...prev, soundEnabled: next }));
    if (next) sound.playClick();
  };

  const toggleMusic = () => {
    const next = !settings.musicEnabled;
    sound.musicEnabled = next;
    setSettings((prev) => ({ ...prev, musicEnabled: next }));
    if (next) {
      sound.startBGM();
    } else {
      sound.stopBGM();
    }
  };

  const toggleTransStyle = () => {
    sound.playStar();
    if (settings.skin === 'trans') {
      setSettings((prev) => ({ ...prev, skin: 'classic', theme: 'cyberCity' }));
    } else {
      setSettings((prev) => ({ ...prev, skin: 'trans', theme: 'transNebula' }));
    }
  };

  const togglePause = () => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
      sound.playClick();
    } else if (gameStatus === 'paused') {
      setGameStatus('playing');
      sound.playClick();
    }
  };

  const isTransActive = settings.skin === 'trans';

  return (
    <div id="game-hud" className="w-full max-w-[800px] flex flex-col gap-2 px-2">
      {/* Top Bar: Brand, Stats, and Controls */}
      <div className="flex items-center justify-between bg-neutral-900/85 backdrop-blur-md border border-neutral-800 rounded-xl px-3.5 py-2.5 shadow-lg">
        {/* Left: Brand & Trans Quick Toggle */}
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full transition-all ${
              isTransActive
                ? 'bg-[#5BCEFA] shadow-[0_0_10px_#5BCEFA]'
                : 'bg-emerald-400 shadow-[0_0_8px_#22c55e]'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-arcade text-sm md:text-base font-black tracking-wider text-white leading-none">
                NEON DODGE
              </h2>
              {/* Quick Trans Style Switcher */}
              <button
                id="hud-trans-toggle-btn"
                onClick={toggleTransStyle}
                title="Toggle Trans Style Skin & Nebula Theme"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                  isTransActive
                    ? 'bg-gradient-to-r from-[#5BCEFA]/30 via-[#F5A9B8]/30 to-[#5BCEFA]/30 border border-[#5BCEFA] text-[#5BCEFA] shadow-[0_0_10px_rgba(91,206,250,0.3)]'
                    : 'bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                <span>🏳️‍⚧️</span>
                <span className="hidden sm:inline">Trans Style</span>
                <span>{isTransActive ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">
              Level {stats.level} &bull; {settings.difficulty}
            </div>
          </div>
        </div>

        {/* Center: Score, High Score & Multiplier */}
        <div className="flex items-center gap-4 md:gap-7">
          <div className="text-center">
            <div className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
              Score
            </div>
            <div
              id="hud-score"
              className="font-arcade text-lg md:text-2xl font-black text-white leading-none tracking-tight"
            >
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="text-center">
            <div className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
              High
            </div>
            <div
              id="hud-highscore"
              className="font-arcade text-lg md:text-2xl font-black text-yellow-400 leading-none tracking-tight"
            >
              {stats.highScore.toLocaleString()}
            </div>
          </div>

          {stats.feverActive ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-arcade text-xs font-black animate-bounce">
              <Flame size={12} />
              FEVER x{stats.multiplier}
            </div>
          ) : stats.multiplier > 1 ? (
            <div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-arcade text-xs font-bold animate-pulse">
              x{stats.multiplier}
            </div>
          ) : null}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1 md:gap-1.5">
          {/* Pause / Resume */}
          {(gameStatus === 'playing' || gameStatus === 'paused') && (
            <button
              id="hud-pause-btn"
              onClick={togglePause}
              title={gameStatus === 'playing' ? 'Pause Game (P)' : 'Resume Game (P)'}
              className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              {gameStatus === 'playing' ? <Pause size={15} /> : <Play size={15} />}
            </button>
          )}

          {/* Quick Restart */}
          {gameStatus === 'playing' && (
            <button
              id="hud-restart-btn"
              onClick={onRestart}
              title="Restart Game (R)"
              className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              <RotateCcw size={15} />
            </button>
          )}

          {/* Synthwave BGM Music Toggle */}
          <button
            id="hud-music-btn"
            onClick={toggleMusic}
            title={settings.musicEnabled ? 'Mute 80s Synth BGM' : 'Enable 80s Synth BGM'}
            className={`p-2 rounded-lg transition-colors ${
              settings.musicEnabled
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                : 'bg-neutral-800/80 text-neutral-500'
            }`}
          >
            <Music size={15} />
          </button>

          {/* SFX Sound Toggle */}
          <button
            id="hud-sound-btn"
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Mute Sound FX' : 'Unmute Sound FX'}
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            {settings.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Garage / Styles Customizer */}
          <button
            id="hud-customizer-btn"
            onClick={onOpenCustomizer}
            title="Hangar & Craft Skins"
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-pink-400 hover:text-pink-300 transition-colors"
          >
            <Palette size={15} />
          </button>

          {/* Trophies & Achievements */}
          <button
            id="hud-achievements-btn"
            onClick={onOpenAchievements}
            title="Arcade Trophies & Missions"
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <Trophy size={15} />
          </button>

          {/* Geometry Dash Demonlist Shortcut */}
          <button
            id="hud-demonlist-btn"
            onClick={onOpenDemonList}
            title="Geometry Dash Demon List (Pointercrate API)"
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-red-400 hover:text-red-300 transition-colors"
          >
            <Flame size={15} />
          </button>

          {/* Settings */}
          <button
            id="hud-settings-btn"
            onClick={onOpenSettings}
            title="Settings & Controls"
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            <Settings size={15} />
          </button>

          {/* Python Code */}
          <button
            id="hud-python-btn"
            onClick={onOpenPythonCode}
            title="Original Python Code & Bug Fixes"
            className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide transition-all"
          >
            <Code2 size={13} />
            <span>Python</span>
          </button>
        </div>
      </div>
    </div>
  );
};
