'use server';

/**
 * @fileOverview A flow for suggesting the next best videos or creators based on user data.
 *
 * - suggestNextVideos - A function that suggests videos or creators.
 * - SuggestNextVideosInput - The input type for the suggestNextVideos function.
 * - SuggestNextVideosOutput - The return type for the suggestNextVideos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextVideosInputSchema = z.object({
  completedCourses: z
    .array(z.string())
    .describe('List of IDs for courses the user has completed.'),
  subjectsOfInterest: z
    .array(z.string())
    .describe('List of subjects the user is interested in.'),
  trendingContent: z
    .array(z.string())
    .describe('List of IDs for content that is currently trending.'),
  numberOfSuggestions: z
    .number()
    .default(3)
    .describe('The number of video or creator suggestions to return.'),
});
export type SuggestNextVideosInput = z.infer<typeof SuggestNextVideosInputSchema>;

const SuggestNextVideosOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('List of suggested video or creator IDs.'),
});
export type SuggestNextVideosOutput = z.infer<typeof SuggestNextVideosOutputSchema>;

export async function suggestNextVideos(input: SuggestNextVideosInput): Promise<SuggestNextVideosOutput> {
  return suggestNextVideosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextVideosPrompt',
  input: {schema: SuggestNextVideosInputSchema},
  output: {schema: SuggestNextVideosOutputSchema},
  prompt: `You are an AI learning tool expert. You suggest videos or creators based on user's completed courses, subjects of interest, and trending content.

  Completed Courses: {{completedCourses}}
  Subjects of Interest: {{subjectsOfInterest}}
  Trending Content: {{trendingContent}}

  Suggest {{numberOfSuggestions}} video or creator IDs that the user should watch next.  Return just the list of IDs.`, // Improved Prompt
});

const suggestNextVideosFlow = ai.defineFlow(
  {
    name: 'suggestNextVideosFlow',
    inputSchema: SuggestNextVideosInputSchema,
    outputSchema: SuggestNextVideosOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
