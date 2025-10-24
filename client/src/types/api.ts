export type HouseName = 'Auralis' | 'Nocturne' | 'Virtuo' | 'Folklore';

export interface HouseInfo {
  genres: string[];
  description: string;
  traits: string[];
  musicPersonality: string;
  famousMusicians: string[];
}

export interface HouseSortResult {
  house: HouseName;
  description: string;
  traits: string[];
  musicPersonality: string;
  famousMusicians: string[];
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
