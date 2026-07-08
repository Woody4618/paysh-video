// Shared demo dataset for the Weather Pro API.
//
// Both the free /api/locations endpoint (the discovery list) and the paid
// /api/forecast endpoint read from here, so the set of valid locations and the
// per-city weather stay in one place. A real API would call a weather provider;
// this is deterministic demo data keyed by location so the `location` query
// parameter visibly changes the response.

export type LocationKey = "san francisco" | "new york" | "hamburg" | "berlin";

export type LocationProfile = {
  // Canonical display name returned in responses.
  name: string;
  // Rough baseline used to derive the deterministic forecast, so each city
  // reads differently.
  baseHighC: number;
  baseLowC: number;
  windKph: number;
  // Weather pattern the 7-day forecast cycles through for this city.
  conditions: string[];
};

// Keyed by a normalized (lowercased) location name. Aliases map common inputs
// (e.g. "nyc", "sf") to the canonical key.
export const LOCATIONS: Record<LocationKey, LocationProfile> = {
  "san francisco": {
    name: "San Francisco",
    baseHighC: 19,
    baseLowC: 12,
    windKph: 14,
    conditions: ["foggy", "partly cloudy", "sunny", "windy", "clear"],
  },
  "new york": {
    name: "New York",
    baseHighC: 26,
    baseLowC: 17,
    windKph: 11,
    conditions: ["humid", "thunderstorms", "sunny", "partly cloudy", "clear"],
  },
  hamburg: {
    name: "Hamburg",
    baseHighC: 17,
    baseLowC: 9,
    windKph: 22,
    conditions: ["rainy", "overcast", "drizzle", "windy", "partly cloudy"],
  },
  berlin: {
    name: "Berlin",
    baseHighC: 21,
    baseLowC: 11,
    windKph: 16,
    conditions: ["sunny", "clear", "partly cloudy", "cloudy", "rainy"],
  },
};

const ALIASES: Record<string, LocationKey> = {
  sf: "san francisco",
  "san fran": "san francisco",
  nyc: "new york",
  ny: "new york",
};

// Normalize arbitrary user input to a known location key, or null if unknown.
export function resolveLocation(input: string): LocationKey | null {
  const norm = input.trim().toLowerCase();
  if (norm in LOCATIONS) return norm as LocationKey;
  if (norm in ALIASES) return ALIASES[norm];
  return null;
}

// The public discovery list — what /api/locations returns.
export function listLocations(): { name: string; key: LocationKey }[] {
  return (Object.keys(LOCATIONS) as LocationKey[]).map((key) => ({
    key,
    name: LOCATIONS[key].name,
  }));
}

// Build a deterministic 7-day forecast for a resolved location.
export function buildForecast(key: LocationKey) {
  const profile = LOCATIONS[key];
  const now = new Date();
  const daily = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getTime() + i * 86_400_000);
    return {
      date: day.toISOString().slice(0, 10),
      high_c: profile.baseHighC + ((i * 2) % 5) - 2,
      low_c: profile.baseLowC + ((i * 3) % 4) - 1,
      condition: profile.conditions[i % profile.conditions.length],
    };
  });

  return {
    location: profile.name,
    generated_at: now.toISOString(),
    current: {
      temp_c: profile.baseHighC - 1,
      condition: profile.conditions[0],
      wind_kph: profile.windKph,
    },
    forecast: daily,
  };
}
