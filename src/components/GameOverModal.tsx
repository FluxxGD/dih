import React, { useEffect, useState } from 'react';
import { GameStats } from '../types';
import { Trophy, Zap, Flame, RotateCcw, Clock, Sparkles, Share2, Check, Crosshair } from 'lucide-react';
import { sound } from '../services/sound';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onOpenPythonCode: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onOpenPythonCode,
}) => {
  const [copied, setCopied] = useState(false);
  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  useEffect(() => {
    // Keyboard listener for Space/Enter to restart
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    sound.playStar();
    const shareText = `🎮 NEON DODGE 2.0 ARCADE RUN 🏳️‍⚧️\n⭐ Final Score: ${stats.score.toLocaleString()}\n⚡ Hazards Dodged: ${stats.obstaclesDodged}\n💥 Enemies Blasted: ${stats.enemiesDestroyed}\n🔥 Close Calls: ${stats.closeCalls}\n⏱️ Survived: ${formatTime(stats.timeSurvived)}\nCan you beat my high score?`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      id="game-over-modal"
      className="absolute inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Header Badge */}
        {isNewHighScore ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2 animate-bounce">
            <Trophy size={14} />
            New All-Time High Score!
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            Hazard Collision
          </div>
        )}

        <h2 className="text-3xl md:text-4xl font-arcade font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-pink-500 tracking-wider mb-1">
          GAME OVER
        </h2>

        {/* Final Score Hero */}
        <div className="my-3 py-3 px-6 rounded-xl bg-neutral-950/80 border border-neutral-800 w-full">
          <div className="text-xs uppercase font-semibold tracking-wider text-neutral-400">
            Final Score
          </div>
          <div
            id="modal-final-score"
            className="text-4xl md:text-5xl font-arcade font-black text-white tracking-tight mt-1"
          >
            {stats.score.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex items-center justify-center gap-2">
            <span>High: {stats.highScore.toLocaleString()}</span>
            &bull;
            <span>Level {stats.level}</span>
            {stats.bossesDefeated > 0 && (
              <>
                &bull;
                <span className="text-yellow-400 font-bold">
                  👑 {stats.bossesDefeated} Boss Slain
                </span>
              </>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-2 w-full mb-5 text-left">
          <div className="p-2.5 rounded-lg bg-neutral-950/50 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] uppercase font-bold">
              <Zap size={13} />
              Dodged
            </div>
            <div className="font-arcade text-base font-bold text-white mt-0.5">
              {stats.obstaclesDodged}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/50 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-yellow-400 text-[10px] uppercase font-bold">
              <Flame size={13} />
              Close Calls
            </div>
            <div className="font-arcade text-base font-bold text-white mt-0.5">
              {stats.closeCalls}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/50 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] uppercase font-bold">
              <Crosshair size={13} />
              Blasted
            </div>
            <div className="font-arcade text-base font-bold text-white mt-0.5">
              {stats.enemiesDestroyed}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/50 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] uppercase font-bold">
              <Sparkles size={13} />
              Stars
            </div>
            <div className="font-arcade text-base font-bold text-white mt-0.5">
              {stats.starsCollected}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/50 border border-neutral-800/80 col-span-2">
            <div className="flex items-center gap-1.5 text-purple-400 text-[10px] uppercase font-bold">
              <Clock size={13} />
              Time Survived
            </div>
            <div className="font-arcade text-base font-bold text-white mt-0.5">
              {formatTime(stats.timeSurvived)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full">
          <button
            id="modal-play-again-btn"
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-arcade font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Play Again [SPACE]
          </button>

          <div className="flex gap-2">
            <button
              id="modal-share-btn"
              onClick={handleShare}
              className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Score Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share Score</span>
                </>
              )}
            </button>

            <button
              id="modal-view-python-btn"
              onClick={() => {
                sound.playClick();
                onOpenPythonCode();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold tracking-wide transition-colors"
            >
              Python Script
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
