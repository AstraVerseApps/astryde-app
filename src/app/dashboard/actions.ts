"use server";

import { suggestNextVideos } from "@/ai/flows/suggest-next-videos";
import type { SuggestNextVideosInput } from "@/ai/flows/suggest-next-videos";

export async function getSuggestions(input: SuggestNextVideosInput) {
    try {
        const result = await suggestNextVideos(input);
        return result.suggestions;
    } catch (error) {
        console.error("Error getting AI suggestions:", error);
        return [];
    }
}
