import { GoogleGenAI, Type } from "@google/genai";
import { SocialSEOResult, TrendHunterResponse, FilterState, Mode, Platform } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

// Helper to encode file to Base64
const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to clean Markdown JSON
const cleanJSON = (text: string): string => {
  let cleaned = text.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
};

export const generateSocialStrategy = async (
  apiKey: string,
  mode: Mode,
  platform: Platform,
  files: File[],
  brandGuidelines: File | null,
  filters: FilterState,
  liveTrendMode: boolean
): Promise<SocialSEOResult> => {
  const ai = new GoogleGenAI({ apiKey });

  // Construct the prompt
  let promptText = `
    Analyze the provided content for ${platform} in ${mode} mode.
    
    Context Filters:
    - Niche: ${filters.niche}
    - Geography: ${filters.geography}
    - Target Audience: ${filters.targetAudience}
    - Language: ${filters.targetLanguage}
    - Demographics: ${filters.targetDemographics}
  `;

  if (liveTrendMode) {
    promptText = `
      STEP 1: You have access to Google Search. Before analyzing the video, SEARCH for "Current viral trends [Current Month] [Current Year]" and "Trending audio for ${filters.niche} on ${platform}".
      STEP 2: Use this live data to suggest a specific trending audio or challenge format that fits the user's video.
      STEP 3: Mention the trend name in the reasoning section.
      
      ${promptText}
    `;
  }

  if (mode === 'competitor_spy') {
    promptText += `\n Identify 'Actionable Secrets' from these competitor inputs. Populate the 'competitor_insights' field.`;
  }

  if (brandGuidelines) {
    promptText += `\n Adhere strictly to the attached Brand Guidelines.`;
  }

  const parts: any[] = [{ text: promptText }];

  // Attach Content Files
  for (const file of files) {
    parts.push(await fileToPart(file));
  }

  // Attach Brand Guidelines
  if (brandGuidelines) {
    parts.push({ text: "BRAND GUIDELINES DOCTUMENT:" });
    parts.push(await fileToPart(brandGuidelines));
  }

  const modelId = "gemini-2.5-flash"; 

  // Dynamic config: Cannot use responseMimeType: 'application/json' with tools
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: liveTrendMode ? [{ googleSearch: {} }] : [],
  };

  if (!liveTrendMode) {
    config.responseMimeType = "application/json";
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: { parts },
    config: config,
  });

  if (!response.text) throw new Error("No response from AI");
  
  // Clean potential markdown if strict JSON mode wasn't used
  const jsonText = cleanJSON(response.text);
  
  return JSON.parse(jsonText) as SocialSEOResult;
};

export const huntTrends = async (
  apiKey: string,
  niche: string
): Promise<TrendHunterResponse> => {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Search Google Trends, Twitter Trending, and TikTok Creative Center for the niche: "${niche}".
    Return 5 specific viral content ideas.
    
    Output JSON format:
    {
      "trend_hunter_ideas": [
        {
          "idea_title": "...",
          "idea_description": "...",
          "why_it_works": "...",
          "suggested_platforms": ["instagram", "tiktok"]
        }
      ]
    }
  `;

  // Tools enabled, so we cannot use responseMimeType: application/json
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }], 
    },
  });

  if (!response.text) throw new Error("No response from AI");

  const jsonText = cleanJSON(response.text);

  return JSON.parse(jsonText) as TrendHunterResponse;
};