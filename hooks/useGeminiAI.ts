import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyCPIWhhSPgl1ZABV49WB8rX_0_wbrQ-CgY';

export function useGeminiAI() {
  const [isLoading, setIsLoading] = useState(false);

  const askGemini = async (prompt: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Enhanced prompt for farming context
      const enhancedPrompt = `You are an expert agricultural advisor and farming consultant with deep knowledge of Indian agriculture, crop management, pest control, soil health, irrigation, and sustainable farming practices. 

Please provide practical, actionable advice that is:
- Specific to Indian farming conditions and climate
- Easy to understand for farmers
- Cost-effective and implementable
- Based on current best practices
- Focused on sustainable agriculture

${prompt}

Please keep your response concise (under 200 words) but comprehensive, and include specific actionable steps when possible.`;

      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error('Gemini AI Error:', error);
      throw new Error('Failed to get AI response. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCropAdvice = async (cropName: string, currentConditions: any): Promise<string> => {
    const prompt = `I'm growing ${cropName} and my current farm conditions are:
- Temperature: ${currentConditions.temperature}°C
- Soil Moisture: ${currentConditions.moisture}%
- Humidity: ${currentConditions.humidity}%

What specific advice do you have for optimizing ${cropName} growth under these conditions? Include recommendations for irrigation, fertilization, and any potential issues to watch for.`;

    return askGemini(prompt);
  };

  const getPestControlAdvice = async (pestName: string, cropName?: string): Promise<string> => {
    const prompt = `I'm dealing with ${pestName}${cropName ? ` on my ${cropName} crop` : ''}. What are the most effective, eco-friendly methods to control this pest? Please include both organic and chemical options with application guidelines.`;

    return askGemini(prompt);
  };

  const getWeatherAdvice = async (weatherCondition: string, crops: string[]): Promise<string> => {
    const prompt = `We're expecting ${weatherCondition} weather. I'm currently growing ${crops.join(', ')}. What precautions should I take to protect my crops? What opportunities might this weather present?`;

    return askGemini(prompt);
  };

  return {
    askGemini,
    getCropAdvice,
    getPestControlAdvice,
    getWeatherAdvice,
    isLoading
  };
}