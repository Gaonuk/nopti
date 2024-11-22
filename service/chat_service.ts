import { useLLM, LLAMA3_2_1B_URL } from 'react-native-executorch';

export interface MessageType {
  text: string;
  from: 'user' | 'ai';
}

export class ChatService {
  private llm;

  constructor() {
    this.llm = useLLM({
      modelSource: LLAMA3_2_1B_URL,
      tokenizerSource: require('../assets/images/tokenizer.bin'),
      contextWindowLength: 6,
    });
  }

  public isModelReady(): boolean {
    return this.llm.isModelReady;
  }

  public getDownloadProgress(): number {
    return this.llm.downloadProgress;
  }

  public isGenerating(): boolean {
    return this.llm.isModelGenerating;
  }

  public async generateResponse(prompt: string): Promise<string | null> {
    if (!this.isModelReady()) {
      throw new Error('Model is not ready');
    }
    
    return await this.llm.generate(prompt);
  }

  public getCurrentResponse(): string | null {
    return this.llm.response;
  }
}

// Create a singleton instance
export const chatService = new ChatService();