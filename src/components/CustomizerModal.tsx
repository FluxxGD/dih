import React from 'react';
import { X, Palette, Sparkles, Check } from 'lucide-react';
import { GameSettings, PlayerSkin, ArenaTheme } from '../types';
import { SKINS, ARENA_THEMES } from '../data/missionsAndAchievements';
import { sound } from '../services/sound';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
}) => {
  if (!isOpen) return null;

  const handleSelectSkin = (skinId: PlayerSkin) => {
    sound.playStar();
    setSettings((prev) => ({ ...prev, skin: skinId }));
  };

  const handleSelectTheme = (themeId: ArenaTheme) => {
    sound.playClick();
    setSettings((prev) => ({ ...prev, theme: themeId }));
  };

  return (
    <div
      id="customizer-modal"
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-lg font-arcade font-bold text-white tracking-wide">
                Hangar & Style Customizer
              </h3>
              <p className="text-xs text-neutral-400">
                Choose your craft hull, pride styles, and arena cyber atmospheres
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Featured: Trans Style Quick Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#5BCEFA]/15 via-[#F5A9B8]/15 to-[#5BCEFA]/15 border border-[#5BCEFA]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(91,206,250,0.15)]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl flex flex-col overflow-hidden border-2 border-white/60 shadow-md">
                <div className="flex-1 bg-[#5BCEFA]" />
                <div className="flex-1 bg-[#F5A9B8]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#F5A9B8]" />
                <div className="flex-1 bg-[#5BCEFA]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-arcade text-sm font-black text-white">
                    TRANS PRIDE STYLE
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-[10px] text-pink-300 font-bold">
                    OFFICIAL PALETTE
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Equips the authentic 3-striped Pastel Blue, Pink & White hull with radiant pastel stardust trails.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                handleSelectSkin('trans');
                handleSelectTheme('transNebula');
              }}
              className={`px-4 py-2 rounded-xl font-arcade font-bold text-xs uppercase tracking-wider transition-all ${
                settings.skin === 'trans'
                  ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                  : 'bg-white text-neutral-950 hover:bg-neutral-200 shadow-md hover:scale-105 active:scale-95'
              }`}
            >
              {settings.skin === 'trans' ? '✓ Equipped' : 'Equip Trans Style'}
            </button>
          </div>

          {/* Section 1: Craft Skins Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-400" />
                Select Craft Skin ({SKINS.length})
              </label>
              <span className="text-[11px] text-neutral-500">Includes Custom Particle Trails</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SKINS.map((skin) => {
                const isSelected = settings.skin === skin.id;
                return (
                  <button
                    key={skin.id}
                    onClick={() => handleSelectSkin(skin.id)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-neutral-800/90 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                          style={{ backgroundColor: skin.primaryColor }}
                        />
                        <span className="font-arcade text-xs font-bold text-white">
                          {skin.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-cyan-500 text-neutral-950 flex items-center justify-center text-xs font-bold">
                          <Check size={12} />
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500 font-semibold uppercase">
                          {skin.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2">{skin.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Arena Cyber Themes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Palette size={14} className="text-purple-400" />
                Select Arena Theme ({ARENA_THEMES.length})
              </label>
              <span className="text-[11px] text-neutral-500">Changes Canvas Grid & Atmosphere</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ARENA_THEMES.map((thm) => {
                const isSelected = settings.theme === thm.id;
                return (
                  <button
                    key={thm.id}
                    onClick={() => handleSelectTheme(thm.id)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                      isSelected
                        ? 'bg-neutral-800/90 border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                        : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-arcade text-xs font-bold text-white">{thm.name}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-purple-500 text-neutral-950 flex items-center justify-center text-xs font-bold">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">{thm.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/50 flex justify-between items-center text-xs text-neutral-400">
          <span>Active: {SKINS.find((s) => s.id === settings.skin)?.name}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-arcade font-bold text-xs uppercase tracking-wider transition-all"
          >
            Apply & Fly
          </button>
        </div>
      </div>
    </div>
  );
};
