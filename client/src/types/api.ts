export type HouseName = 'Auralis' | 'Nocturne' | 'Virtuo' | 'Folklore';

export interface FamousMusician {
  name: string;
  image?: string | null;
  spotifyUrl?: string | null;
}

export interface HouseInfo {
  genres: string[];
  description: string;
  traits: string[];
  musicPersonality: string;
  famousMusicians: FamousMusician[];
}

export interface HouseSortResult {
  house: HouseName;
  description: string;
  traits: string[];
  musicPersonality: string;
  famousMusicians: FamousMusician[];
  matchScore: number;
  housePercentages: Record<HouseName, number>;
  compatibility: Record<HouseName, number>;
  normalizedPercentages: Record<HouseName, number>;
  rawScores?: Record<HouseName, number>;
}

export interface TopArtist {
  name: string;
  spotifyUrl?: string;
  image?: string | null;
  genres: string[];
}

export interface GenresApiResponse extends HouseSortResult {
  genres: string[];
  topArtists: TopArtist[];
  allHouseDetails: Record<HouseName, HouseInfo>;
}
