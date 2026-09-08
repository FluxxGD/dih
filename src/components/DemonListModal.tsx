/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  DemonListItem,
  DemonDetails,
  DemonRecord,
} from '../types';
import {
  fetchPointercrateDemonList,
  fetchPointercrateDemonDetails,
  calculateDemonPoints,
  extractYouTubeId,
} from '../services/pointercrate';
import {
  X,
  Flame,
  Search,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Video,
  User,
  Users,
  Award,
  Sparkles,
  Play,
  Layers,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { sound } from '../services/sound';

interface DemonListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ListCategory = 'all' | 'main' | 'extended' | 'legacy';

export const DemonListModal: React.FC<DemonListModalProps> = ({ isOpen, onClose }) => {
  const [demons, setDemons] = useState<DemonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'cache' | 'fallback'>('live');

  // Filter & Search state
  const [activeCategory, setActiveCategory] = useState<ListCategory>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Selected Demon for Details view
  const [selectedDemon, setSelectedDemon] = useState<DemonListItem | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [demonDetails, setDemonDetails] = useState<DemonDetails | null>(null);

  // Initial fetch when opened
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async (force = false) => {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetchPointercrateDemonList(force);
        setDemons(res.demons);
        setDataSource(res.source);
      } catch (err) {
        console.error('Failed to load demonlist:', err);
        setError('Could not connect to Pointercrate API. Showing offline archive.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    if (demons.length === 0) {
      loadData(false);
    }
  }, [isOpen, demons.length]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedDemon) {
          setSelectedDemon(null);
          setDemonDetails(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedDemon, onClose]);

  // Load details when a demon is selected
  useEffect(() => {
    if (!selectedDemon) return;
    let isMounted = true;
    setDetailsLoading(true);
    setDemonDetails(null);

    fetchPointercrateDemonDetails(selectedDemon.id).then((data) => {
      if (isMounted) {
        setDemonDetails(data);
        setDetailsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDemon]);

  // Filtered demons
  const filteredDemons = useMemo(() => {
    return demons.filter((demon) => {
      // Category filter
      if (activeCategory === 'main' && (demon.position < 1 || demon.position > 75)) {
        return false;
      }
      if (activeCategory === 'extended' && (demon.position < 76 || demon.position > 150)) {
        return false;
      }
      if (activeCategory === 'legacy' && demon.position <= 150) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = demon.name.toLowerCase().includes(q);
        const matchesPublisher = demon.publisher.name.toLowerCase().includes(q);
        const matchesVerifier = demon.verifier.name.toLowerCase().includes(q);
        const matchesLevelId = demon.level_id.toString().includes(q);
        const matchesRank = `#${demon.position}` === q || demon.position.toString() === q;
        return matchesName || matchesPublisher || matchesVerifier || matchesLevelId || matchesRank;
      }

      return true;
    });
  }, [demons, activeCategory, searchQuery]);

  const handleCopyId = (levelId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(levelId.toString());
    setCopiedId(levelId);
    sound.playClick();
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleRefresh = async () => {
    sound.playClick();
    setRefreshing(true);
    try {
      const res = await fetchPointercrateDemonList(true);
      setDemons(res.demons);
      setDataSource(res.source);
    } catch {
      setError('Refresh failed. Using cached list.');
    } finally {
      setRefreshing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-2 md:p-5 animate-in fade-in duration-200">
      <div
        id="gd-demonlist-modal"
        className="w-full max-w-5xl h-[92vh] max-h-[900px] bg-neutral-900 border border-red-500/30 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col overflow-hidden text-neutral-100 relative"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3.5 bg-neutral-950/90 border-b border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <Flame size={20} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-arcade text-sm md:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-300 to-amber-300 leading-tight">
                  GEOMETRY DASH DEMON LIST
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                  Pointercrate API
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                <span>The hardest rated Geometry Dash levels in history</span>
                <span className="text-neutral-600">&bull;</span>
                <span className="text-xs">
                  {dataSource === 'live' ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Sync
                    </span>
                  ) : dataSource === 'cache' ? (
                    <span className="text-cyan-400">Cached</span>
                  ) : (
                    <span className="text-amber-400">Offline Archive</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh from Pointercrate API"
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-orange-400' : ''} />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Search Controls */}
        <div className="px-4 md:px-6 py-3 bg-neutral-950/60 border-b border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 text-xs font-bold">
            <button
              onClick={() => {
                setActiveCategory('main');
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeCategory === 'main'
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)] font-black'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Flame size={13} className={activeCategory === 'main' ? 'text-amber-200' : ''} />
              <span>Main List</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 opacity-90">#1-75</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('extended');
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeCategory === 'extended'
                  ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(217,119,6,0.5)] font-black'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers size={13} />
              <span>Extended List</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 opacity-90">#76-150</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('legacy');
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeCategory === 'legacy'
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.5)] font-black'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Award size={13} />
              <span>Legacy</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 opacity-90">#151+</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('all');
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'all'
                  ? 'bg-neutral-700 text-white font-black'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>All ({demons.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 md:max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search level, verifier, publisher, ID..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-red-500 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Demon Cards List & Detail Viewer */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
          {/* Main List Area */}
          <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-2.5 scrollbar-thin">
            {loading && demons.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-neutral-400">
                <RefreshCw size={28} className="animate-spin text-red-500" />
                <span className="font-arcade text-xs tracking-wider">
                  Contacting Pointercrate Demonlist API...
                </span>
              </div>
            ) : filteredDemons.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-2 text-neutral-400">
                <SlidersHorizontal size={24} className="text-neutral-600" />
                <span className="font-arcade text-xs">No demons found matching "{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-red-400 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredDemons.map((demon) => {
                  const points = calculateDemonPoints(demon.position);
                  const isMain = demon.position <= 75;
                  const isTop1 = demon.position === 1;
                  const isTop3 = demon.position <= 3;
                  const isTop10 = demon.position <= 10;
                  const isSelected = selectedDemon?.id === demon.id;

                  return (
                    <div
                      key={demon.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedDemon(demon);
                      }}
                      className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center overflow-hidden ${
                        isSelected
                          ? 'bg-neutral-800/95 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                          : isTop1
                          ? 'bg-gradient-to-r from-red-950/40 via-neutral-900/90 to-amber-950/30 border-amber-500/50 hover:border-amber-400'
                          : isTop10
                          ? 'bg-neutral-900/90 border-red-500/30 hover:border-red-500/60'
                          : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
                      } hover:scale-[1.01]`}
                    >
                      {/* Rank Badge */}
                      <div
                        className={`w-11 h-11 shrink-0 rounded-xl font-arcade font-black flex flex-col items-center justify-center transition-all ${
                          isTop1
                            ? 'bg-gradient-to-b from-yellow-400 to-amber-600 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                            : isTop3
                            ? 'bg-gradient-to-b from-neutral-200 to-neutral-400 text-neutral-950 shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                            : isTop10
                            ? 'bg-red-600/30 border border-red-500/60 text-red-300 font-black'
                            : isMain
                            ? 'bg-red-900/30 border border-red-800/50 text-red-400'
                            : 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-tighter opacity-80">Rank</span>
                        <span className="text-xs leading-none">#{demon.position}</span>
                      </div>

                      {/* Video Thumbnail (if available) */}
                      {demon.thumbnail && (
                        <div className="relative w-16 h-11 shrink-0 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 hidden sm:block">
                          <img
                            src={demon.thumbnail}
                            alt={demon.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={12} className="text-white fill-white" />
                          </div>
                        </div>
                      )}

                      {/* Middle Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-arcade font-bold text-sm text-white truncate tracking-wide group-hover:text-red-300 transition-colors">
                            {demon.name}
                          </h3>
                          {isTop1 && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                              TOP 1
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5 truncate">
                          <span className="truncate">
                            By <span className="text-neutral-300">{demon.publisher.name}</span>
                          </span>
                          <span className="text-neutral-600">&bull;</span>
                          <span className="truncate">
                            Verified by <span className="text-red-300">{demon.verifier.name}</span>
                          </span>
                        </div>

                        {/* Badges: Requirement & Level ID */}
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          <span className="text-neutral-400">
                            Min: <strong className="text-neutral-200">{demon.requirement}%</strong>
                          </span>
                          {points > 0 && (
                            <span className="text-amber-400 font-bold">
                              {points} pts
                            </span>
                          )}
                          <button
                            onClick={(e) => handleCopyId(demon.level_id, e)}
                            title="Click to copy Geometry Dash Level ID"
                            className="flex items-center gap-1 text-neutral-400 hover:text-cyan-300 ml-auto transition-colors"
                          >
                            {copiedId === demon.level_id ? (
                              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                                <Check size={11} /> Copied!
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <Copy size={11} /> ID: {demon.level_id}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arrow / Expand */}
                      <ChevronRight
                        size={16}
                        className={`text-neutral-500 group-hover:text-white transition-transform ${
                          isSelected ? 'rotate-90 text-red-400' : ''
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Demon Details Drawer / Inspector (Desktop Side Panel or Modal overlay) */}
          {selectedDemon && (
            <div className="w-full md:w-[380px] shrink-0 border-t md:border-t-0 md:border-l border-neutral-800 bg-neutral-950/95 p-4 md:p-5 overflow-y-auto flex flex-col gap-4 animate-in slide-in-from-right-4 duration-200">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-arcade font-black ${
                        selectedDemon.position <= 75
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      #{selectedDemon.position}
                    </span>
                    <h3 className="font-arcade text-lg font-black text-white tracking-wide">
                      {selectedDemon.name}
                    </h3>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Geometry Dash Demonlist Entry
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDemon(null);
                    setDemonDetails(null);
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X size={16} />
                </button>
              </div>

              {/* YouTube Video Preview / Embed */}
              {selectedDemon.video && (
                <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
                  {extractYouTubeId(selectedDemon.video) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeId(selectedDemon.video)}`}
                      title={`${selectedDemon.name} Verification`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full aspect-video border-0"
                    />
                  ) : (
                    <div className="p-4 text-center">
                      <a
                        href={selectedDemon.video}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                      >
                        <Video size={14} />
                        <span>Watch Verification Video</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Level Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="text-neutral-400 text-[10px] uppercase font-bold">List Points</div>
                  <div className="font-arcade text-base font-black text-amber-400 mt-0.5">
                    {calculateDemonPoints(selectedDemon.position)} PTS
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="text-neutral-400 text-[10px] uppercase font-bold">Required %</div>
                  <div className="font-arcade text-base font-black text-cyan-400 mt-0.5">
                    {selectedDemon.requirement}%
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 col-span-2 flex items-center justify-between">
                  <div>
                    <div className="text-neutral-400 text-[10px] uppercase font-bold">Level ID</div>
                    <div className="font-mono text-sm font-bold text-white mt-0.5">
                      {selectedDemon.level_id}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleCopyId(selectedDemon.level_id, e)}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1 text-[11px] font-medium"
                  >
                    {copiedId === selectedDemon.level_id ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Publisher & Verifier */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold">
                    <User size={12} />
                    <span>Publisher</span>
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {selectedDemon.publisher.name}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold">
                    <Award size={12} className="text-red-400" />
                    <span>Verifier</span>
                  </div>
                  <div className="text-sm font-semibold text-red-300 mt-0.5">
                    {selectedDemon.verifier.name}
                  </div>
                </div>
              </div>

              {/* Creators Team (from API details) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] uppercase font-bold">
                  <Users size={12} />
                  <span>Creator Team</span>
                </div>
                {detailsLoading ? (
                  <div className="text-xs text-neutral-500 py-2">Loading creators...</div>
                ) : demonDetails?.creators && demonDetails.creators.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {demonDetails.creators.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 font-medium"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500">
                    Published by {selectedDemon.publisher.name}
                  </div>
                )}
              </div>

              {/* Approved Records (from API details) */}
              {demonDetails?.records && demonDetails.records.length > 0 && (
                <div className="space-y-2 mt-1">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px] uppercase font-bold">
                    <div className="flex items-center gap-1">
                      <Sparkles size={12} className="text-yellow-400" />
                      <span>Approved Victors ({demonDetails.records.length})</span>
                    </div>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin text-xs">
                    {demonDetails.records.slice(0, 15).map((rec: DemonRecord) => (
                      <div
                        key={rec.id}
                        className="p-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between"
                      >
                        <span className="text-neutral-200 font-medium truncate">
                          {rec.player.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-bold">
                            {rec.progress}%
                          </span>
                          {rec.video && (
                            <a
                              href={rec.video}
                              target="_blank"
                              rel="noreferrer"
                              className="text-neutral-400 hover:text-red-400"
                              title="Watch Player Record"
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Pointercrate link */}
              <div className="mt-auto pt-2">
                <a
                  href={`https://pointercrate.com/demonlist/${selectedDemon.position}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600/30 to-amber-600/30 hover:from-red-600/50 hover:to-amber-600/50 border border-red-500/40 text-red-200 hover:text-white font-arcade font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                  <span>Open on Pointercrate.com</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 md:px-6 py-2.5 bg-neutral-950/90 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white">{filteredDemons.length}</strong> of{' '}
              <strong className="text-white">{demons.length}</strong> loaded demons
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://pointercrate.com/demonlist/"
              target="_blank"
              rel="noreferrer"
              className="text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Official Demonlist Rules & Submissions</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
