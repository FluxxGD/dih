import React from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Sliders,
  Shield,
  Zap,
  Flame,
  Monitor,
  Sparkles,
  Trash2,
  Activity,
} from 'lucide-react';
import { GameSettings, DifficultyMode } from '../types';
import { sound } from '../services/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  onResetHighScore: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  onResetHighScore,
}) => {
  if (!isOpen) return null;

  const handleDifficultyChange = (mode: DifficultyMode) => {
    sound.playClick();
    setSettings((prev) => ({ ...prev, difficulty: mode }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    sound.volume = val;
    setSettings((prev) => ({ ...prev, volume: val }));
  };

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
    if (next) sound.startBGM();
    else sound.stopBGM();
  };

  const toggleCRT = () => {
    sound.playClick();
    setSettings((prev) => ({ ...prev, crtFilter: !prev.crtFilter }));
  };

  const toggleScreenShake = () => {
    sound.playClick();
    setSettings((prev) => ({ ...prev, screenShakeEnabled: !prev.screenShakeEnabled }));
  };

  const toggleBloom = () => {
    sound.playClick();
    setSettings((prev) => ({
      ...prev,
      bloomIntensity: prev.bloomIntensity === 'high' ? 'low' : 'high',
    }));
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-emerald-400" />
            <h3 className="font-arcade text-base font-bold text-white tracking-wide">
              Game Settings & Audio
            </h3>
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

        {/* Difficulty Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold tracking-wider text-neutral-400">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDifficultyChange('casual')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                settings.difficulty === 'casual'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.25)]'
                  : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Shield size={18} />
              <span className="font-arcade text-xs font-bold">Casual</span>
              <span className="text-[10px] text-neutral-400">Shield start</span>
            </button>

            <button
              onClick={() => handleDifficultyChange('arcade')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                settings.difficulty === 'arcade'
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Zap size={18} />
              <span className="font-arcade text-xs font-bold">Arcade</span>
              <span className="text-[10px] text-neutral-400">Classic</span>
            </button>

            <button
              onClick={() => handleDifficultyChange('insane')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                settings.difficulty === 'insane'
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Flame size={18} />
              <span className="font-arcade text-xs font-bold">Insane</span>
              <span className="text-[10px] text-neutral-400">Fast & lethal</span>
            </button>
          </div>
        </div>

        {/* Audio Volume & Synthwave Music */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
              {settings.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              Sound Effects
            </label>
            <button
              onClick={toggleSound}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              {settings.soundEnabled ? 'Mute' : 'Enable'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={handleVolumeChange}
              disabled={!settings.soundEnabled}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none disabled:opacity-40"
            />
            <span className="text-xs font-mono text-neutral-300 w-9 text-right">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
            <div className="flex items-center gap-2">
              <Music size={16} className="text-purple-400" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white">80s Synthwave BGM</span>
                <span className="text-[10px] text-neutral-400">Procedural bass & arpeggio</span>
              </div>
            </div>
            <button
              onClick={toggleMusic}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                settings.musicEnabled
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-neutral-800 text-neutral-500'
              }`}
            >
              {settings.musicEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* Visual FX Toggles */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold tracking-wider text-neutral-400">
            Visual & Haptic Effects
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={toggleBloom}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                settings.bloomIntensity === 'high'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
              }`}
            >
              <Sparkles size={16} />
              <span className="text-xs font-medium">Glow</span>
              <span className="text-[10px] font-bold uppercase">
                {settings.bloomIntensity === 'high' ? 'High' : 'Low'}
              </span>
            </button>

            <button
              onClick={toggleCRT}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                settings.crtFilter
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                  : 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
              }`}
            >
              <Monitor size={16} />
              <span className="text-xs font-medium">CRT Scan</span>
              <span className="text-[10px] font-bold uppercase">
                {settings.crtFilter ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={toggleScreenShake}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                settings.screenShakeEnabled
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
              }`}
            >
              <Activity size={16} />
              <span className="text-xs font-medium">Shake FX</span>
              <span className="text-[10px] font-bold uppercase">
                {settings.screenShakeEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Reset High Score & Footer */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Reset saved high score to 0?')) {
                onResetHighScore();
                sound.playClick();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
            Reset High Score
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
