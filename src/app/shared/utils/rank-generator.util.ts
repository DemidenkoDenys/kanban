import { generateKeyBetween } from 'fractional-indexing';

export function rankGenerator(original?: string | null): () => string {
  let rank = generateKeyBetween(original ?? null, null);

  return function () {
    rank = generateKeyBetween(rank, null);
    return rank;
  };
}

export const getNextRank = rankGenerator();
