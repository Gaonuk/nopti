import { useMemo } from 'react';
import { LLAMA3_2_1B_URL, useLLM } from 'react-native-executorch';

import { ContentItem } from '../types/Content';

let currentSuggestionIndex = 0;

function useChatService() {
  const llm = useLLM({
    modelSource: LLAMA3_2_1B_URL,
    tokenizerSource: require("@/assets/images/tokenizer.bin"),
    contextWindowLength: 6,
  });

  const getDownloadProgress = () => {
    return llm.downloadProgress;
  };

  const isModelReady = () => {
    return llm.isModelReady;
  };

  const isGenerating = () => {
    return llm.isModelGenerating;
  };

  const generateResponse = async (prompt: string) => {
    if (!isModelReady()) {
      throw new Error("Model is not ready");
    }

    await llm.generate(prompt);
  };

  const suggestContent = (rankedContent: {
    content_rankings: Record<string, number>;
  }): string => {
    const sortedContentIds = Object.entries(rankedContent.content_rankings)
      .sort(([, rankA], [, rankB]) => rankA - rankB)
      .map(([contentId]) => contentId);

    if (currentSuggestionIndex >= sortedContentIds.length) {
      throw new Error("No more content to suggest");
    }

    const currentContentId = sortedContentIds[currentSuggestionIndex];
    currentSuggestionIndex++;

    return currentContentId;

    // TODO: Do a speak on the content
  };

  const resetSuggestions = () => {
    currentSuggestionIndex = 0;
  };

  const summarizeResponse = async (content: string) => {
    if (!isModelReady()) {
      throw new Error("Model is not ready");
    }

    const prompt =
      "You are a summariser agent. You will summarise the following content while putting an emphasis on the area of interest and the of the content : " +
      content;
    await generateResponse(prompt);
  };

  const getCurrentResponse = () => {
    return llm.response;
  };

  const formatContentForLLM = (content: ContentItem[]): string => {
    const prompt = `
      // ... same prompt template as before ...
    `;
    return prompt;
  };

  const rankContent = async (contentItems: ContentItem[]) => {
    if (!isModelReady()) {
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
        console.log("item", item);
        console.log("field", field);
        if (!(field in item)) {
          throw new Error(
            `Missing required field '${field}' in content item at index ${index}`
          );
        }
      });
    });

    const prompt = formatContentForLLM(contentItems);
    await generateResponse(prompt);
    return getCurrentResponse();
  };

  return useMemo(
    () => ({
      getDownloadProgress,
      isModelReady,
      isGenerating,
      generateResponse,
      getCurrentResponse,
      suggestContent,
      resetSuggestions,
      rankContent,
      llm,
    }),
    [llm]
  );
}

export default useChatService;
