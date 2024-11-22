import { Model } from 'react-native-executorch/lib/typescript/types';

import { ContentItem } from '../types/Content';

function formatContentForLLM(content: ContentItem[]): string {
  const prompt = `
    <context>
        You are a content recommendation agent ranking potential content based on user interaction history.
    </context>

    <input_format>
        The input will consist of:
        - A list of content items with their full details including:
            * content_details: A brief summary of the content
            * id
        - Historical interaction data containing:
            * content_details: A brief summary of the content
            * A boolean 'liked' indicating user's reaction (true = liked, false = disliked)
    </input_format>

    <instructions>
        1. Analyze historical interaction data to understand user preferences
        2. Rank potential content items based on:
            - Similarity to liked content
            - Distance from disliked content
            - Content type preferences
            - Recency of content
        3. Output ranking as JSON with content_id:rank mapping
    </instructions>

    <output_format>
        {
            "content_rankings": {
                "content_id": 1,
                "content_id": 2,
                ...
            }
        }
    </output_format>

    <example>
        <potential_contents>
            [
                {"content_details": "Ethical implications of machine learning", "id": 10},
                {"content_details": "Latest Hollywood drama", "id": 11},
                {"content_details": "Technological research innovations", "id": 12}
            ]
        </potential_contents>

        <historical_data>
            [
                {"content_details": "AI ethics in technology", "liked": true},
                {"content_details": "Celebrity gossip", "liked": false}
            ]
        </historical_data>

        <expected_output>
            {
                "content_rankings": {
                    12: 1,
                    10: 2,
                    11: 3
                }
            }
        </expected_output>
    </example>

    <input_context>
      Items to rank :
      ${content
        .filter((item) => !item.shown)
        .map(
          (item) => `
        content_details:${item.title} + ${item.summary}
        id: ${content.indexOf(item)}
        `
        )
        .join("\n---\n")}

      Historical data :
      ${content
        .filter((item) => item.shown)
        .map(
          (item) => `
        content_details:${item.title} + ${item.summary}
        liked: ${!item.passed}
        `
        )
        .join("\n---\n")}
    </input_context>
  `;
  return prompt;
}

export const rankContent = async (llm: Model, contentItems: ContentItem[]) => {
  // In input, put all the content objects. The ones already shown are treated as historical data. The other ones as suggestion.
  if (!llm.isModelReady) {
    throw new Error("Model is not ready");
  }
  // Validate content array
  if (!Array.isArray(contentItems)) {
    throw new Error("Content must be an array");
  }

  if (contentItems.length === 0) {
    return {
      content_rankings: {},
    };
  }

  const requiredFields: (keyof ContentItem)[] = [
    "title",
    "summary",
    "link",
    "date",
    "type",
    "passed",
    "shown",
  ];

  contentItems.forEach((item, index) => {
    requiredFields.forEach((field) => {
      if (!(field in item)) {
        throw new Error(
          `Missing required field '${field}' in content item at index ${index}`
        );
      }
    });
  });

  const prompt = formatContentForLLM(contentItems);
  await llm.generate(prompt);
  return llm.response;
};
