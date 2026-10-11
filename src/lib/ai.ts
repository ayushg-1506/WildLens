import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_AI_API_KEY || "";
export const ai = new GoogleGenAI({ apiKey });

// List of supported fast models in order of priority
const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
];

export async function generateContentWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
}) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const config: any = {};
      if (params.systemInstruction) {
        config.systemInstruction = params.systemInstruction;
      }
      if (params.responseMimeType) {
        config.responseMimeType = params.responseMimeType;
      }

      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      if (response && response.text) {
        return {
          text: response.text,
          model,
        };
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }

  throw lastError || new Error("All AI models failed to respond");
}
