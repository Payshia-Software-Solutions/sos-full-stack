'use server';
/**
 * @fileOverview A simple text translation AI flow.
 *
 * - translate - A function that handles the text translation.
 * - TranslateInput - The input type for the translate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.string().describe('The target language to translate to (e.g., "Sinhala", "Tamil").'),
});
export type TranslateInput = z.infer<typeof TranslateInputSchema>;

export async function translate(input: TranslateInput): Promise<string> {
  return translateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translatePrompt',
  input: {schema: TranslateInputSchema},
  prompt: `Translate the following text to {{targetLanguage}}. Do not add any extra formatting or commentary. Just return the translated text.

Text to translate:
"{{text}}"`,
});

const translateFlow = ai.defineFlow(
  {
    name: 'translateFlow',
    inputSchema: TranslateInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
