import type { Model } from "react-native-executorch/lib/typescript/types";

export const generateResponse = async (llm: Model, prompt: string) => {
	if (!llm.isModelReady) {
		throw new Error("Model is not ready");
	}

	await llm.generate(prompt);
};
