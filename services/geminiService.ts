import { GoogleGenAI } from "@google/genai";
import { ImageSize } from '../types';

export const generateMarketingImage = async (prompt: string, size: ImageSize): Promise<string> => {
  // Check if the user has selected an API key
  // Cast window to any to avoid type conflicts with existing AIStudio definitions in the environment
  const aistudio = (window as any).aistudio;
  
  if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        throw new Error("API_KEY_MISSING");
      }
  } else {
      // Fallback for dev environments without the extension, though production requires it for this specific model flow
      // In a real scenario, we might handle this differently, but per instructions we rely on window.aistudio logic
      // If window.aistudio is missing, we can try using the env var if available, but for Veo/High-Res Image models, the prompt implies dynamic selection.
      if (!process.env.API_KEY) {
         throw new Error("API_KEY_MISSING");
      }
  }
  
  // We need to use a fresh client to ensure the selected key is used
  // If window.aistudio exists, we rely on the injected key via process.env.API_KEY or the selection flow context.
  // The instruction says "Use await window.aistudio.hasSelectedApiKey()... Create a new GoogleGenAI instance right before making an API call"
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9", // Landscape for product showcase headers usually
        imageSize: size
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString: string = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }
  
  throw new Error("No image generated.");
};