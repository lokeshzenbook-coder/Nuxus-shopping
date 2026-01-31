
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getShoppingAdvice = async (userPrompt: string, availableProducts: Product[]) => {
  const context = availableProducts.map(p => `- ${p.name} ($${p.price}) in ${p.category}: ${p.description}`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are NexusMarket AI, a helpful personal shopper. 
    Below are the available products in our store:
    ${context}
    
    User Query: ${userPrompt}
    
    Provide helpful, concise shopping advice based ONLY on these products. If you can't find a good match, suggest something close or explain why.`,
  });

  return response.text;
};

export const generateProductDescription = async (productName: string, category: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a compelling and professional e-commerce product description for a product named "${productName}" in the category "${category}". Keep it under 100 words.`,
  });
  return response.text;
};
