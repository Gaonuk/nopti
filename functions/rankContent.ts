import { useContext } from "react";
import { Model } from "react-native-executorch/lib/typescript/types";

interface ContentItem {
  title: string;
  summary: string;
  link: string;
  date: string;
  type: "youtube" | "article" | "podcast";
  passed: Boolean;
  shown: boolean | null;
}

function formatContentForLLM(content: ContentItem[]): string {
  const prompt = `
    <context>
        You are a content recommendation agent ranking potential content based on user interaction history.
    </context>

    <input_format>
        The input will consist of:
        - A list of content items with their full details including:
            * Title
            * Summary
            * Link
            * Publication Date
            * Content Type (youtube/article/podcast)
            * User Interaction (passed/shown)
        - Historical interaction data containing:
            * Complete content details
            * A boolean 'passed' indicating user's reaction (true = disliked, false = liked)
            * View status (shown: true/false/null)
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
        <historical_data>
            [
                {
                    "title": "AI ethics in technology",
                    "summary": "Discussion on AI ethics",
                    "link": "https://example.com/ai-ethics",
                    "date": "2024-03-01",
                    "type": "article",
                    "passed": true,
                    "shown": true
                }
            ]
        </historical_data>

        <potential_contents>
            [
                {
                    "title": "Ethical implications of ML",
                    "summary": "Deep dive into ML ethics",
                    "link": "https://example.com/ml-ethics",
                    "date": "2024-03-15",
                    "type": "article",
                    "content_id": 10,
                    "shown": null
                }
            ]
        </potential_contents>

        <expected_output>
            {
                "content_rankings": {
                    10: 1
                }
            }
        </expected_output>
    </example>

    <input_context>
        ${content
          .map(
            (item) => `
            Title: ${item.title}
            Summary: ${item.summary}
            Link: ${item.link}
            Date: ${item.date}
            Type: ${item.type}
            Passed: ${item.passed}
            Shown: ${item.shown}
            `
          )
          .join("\n---\n")}
    </input_context>
  `;
  return prompt;
}

const fakeContentData: ContentItem[] = [
  {
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
    title: "Mobile App Development Trends 2024",
    summary:
      "The Verge's comprehensive analysis of mobile development trends, including AI integration, cross-platform solutions, and more.",
    link: "https://theverge.com/mobile-trends-2024",
    date: "2024-03-01",
    type: "article",
    passed: false,
    shown: null,
  },
  {
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

async function rankContent(llm: Model, content: ContentItem[]) {
  if (!llm.isModelReady) {
    throw new Error("Model is not ready");
  }
  // Validate content array
  if (!Array.isArray(content)) {
    throw new Error("Content must be an array");
  }

  if (content.length === 0) {
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
  content.forEach((item, index) => {
    requiredFields.forEach((field) => {
      if (!(field in item)) {
        throw new Error(
          `Missing required field '${field}' in content item at index ${index}`
        );
      }
    });
  });

  const prompt = formatContentForLLM(content);
  return await llm.generate(prompt);
}
