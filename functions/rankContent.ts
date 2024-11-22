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
        .filter(item => !item.shown)
        .map(item => `
        content_details:${item.title} + ${item.summary}
        id: ${content.indexOf(item)}
        `)
        .join("\n---\n")}

      Historical data :
      ${content
        .filter(item => item.shown)
        .map(item => `
        content_details:${item.title} + ${item.summary}
        liked: ${!item.passed}
        `)
        .join("\n---\n")}
    </input_context>
  `;
  return prompt;
}

const fakeContentData: ContentItem[] = [
  {
    id: 1,
    title: "How AI is Changing Mobile Development | Google I/O '24",
    summary:
      "Learn how artificial intelligence is revolutionizing the way we build mobile applications, featuring live demos and best practices.",
    link: "https://youtube.com/watch?v=ai-mobile-dev",
    date: "2024-03-10",
    type: "youtube",
    passed: false,
    shown: true,
  },
  {
    id: 2,
    title: "The Future of React Native in 2024",
    summary:
      "TechCrunch explores the latest updates in React Native, including the new architecture and performance improvements.",
    link: "https://techcrunch.com/2024/react-native-future",
    date: "2024-03-15",
    type: "article",
    passed: false,
    shown: false,
  },
  {
    id: 3,
    title: "Building AI-Powered Apps with React Native",
    summary:
      "Step-by-step tutorial on integrating ChatGPT and other AI models into your React Native applications.",
    link: "https://youtube.com/watch?v=react-native-ai",
    date: "2024-02-28",
    type: "youtube",
    passed: false,
    shown: true,
  },
  {
    id: 4,
    title: "Mobile App Development Trends 2024",
    summary:
      "The Verge's comprehensive analysis of mobile development trends, including AI integration, cross-platform solutions, and more.",
    link: "https://theverge.com/mobile-trends-2024",
    date: "2024-03-01",
    type: "article",
    passed: false,
    shown: false,
  },
  {
    id: 5,
    title: "React Native Radio: AI Integration Special",
    summary:
      "Special episode featuring experts discussing the integration of AI models in React Native applications.",
    link: "https://reactnativeradio.com/episodes/ai-special",
    date: "2024-03-05",
    type: "podcast",
    passed: false,
    shown: false,
  },
];

async function rankContent(llm: Model, contentItems: ContentItem[]) {
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
  return await llm.generate(prompt);
}
