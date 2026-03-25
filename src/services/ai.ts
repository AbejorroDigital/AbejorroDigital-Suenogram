/**
 * @fileoverview Servicio para interactuar con la IA generativa de Google (Gemini)
 * y un modelo alternativo de Hugging Face en caso de fallo.
 */
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "missing_key" });

/**
 * Genera una imagen de un paisaje onírico utilizando un modelo alternativo de Hugging Face.
 * 
 * @param {string} prompt - El texto descriptivo (prompt) para la imagen.
 * @returns {Promise<string>} Una promesa que resuelve a una cadena base64 de la imagen generada.
 */
async function generateDreamWithHF(prompt: string, retries = 4): Promise<string> {
  let delay = 3000;
  for (let i = 0; i < retries; i++) {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        model: "stabilityai/stable-diffusion-xl-base-1.0",
      }),
    });

    if (response.status === 503 && i < retries - 1) {
      console.warn(`El modelo de Hugging Face se está cargando (503). Reintentando en ${delay/1000}s...`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 1.5;
      continue;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Error en API Hugging Face (${response.status}): ${errorData.error}`);
    }

    const data = await response.json();
    return data.image;
  }
  throw new Error("El modelo de Hugging Face no pudo cargar a tiempo.");
}

/**
 * Genera una imagen de un paisaje onírico basado en una descripción de texto.
 * Utiliza el modelo text-to-image de Gemini por defecto, y si falla (ej. por límite de tokens),
 * utiliza un modelo alternativo de Hugging Face.
 * 
 * @param {string} description - La descripción del sueño proporcionada por el usuario.
 * @returns {Promise<string>} Una promesa que resuelve a una cadena base64 de la imagen generada.
 * @throws {Error} Si no se encuentra información de imagen en la respuesta o si ambos modelos fallan.
 */
export async function generateDream(description: string): Promise<string> {
  const prompt = `surreal dreamscape, ethereal, oil painting style, ${description}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
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
    throw new Error("No se encontraron datos de imagen en la respuesta de Gemini.");
  } catch (error) {
    console.warn("Error generando sueño con Gemini, intentando con Hugging Face (Stable Diffusion XL)...", error);
    try {
      return await generateDreamWithHF(prompt);
    } catch (hfError) {
      console.error("Error generando sueño con Hugging Face:", hfError);
      throw new Error("Ambos modelos de IA fallaron al generar la imagen.");
    }
  }
}
