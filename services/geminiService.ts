
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ArticleData, AppSettings } from "../types";
import { decodeBase64, decodeAudioData } from "./audioUtils";

// Helper to create client with user provided key
const getClient = (apiKey: string) => new GoogleGenAI({ apiKey });

export const processArticleUrl = async (
  input: string, // Can be URL or Text
  settings: AppSettings,
  apiKey: string
): Promise<ArticleData> => {
  if (!apiKey) throw new Error("Clé API manquante. Veuillez configurer votre clé Gemini.");

  const ai = getClient(apiKey);
  
  const isSummaryMode = settings.mode === 'summary';

  // System instruction logic refinement
  let specificInstructions = "";

  if (isSummaryMode) {
    specificInstructions = `
      TASK: Create a HIGHLY DETAILED and STRUCTURED summary in ${settings.targetLanguage}.
      
      REQUIREMENTS for 'content' field:
      1. Do not just write one paragraph. Structure the response with Markdown headers (##).
      2. Recommended structure: 
         - ## Introduction / Contexte
         - ## Points Clés (use bullet points)
         - ## Analyse / Détails
         - ## Conclusion
      3. Capture all significant nuances and data points.
      4. The goal is that the user understands the whole topic without reading the original.
    `;
  } else {
    specificInstructions = `
      TASK: Translate the COMPLETE text content into ${settings.targetLanguage}.
      
      REQUIREMENTS for 'content' field:
      1. DO NOT SUMMARIZE. This is a strict translation task.
      2. Translate every single paragraph, header, and section from the original source.
      3. Keep the length roughly equivalent to the original.
      4. Preserve the original formatting using Markdown (headers, bold, italics).
      5. If the input is a URL, extract the full body text and translate it entirely.
    `;
  }

  const systemInstruction = `
    You are OmniRead, an advanced article processor.
    
    INPUT: Can be a URL or raw text.
    TARGET LANGUAGE: ${settings.targetLanguage}
    TONE: ${settings.tone}
    
    ${specificInstructions}

    OUTPUT FORMAT:
    Return a strictly structured JSON object.
    The 'content' field must be clean Markdown.
    The 'summary' field must be a very short TL;DR (1-2 sentences) regardless of the mode.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Process this input: ${input}`,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          originalTitle: { type: Type.STRING },
          translatedTitle: { type: Type.STRING },
          summary: { type: Type.STRING, description: "A very short 1-2 sentence teaser/TL;DR" },
          content: { type: Type.STRING, description: "The main output (Full translation OR Detailed structured summary)" },
          originalLanguage: { type: Type.STRING },
          readingTime: { type: Type.NUMBER, description: "Estimated reading time in minutes" },
        },
        required: ["originalTitle", "translatedTitle", "summary", "content", "originalLanguage", "readingTime"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No content generated");

  const data = JSON.parse(text);
  
  return {
    id: crypto.randomUUID(),
    url: input.startsWith('http') ? input : 'Raw Text',
    timestamp: Date.now(),
    language: settings.targetLanguage,
    ...data
  };
};

export const generateArticleAudio = async (text: string, apiKey: string, voiceName: string = 'Puck'): Promise<AudioBuffer> => {
  if (!apiKey) throw new Error("Clé API manquante.");

  const ai = getClient(apiKey);
  
  // We pass the full text to ensure the entire article is read.
  // Gemini 2.5 Flash has a large context window capable of handling full articles.
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: `Read this text clearly and naturally: ${text}`,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("No audio data returned");
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(
    decodeBase64(base64Audio),
    audioContext,
    24000,
    1
  );

  return audioBuffer;
};
