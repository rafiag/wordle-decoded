/**
 * Finds the common pattern (e.g. _IGHT) from a word and its neighbors.
 */
export function getPatternMask(word: string, neighbors: string[]): string {
    if (!word || !neighbors.length) return word;

    const firstNeighbor = neighbors[0];
    let mask = '';

    for (let i = 0; i < 5; i++) {
        if (word[i] === firstNeighbor[i]) {
            mask += word[i];
        } else {
            mask += '_';
        }
    }

    return mask;
}
