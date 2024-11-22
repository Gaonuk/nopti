// import { useLLM, LLAMA3_2_1B_URL } from 'react-native-executorch';

// interface LLMConfig {
//   modelSource?: string;
//   tokenizer: any;
//   contextWindowLength?: number;
//   systemPrompt?: string;
// }

// interface LLMResponse {
//   response: string;
//   isGenerating: boolean;
//   isReady: boolean;
//   error: string | null;
//   progress: number;
// }

// export class LLMService {
//   private llm: ReturnType<typeof useLLM>;

//   constructor(config: LLMConfig) {
//     this.llm = useLLM({
//       modelSource:  LLAMA3_2_1B_URL,
//       tokenizerSource: config.tokenizer,
//       contextWindowLength: config.contextWindowLength || 3,
//       systemPrompt: config.systemPrompt,
//     });
//   }

//   public async generateResponse(input: string): Promise<void> {
//     if (!this.llm.isModelReady) {
//       throw new Error('Model is not ready');
//     }
    
//     this.llm.generate(input);
//   }

//   public interrupt(): void {
//     this.llm.interrupt();
//   }

//   public getStatus(): LLMResponse {
//     return {
//       response: this.llm.response,
//       isGenerating: this.llm.isModelGenerating,
//       isReady: this.llm.isModelReady,
//       error: this.llm.error,
//       progress: this.llm.downloadProgress,
//     };
//   }
// }
