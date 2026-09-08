/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameStatus, GameStats, GameSettings, Achievement, Mission } from './types';
import { NeonCanvas } from './components/NeonCanvas';
import { HUD } from './components/HUD';
import { GameOverModal } from './components/GameOverModal';
import { PythonCodeModal } from './components/PythonCodeModal';
import { SettingsModal } from './components/SettingsModal';
import { CustomizerModal } from './components/CustomizerModal';
import { AchievementsModal } from './components/AchievementsModal';
import { DemonListModal } from './components/DemonListModal';
import { sound } from './services/sound';
import { INITIAL_ACHIEVEMENTS, INITIAL_MISSIONS, SKINS } from './data/missionsAndAchievements';
import { Keyboard, MousePointer, Code2, Palette, Trophy, Sparkles, Flame } from 'lucide-react';

export default function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [pythonModalOpen, setPythonModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [customizerModalOpen, setCustomizerModalOpen] = useState(false);
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);
  const [demonListModalOpen, setDemonListModalOpen] = useState(false);

  // Active Achievements and Missions
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [unlockedToast, setUnlockedToast] = useState<string | null>(null);

  // Initialize Settings with Trans Style skin & Trans Nebula theme ready!
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.5,
    difficulty: 'arcade',
    controlScheme: 'keyboard',
    crtFilter: false,
    bloomIntensity: 'high',
    skin: 'trans', // User requested: Trans style
    theme: 'transNebula',
    screenShakeEnabled: true,
  });

  // Load High Score from localStorage safely
  const [stats, setStats] = useState<GameStats>(() => {
    let savedHighScore = 0;
    try {
      const stored = localStorage.getItem('neon_dodge_highscore');
      if (stored) {
        savedHighScore = parseInt(stored, 10) || 0;
      }
    } catch {
      // ignore
    }
    return {
      score: 0,
      highScore: savedHighScore,
      obstaclesDodged: 0,
      closeCalls: 0,
      starsCollected: 0,
      timeSurvived: 0,
      level: 1,
      multiplier: 1,
      comboStreak: 0,
      feverActive: false,
      enemiesDestroyed: 0,
      bossesDefeated: 0,
    };
  });

  // Unlock Achievement Helper
  const handleAchievementUnlock = useCallback((achievementId: string) => {
    setAchievements((prev) => {
      const target = prev.find((a) => a.id === achievementId);
      if (target && !target.unlocked) {
        sound.playLevelUp();
        setUnlockedToast(`🏆 Trophy Unlocked: ${target.title}!`);
        setTimeout(() => setUnlockedToast(null), 3500);

        return prev.map((a) => (a.id === achievementId ? { ...a, unlocked: true } : a));
      }
      return prev;
    });
  }, []);

  // Update Mission Progress as Stats change
  useEffect(() => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === 'm1') {
          return {
            ...m,
            progress: Math.min(m.target, stats.obstaclesDodged),
            completed: stats.obstaclesDodged >= m.target,
          };
        }
        if (m.id === 'm2') {
          return {
            ...m,
            progress: Math.min(m.target, stats.closeCalls),
            completed: stats.closeCalls >= m.target,
          };
        }
        if (m.id === 'm3') {
          return {
            ...m,
            progress: Math.min(m.target, stats.starsCollected),
            completed: stats.starsCollected >= m.target,
          };
        }
        return m;
      })
    );
  }, [stats.obstaclesDodged, stats.closeCalls, stats.starsCollected]);

  // Start or Restart game run
  const handleRestart = () => {
    sound.playClick();
    setStats((prev) => ({
      score: 0,
      highScore: prev.highScore,
      obstaclesDodged: 0,
      closeCalls: 0,
      starsCollected: 0,
      timeSurvived: 0,
      level: 1,
      multiplier: 1,
      comboStreak: 0,
      feverActive: false,
      enemiesDestroyed: 0,
      bossesDefeated: 0,
    }));
    setGameStatus('playing');
  };

  const handleResetHighScore = () => {
    try {
      localStorage.removeItem('neon_dodge_highscore');
    } catch {
      // ignore
    }
    setStats((prev) => ({ ...prev, highScore: 0 }));
  };

  const activeSkinObj = SKINS.find((s) => s.id === settings.skin) || SKINS[0];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between p-2 md:p-5 select-none relative overflow-x-hidden">
      {/* Achievement Unlock Toast Notification */}
      {unlockedToast && (
        <div className="fixed top-4 z-50 px-5 py-2.5 rounded-2xl bg-neutral-900/95 border border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-300">
          <Sparkles size={18} className="text-yellow-400 animate-spin" />
          <span className="font-arcade text-xs font-bold text-white tracking-wide">
            {unlockedToast}
          </span>
        </div>
      )}

      {/* Top HUD Bar */}
      <HUD
        gameStatus={gameStatus}
        setGameStatus={setGameStatus}
        stats={stats}
        settings={settings}
        setSettings={setSettings}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenPythonCode={() => setPythonModalOpen(true)}
        onOpenCustomizer={() => setCustomizerModalOpen(true)}
        onOpenAchievements={() => setAchievementsModalOpen(true)}
        onOpenDemonList={() => setDemonListModalOpen(true)}
        onRestart={handleRestart}
      />

      {/* Main Game Stage */}
      <div className="relative w-full flex flex-col items-center my-auto py-1.5">
        <NeonCanvas
          gameStatus={gameStatus}
          setGameStatus={setGameStatus}
          stats={stats}
          setStats={setStats}
          settings={settings}
          onGameOver={() => {
            // Stats captured
          }}
          onTriggerEMP={() => {
            // Triggered from canvas/controls
          }}
          onTriggerDash={() => {
            // Triggered from canvas/controls
          }}
          onAchievementUnlock={handleAchievementUnlock}
          onOpenDemonList={() => setDemonListModalOpen(true)}
        />

        {/* Game Over Modal */}
        {gameStatus === 'gameover' && (
          <GameOverModal
            stats={stats}
            onRestart={handleRestart}
            onOpenPythonCode={() => setPythonModalOpen(true)}
          />
        )}
      </div>

      {/* Bottom Controls / Tips Footer */}
      <footer className="w-full max-w-[800px] flex flex-wrap items-center justify-between gap-2.5 text-xs text-neutral-400 py-2 px-3 rounded-xl bg-neutral-900/50 border border-neutral-800/80 mt-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Keyboard size={14} className="text-emerald-400" />
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[10px] text-neutral-300">
                &larr; &rarr;
              </kbd>{' '}
              Steer &bull;{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[10px] text-neutral-300">
                SPACE
              </kbd>{' '}
              Dash &bull;{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[10px] text-neutral-300">
                Q
              </kbd>{' '}
              EMP
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5">
            <MousePointer size={14} className="text-cyan-400" />
            <span>Hover / Touch to guide</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Skin Label */}
          <button
            onClick={() => setCustomizerModalOpen(true)}
            className="flex items-center gap-1.5 text-neutral-300 hover:text-pink-400 transition-colors"
          >
            <Palette size={13} className="text-pink-400" />
            <span className="font-medium text-[11px]">{activeSkinObj.name}</span>
          </button>

          {/* Achievements Shortcut */}
          <button
            onClick={() => setAchievementsModalOpen(true)}
            className="flex items-center gap-1 text-neutral-300 hover:text-yellow-400 transition-colors"
          >
            <Trophy size={13} className="text-yellow-400" />
            <span className="font-medium text-[11px]">Trophies</span>
          </button>

          {/* Geometry Dash Demon List Shortcut */}
          <button
            id="footer-gd-demonlist-btn"
            onClick={() => setDemonListModalOpen(true)}
            className="flex items-center gap-1 text-neutral-300 hover:text-red-400 transition-colors"
          >
            <Flame size={13} className="text-red-400" />
            <span className="font-medium text-[11px]">GD Demon List</span>
          </button>

          {/* Python Bug Fix Inspector */}
          <button
            onClick={() => setPythonModalOpen(true)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer font-medium"
          >
            <Code2 size={13} />
            <span>Python Script & Bugs</span>
          </button>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        setSettings={setSettings}
        onResetHighScore={handleResetHighScore}
      />

      {/* Style & Trans Pride Customizer Modal */}
      <CustomizerModal
        isOpen={customizerModalOpen}
        onClose={() => setCustomizerModalOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />

      {/* Achievements & Missions Modal */}
      <AchievementsModal
        isOpen={achievementsModalOpen}
        onClose={() => setAchievementsModalOpen(false)}
        achievements={achievements}
        missions={missions}
        stats={stats}
      />

      {/* Geometry Dash Demon List Modal (Pointercrate API) */}
      <DemonListModal
        isOpen={demonListModalOpen}
        onClose={() => setDemonListModalOpen(false)}
      />

      {/* Python Source Code & Bug Fix Inspector */}
      <PythonCodeModal isOpen={pythonModalOpen} onClose={() => setPythonModalOpen(false)} />
    </main>
  );
}
