import React from 'react';
import { X, Trophy, CheckCircle2, Circle, Target, Flame } from 'lucide-react';
import { Achievement, Mission, GameStats } from '../types';
import { sound } from '../services/sound';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  missions: Mission[];
  stats: GameStats;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  missions,
  stats,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div
      id="achievements-modal"
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-lg font-arcade font-bold text-white tracking-wide">
                Trophies & Field Missions
              </h3>
              <p className="text-xs text-neutral-400">
                Unlocked: {unlockedCount} / {achievements.length} Badges
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Missions Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Target size={14} className="text-cyan-400" />
                Active Field Missions
              </label>
              <span className="text-[11px] text-cyan-400 font-mono font-semibold">
                Daily Objectives
              </span>
            </div>

            <div className="grid gap-2.5">
              {missions.map((m) => {
                const progressPct = Math.min(100, Math.round((m.progress / m.target) * 100));
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-white">{m.title}</span>
                        <span className="text-neutral-400 font-mono">
                          {m.progress} / {m.target}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <span className="text-[11px] font-arcade font-bold text-yellow-400">
                        {m.rewardText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Trophy size={14} className="text-yellow-400" />
                Arcade Trophies ({unlockedCount}/{achievements.length})
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                    ach.unlocked
                      ? 'bg-neutral-800/80 border-yellow-500/40 shadow-[0_0_12px_rgba(234,179,8,0.15)]'
                      : 'bg-neutral-950/40 border-neutral-800/80 opacity-65'
                  }`}
                >
                  <div className="text-2xl select-none">{ach.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-arcade font-bold truncate ${
                          ach.unlocked ? 'text-white' : 'text-neutral-400'
                        }`}
                      >
                        {ach.title}
                      </h4>
                      {ach.unlocked ? (
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Circle size={14} className="text-neutral-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/50 flex justify-between items-center text-xs text-neutral-400">
          <span>Overall Reflex Mastery: {Math.round((unlockedCount / achievements.length) * 100)}%</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
