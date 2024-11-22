import { useMemo } from 'react';
import {useLLM, LLAMA3_2_1B_URL} from 'react-native-executorch';


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