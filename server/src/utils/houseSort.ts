export type HouseName = 'Auralis' | 'Nocturne' | 'Virtuo' | 'Folklore';

interface HouseInfo {
  genres: string[];
  description: string;
  traits: string[];
  musicPersonality: string;
  famousMusicians: string[];
}

const houseDetails: Record<HouseName, HouseInfo> = {
  Auralis: {
    genres: ['edm', 'dance', 'pop', 'rock', 'hip hop'],
    description: "The House of Energy and Innovation. Auralis wizards are drawn to powerful, upbeat rhythms and cutting-edge sounds. Their music taste reflects their bold, adventurous spirit and their ability to energize those around them.",
    traits: ['Energetic', 'Bold', 'Trendsetting', 'Dynamic'],
    musicPersonality: "You're someone who lives for the beat, finding magic in modern sounds and powerful rhythms. Music is your energy source, and you're always ready to discover the next big sound.",
    famousMusicians: ['David Guetta', 'Lady Gaga', 'The Weeknd', 'Dua Lipa']
  },
  Nocturne: {
    genres: ['ambient', 'lo-fi', 'alternative', 'r&b', 'soul'],
    description: "The House of Depth and Mystery. Nocturne wizards appreciate the subtle complexities in music, finding power in atmospheric sounds and emotional depth. They see beauty in the shadows of sound.",
    traits: ['Introspective', 'Deep', 'Atmospheric', 'Emotional'],
    musicPersonality: "Your connection to music is profound and personal. You appreciate the subtle layers in songs, finding meaning in the spaces between notes. Your playlist is a journey through emotions and moods.",
    famousMusicians: ['Billie Eilish', 'Frank Ocean', 'Lana Del Rey', 'James Blake']
  },
  Virtuo: {
    genres: ['classical', 'jazz', 'prog rock', 'experimental'],
    description: "The House of Mastery and Innovation. Virtuo wizards seek out musical complexity and technical excellence. They are the scholars of sound, appreciating both tradition and experimentation.",
    traits: ['Intellectual', 'Sophisticated', 'Experimental', 'Technical'],
    musicPersonality: "You're a true connoisseur of musical craftsmanship. Your appreciation for complex compositions and technical skill shows a mind that seeks to understand the deeper structures of music.",
    famousMusicians: ['Miles Davis', 'Ludwig van Beethoven', 'Dream Theater', 'Herbie Hancock']
  },
  Folklore: {
    genres: ['folk', 'indie', 'country', 'acoustic', 'singer-songwriter'],
    description: "The House of Story and Tradition. Folklore wizards value authenticity and narrative in music. They are the keepers of musical tradition, finding magic in honest, heartfelt expressions.",
    traits: ['Authentic', 'Grounded', 'Storytelling', 'Harmonious'],
    musicPersonality: "You're drawn to the storytelling power of music. Your taste reflects a love for authentic expression and traditional craft, valuing the human stories behind every song.",
    famousMusicians: ['Bob Dylan', 'Taylor Swift', 'Fleet Foxes', 'Joni Mitchell']
  }
};

export interface HouseSortResult {
  house: HouseName;
  description: string;
  traits: string[];
  musicPersonality: string;
  famousMusicians: string[];
  matchScore: number;
  housePercentages: Record<HouseName, number>;
  compatibility: Record<HouseName, number>; // compatibility of top house with each house (0-100)
  normalizedPercentages: Record<HouseName, number>; // normalized to sum to 100
  rawScores?: Record<HouseName, number>;
}

export function sortHouseByGenres(genres: string[]): HouseSortResult {
  const scores: Record<HouseName, number> = {
    Auralis: 0,
    Nocturne: 0,
    Virtuo: 0,
    Folklore: 0,
  };

  genres.forEach((genre) => {
    for (const house in houseDetails) {
      if (houseDetails[house as HouseName].genres.some((hGenre: string) => genre.toLowerCase().includes(hGenre))) {
        scores[house as HouseName]++;
      }
    }
  });

  // Find house with highest score
  let sortedHouse: HouseName = 'Auralis';
  let maxScore = -1;
  for (const house in scores) {
    if (scores[house as HouseName] > maxScore) {
      maxScore = scores[house as HouseName];
      sortedHouse = house as HouseName;
    }
  }

  // Calculate match score as percentage (guard genres.length === 0)
  const matchScore = genres.length > 0 ? Math.round((maxScore / genres.length) * 100) : 0;

  // Calculate percentage for all houses (raw: per-genre basis)
  const housePercentages: Record<HouseName, number> = {
    Auralis: 0,
    Nocturne: 0,
    Virtuo: 0,
    Folklore: 0,
  };

  if (genres.length > 0) {
    for (const h in scores) {
      housePercentages[h as HouseName] = Math.round((scores[h as HouseName] / genres.length) * 100);
    }
  }

  // Normalized percentages that sum to 100 (based on scores distribution)
  const normalizedPercentages: Record<HouseName, number> = {
    Auralis: 0,
    Nocturne: 0,
    Virtuo: 0,
    Folklore: 0,
  };
  const sumScores = Object.values(scores).reduce((s, v) => s + v, 0);
  const houseOrder: HouseName[] = ['Auralis', 'Nocturne', 'Virtuo', 'Folklore'];
  if (sumScores > 0) {
    // Round percentages but ensure they sum to exactly 100 by adjusting the last house
    let running = 0;
    for (let i = 0; i < houseOrder.length; i++) {
      const h = houseOrder[i];
      if (i === houseOrder.length - 1) {
        normalizedPercentages[h] = 100 - running;
      } else {
        const val = Math.round((scores[h] / sumScores) * 100);
        normalizedPercentages[h] = val;
        running += val;
      }
    }
  }

  // Compute compatibility between the top house and every house based on genre overlap
  const compatibility: Record<HouseName, number> = {
    Auralis: 0,
    Nocturne: 0,
    Virtuo: 0,
    Folklore: 0,
  };

  const topHouseGenres = new Set(houseDetails[sortedHouse].genres.map(g => g.toLowerCase()));
  for (const h in houseDetails) {
    const other = houseDetails[h as HouseName];
    const otherGenres = new Set(other.genres.map(g => g.toLowerCase()));
    // intersection / union as a simple compatibility metric
    const intersection = [...topHouseGenres].filter(g => otherGenres.has(g)).length;
    const union = new Set([...topHouseGenres, ...otherGenres]).size;
    const overlapRatio = union > 0 ? intersection / union : 0; // 0..1

    // base share from normalized percentages
    const baseShare = normalizedPercentages[h as HouseName] / 100; // 0..1

    // raw similarity: weight overlap more than base share
    const rawSimilarity = (0.7 * overlapRatio) + (0.3 * baseShare);

    // scale by top house matchScore to reflect confidence
    const scaled = rawSimilarity * (matchScore / 100);
    compatibility[h as HouseName] = Math.round(scaled * 100);
  }

  const houseInfo = houseDetails[sortedHouse];
  // include raw scores for frontend filtering/visibility
  const rawScores: Record<HouseName, number> = { ...scores };

  return {
    house: sortedHouse,
    description: houseInfo.description,
    traits: houseInfo.traits,
    musicPersonality: houseInfo.musicPersonality,
    famousMusicians: houseInfo.famousMusicians,
    matchScore: matchScore,
    housePercentages,
    compatibility
    ,normalizedPercentages,
    rawScores
  };
}
