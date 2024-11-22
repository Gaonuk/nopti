import { useMemo } from 'react';
import { LLAMA3_2_1B_URL, useLLM } from 'react-native-executorch';


function useChatService() {
    const llm = useLLM({
		modelSource:  LLAMA3_2_1B_URL,
		tokenizerSource: require('@/assets/images/tokenizer.bin'),
		contextWindowLength: 6,
	});

    const getDownloadProgress = () => {
        return llm.downloadProgress;
    }

    const isModelReady = () => {
        return llm.isModelReady;
    }

    const isGenerating = () => {
        return llm.isModelGenerating;
    }

    const generateResponse = async (prompt: string) => {
        if (!isModelReady()) {
            throw new Error('Model is not ready');
        }

        await llm.generate(prompt);
    }

    const summarizeResponse = async (content: string) => {
        if (!isModelReady()) {
            throw new Error('Model is not ready');
        }

        const prompt = "You are a summariser agent. You will summarise the following content while putting an emphasis on the area of interest and the of the content : " + content;
        await generateResponse(prompt);
    }

    const getCurrentResponse = () => {
        return llm.response;
    }

    return useMemo(() => ({
        getDownloadProgress,
        isModelReady,
        isGenerating,
        generateResponse,
        getCurrentResponse,
        llm
    }), [llm]);
}

export default useChatService;