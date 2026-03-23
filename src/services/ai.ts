/**
 * @fileoverview Servicio para interactuar con la IA generativa de Google (Nano Banana / Gemini).
 */
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Genera una imagen de un paisaje onírico basado en una descripción de texto.
 * Utiliza el modelo text-to-image para crear arte surrealista.
 * 
 * @param {string} description - La descripción del sueño proporcionada por el usuario.
 * @returns {Promise<string>} Una promesa que resuelve a una cadena base64 de la imagen generada.
 * @throws {Error} Si no se encuentra información de imagen en la respuesta o si ocurre un error en la API.
 */
export async function generateDream(description: string): Promise<string> {
  const prompt = `surreal dreamscape, ethereal, oil painting style, ${description}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    throw new Error("No image data found in the response.");
  } catch (error) {
    console.error("Error generating dream:", error);
    throw error;
  }
}
