
interface TooltipDefinition {
    title: string;
    description: string;
}

export const TOOLTIPS: Record<string, TooltipDefinition> = {
    difficulty: {
        title: 'Difficulty Rating',
        description: 'A composite score (1-5) based on letter frequency, word rarity, and structural patterns. Higher scores indicate harder words.',
    },
    sentiment: {
        title: 'Sentiment Score',
        description: 'Derived from social media analysis. We classify player reactions as Positive, Neutral, or Negative based on emotional keywords.',
    },
    trapWord: {
        title: 'Trap Word',
        description: 'A word with many neighbors (e.g., _ATCH matches CATCH, PATCH, MATCH). These forces players into a guessing game, often leading to failures.',
    },
    frustrationIndex: {
        title: 'Frustration Index',
        description: 'The percentage of social posts expressing significant annoyance, failure, or rage-quitting for a specific puzzle.',
    },
};
