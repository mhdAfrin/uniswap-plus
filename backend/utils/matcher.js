/**
 * Lightweight "smart matching" engine.
 *
 * The goal here is not a machine-learning recommender — it's a transparent,
 * explainable scoring function that a lecturer can follow line by line:
 *
 *   score = (2 x shared tags) + (1 x same category) + (title/description
 *           keyword overlap)
 *
 * This is intentionally simple and deterministic so it's easy to defend in
 * a viva, while still feeling "intelligent" from the user's perspective
 * because it ranks results instead of just filtering them.
 */

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with",
  "is", "are", "i", "need", "want", "looking", "help", "my", "me", "please",
]);

const tokenize = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

const overlapCount = (a = [], b = []) => {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item)).length;
};

/**
 * Scores how well a candidate listing/request matches a target
 * request/listing. Both `target` and `candidate` need: tags[], category,
 * title, description.
 */
const scoreMatch = (target, candidate) => {
  const tagOverlap = overlapCount(target.tags || [], candidate.tags || []);
  const sameCategory =
    (target.category || "").toLowerCase() === (candidate.category || "").toLowerCase() ? 1 : 0;

  const targetWords = [
    ...tokenize(target.title),
    ...tokenize(target.description),
  ];
  const candidateWords = [
    ...tokenize(candidate.title),
    ...tokenize(candidate.description),
  ];
  const keywordOverlap = overlapCount(targetWords, candidateWords);

  const score = tagOverlap * 2 + sameCategory * 1 + keywordOverlap * 0.5;

  return {
    score: Math.round(score * 10) / 10,
    breakdown: { tagOverlap, sameCategory, keywordOverlap },
  };
};

/**
 * Ranks a list of candidates against one target, highest score first, and
 * drops zero-score candidates so results always feel relevant.
 */
const rankMatches = (target, candidates) => {
  return candidates
    .map((candidate) => {
      const { score, breakdown } = scoreMatch(target, candidate);
      return { item: candidate, score, breakdown };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
};

module.exports = { scoreMatch, rankMatches };
