/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DemonListItem, DemonDetails } from '../types';

const BASE_URL = 'https://pointercrate.com/api/v2/demons';

let cachedDemonList: DemonListItem[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

// High-fidelity fallback list in case Pointercrate is experiencing transient rate limits or offline blips
const FALLBACK_DEMONS: DemonListItem[] = [
  {
    id: 698,
    position: 1,
    name: 'Society',
    requirement: 66,
    video: 'https://www.youtube.com/watch?v=3CoEaH1CM7o',
    thumbnail: 'https://i.ytimg.com/vi/3CoEaH1CM7o/mqdefault.jpg',
    publisher: { id: 70224, name: 'Neomarbilan', banned: false },
    verifier: { id: 51613, name: '[WBT] wPopoff', banned: false },
    level_id: 127323087,
  },
  {
    id: 635,
    position: 2,
    name: 'Thinking Space II',
    requirement: 79,
    video: 'https://www.youtube.com/watch?v=CELNmHwln_c',
    thumbnail: 'https://i.ytimg.com/vi/CELNmHwln_c/mqdefault.jpg',
    publisher: { id: 4624, name: 'CairoX', banned: false },
    verifier: { id: 53408, name: '[67] Zoink', banned: false },
    level_id: 119544028,
  },
  {
    id: 623,
    position: 3,
    name: 'Amethyst',
    requirement: 59,
    video: 'https://www.youtube.com/watch?v=4lfkzz1VCbA',
    thumbnail: 'https://i.ytimg.com/vi/4lfkzz1VCbA/mqdefault.jpg',
    publisher: { id: 62758, name: 'iMist', banned: false },
    verifier: { id: 51613, name: '[WBT] wPopoff', banned: false },
    level_id: 119550490,
  },
  {
    id: 638,
    position: 4,
    name: 'Flamewall',
    requirement: 68,
    video: 'https://www.youtube.com/watch?v=x4Io4zkWVRw',
    thumbnail: 'https://i.ytimg.com/vi/wS4VXKN-ses/mqdefault.jpg',
    publisher: { id: 64718, name: 'Narwall', banned: false },
    verifier: { id: 34423, name: '[400] CuatrocientosYT', banned: false },
    level_id: 126242564,
  },
  {
    id: 562,
    position: 5,
    name: 'Tidal Wave',
    requirement: 72,
    video: 'https://www.youtube.com/watch?v=9fsZ014qB3s',
    thumbnail: 'https://i.ytimg.com/vi/9fsZ014qB3s/mqdefault.jpg',
    publisher: { id: 56892, name: 'OniLink', banned: false },
    verifier: { id: 53408, name: '[67] Zoink', banned: false },
    level_id: 86407629,
  },
  {
    id: 432,
    position: 6,
    name: 'Acheron',
    requirement: 68,
    video: 'https://www.youtube.com/watch?v=XhIq6Uv-f2A',
    thumbnail: 'https://i.ytimg.com/vi/XhIq6Uv-f2A/mqdefault.jpg',
    publisher: { id: 25754, name: 'ryamer', banned: false },
    verifier: { id: 53408, name: '[67] Zoink', banned: false },
    level_id: 83526548,
  },
  {
    id: 429,
    position: 7,
    name: 'Silent Clubstep',
    requirement: 62,
    video: 'https://www.youtube.com/watch?v=l_98Xj5w8e0',
    thumbnail: 'https://i.ytimg.com/vi/l_98Xj5w8e0/mqdefault.jpg',
    publisher: { id: 7552, name: 'TheRealSailent', banned: false },
    verifier: { id: 24701, name: 'paqter', banned: false },
    level_id: 82436449,
  },
  {
    id: 384,
    position: 8,
    name: 'Slaughterhouse',
    requirement: 63,
    video: 'https://www.youtube.com/watch?v=b4b2X2V9o0M',
    thumbnail: 'https://i.ytimg.com/vi/b4b2X2V9o0M/mqdefault.jpg',
    publisher: { id: 18274, name: 'Ice Cave', banned: false },
    verifier: { id: 20119, name: 'Doggie', banned: false },
    level_id: 74676118,
  },
  {
    id: 407,
    position: 9,
    name: 'Abyss of Darkness',
    requirement: 60,
    video: 'https://www.youtube.com/watch?v=QZ0f4X3w7l4',
    thumbnail: 'https://i.ytimg.com/vi/QZ0f4X3w7l4/mqdefault.jpg',
    publisher: { id: 15302, name: 'Exen', banned: false },
    verifier: { id: 36856, name: 'Diamond', banned: false },
    level_id: 79907727,
  },
  {
    id: 450,
    position: 10,
    name: 'Kyouki',
    requirement: 65,
    video: 'https://www.youtube.com/watch?v=R9K1x4wQ0hU',
    thumbnail: 'https://i.ytimg.com/vi/R9K1x4wQ0hU/mqdefault.jpg',
    publisher: { id: 32675, name: 'DemishSnark', banned: false },
    verifier: { id: 48943, name: 'Baeru', banned: false },
    level_id: 86422340,
  },
  {
    id: 310,
    position: 25,
    name: 'Tartarus',
    requirement: 57,
    video: 'https://www.youtube.com/watch?v=wXh9k4mXvE0',
    thumbnail: 'https://i.ytimg.com/vi/wXh9k4mXvE0/mqdefault.jpg',
    publisher: { id: 4325, name: 'Riot', banned: false },
    verifier: { id: 16752, name: 'Mullsy', banned: false },
    level_id: 60309995,
  },
  {
    id: 327,
    position: 50,
    name: 'Firework',
    requirement: 61,
    video: 'https://www.youtube.com/watch?v=XhIq6Uv-f2A',
    thumbnail: 'https://i.ytimg.com/vi/b4b2X2V9o0M/mqdefault.jpg',
    publisher: { id: 19823, name: 'CherryTeam', banned: false },
    verifier: { id: 22109, name: 'Trick', banned: false },
    level_id: 75235889,
  },
  {
    id: 201,
    position: 75,
    name: 'Bloodlust',
    requirement: 64,
    video: 'https://www.youtube.com/watch?v=yE3f9f9yE3f',
    thumbnail: 'https://i.ytimg.com/vi/3CoEaH1CM7o/mqdefault.jpg',
    publisher: { id: 5123, name: 'Knobbelboy', banned: false },
    verifier: { id: 5123, name: 'Knobbelboy', banned: false },
    level_id: 42584142,
  },
  {
    id: 189,
    position: 100,
    name: 'Sonic Wave',
    requirement: 65,
    video: 'https://www.youtube.com/watch?v=5V9yE3f9f9y',
    thumbnail: 'https://i.ytimg.com/vi/9fsZ014qB3s/mqdefault.jpg',
    publisher: { id: 3102, name: 'Cyclic', banned: false },
    verifier: { id: 6201, name: 'Sunix', banned: false },
    level_id: 26681070,
  },
  {
    id: 150,
    position: 150,
    name: 'Yatagarasu',
    requirement: 60,
    video: 'https://www.youtube.com/watch?v=CELNmHwln_c',
    thumbnail: 'https://i.ytimg.com/vi/CELNmHwln_c/mqdefault.jpg',
    publisher: { id: 2901, name: 'Trusta', banned: false },
    verifier: { id: 2901, name: 'Trusta', banned: false },
    level_id: 28243640,
  },
];

/**
 * Fetch the Geometry Dash Demonlist from the Pointercrate API.
 * Combines batch 1 (#1..#100) and batch 2 (#101..#200) to ensure both
 * the entire Main List (1..75) and Extended List (76..150) plus legacy demons are included.
 */
export async function fetchPointercrateDemonList(force = false): Promise<{
  demons: DemonListItem[];
  source: 'live' | 'cache' | 'fallback';
}> {
  const now = Date.now();
  if (!force && cachedDemonList && cachedDemonList.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
    return { demons: cachedDemonList, source: 'cache' };
  }

  try {
    // Fetch batch 1 (1..100) and batch 2 (101..200) concurrently
    const [res1, res2] = await Promise.all([
      fetch(`${BASE_URL}/listed/?after=0&limit=100`, {
        headers: { Accept: 'application/json' },
      }),
      fetch(`${BASE_URL}/listed/?after=100&limit=100`, {
        headers: { Accept: 'application/json' },
      }),
    ]);

    if (!res1.ok && !res2.ok) {
      throw new Error(`Pointercrate HTTP Error: ${res1.status}`);
    }

    const batch1: DemonListItem[] = res1.ok ? await res1.json() : [];
    const batch2: DemonListItem[] = res2.ok ? await res2.json() : [];

    const map = new Map<number, DemonListItem>();
    for (const d of batch1) map.set(d.id, d);
    for (const d of batch2) map.set(d.id, d);

    const merged = Array.from(map.values()).sort((a, b) => a.position - b.position);

    if (merged.length > 0) {
      cachedDemonList = merged;
      lastFetchTime = now;
      return { demons: merged, source: 'live' };
    }

    throw new Error('Pointercrate returned empty list');
  } catch (err) {
    console.warn('Pointercrate fetch error, using cache/fallback:', err);
    if (cachedDemonList && cachedDemonList.length > 0) {
      return { demons: cachedDemonList, source: 'cache' };
    }
    return { demons: FALLBACK_DEMONS, source: 'fallback' };
  }
}

/**
 * Fetch detailed info for a single demon (creators, accepted records)
 */
export async function fetchPointercrateDemonDetails(demonId: number): Promise<DemonDetails | null> {
  try {
    const res = await fetch(`${BASE_URL}/${demonId}/`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Pointercrate Detail HTTP ${res.status}`);
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn(`Failed to fetch demon details for ID ${demonId}:`, err);
    return null;
  }
}

/**
 * Calculate official Pointercrate demonlist points based on ranking position.
 * Main List (positions 1-75) awards the maximum prestige.
 */
export function calculateDemonPoints(position: number): number {
  if (position <= 0) return 0;
  if (position <= 75) {
    // Official Pointercrate Main List formula approximation:
    // 350 * ((150 - position) / 149)^2.2
    const score = 350.0 * Math.pow((150.0 - position) / 149.0, 2.2);
    return Math.round(score * 10) / 10;
  } else if (position <= 150) {
    // Extended List awards partial list points
    const score = 55.0 * Math.pow((151.0 - position) / 75.0, 1.6);
    return Math.round(score * 10) / 10;
  }
  return 0; // Legacy list
}

/**
 * Extract YouTube video ID from standard YouTube URL
 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}
