/**
 * @fileoverview Servicio de IA que gestiona la generación de imágenes.
 * Utiliza primariamente Google GenAI (Gemini) y un mecanismo de respaldo (fallback) 
 * con Hugging Face (Tongyi-MAI/Z-Image-Turbo) en caso de fallos.
 */
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const HF_API_KEY = import.meta.env.VITE_SUENOGRAMA_API_KEY;

/**
 * Genera una imagen utilizando la API de Hugging Face como alternativa.
 * 
 * @param {string} prompt - La petición textual enriquecida para generar la imagen.
 * @returns {Promise<string>} Una promesa que devuelve la imagen generada en formato Object URL.
 */
async function generateWithHuggingFace(prompt: string): Promise<string> {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/Tongyi-MAI/Z-Image-Turbo",
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) {
    throw new Error(`Error en Hugging Face API: ${response.statusText}`);
  }

  const blob = await response.blob();
  return window.URL.createObjectURL(blob);
}

/**
 * Genera una imagen de un paisaje onírico basado en una descripción de texto.
 * Intenta usar Gemini primero, y si falla, utiliza el modelo de Hugging Face.
 * 
 * @param {string} description - La descripción del sueño proporcionada por el usuario.
 * @returns {Promise<string>} Una promesa que resuelve a la URL de la imagen generada.
 * @throws {Error} Si ambos modelos fallan al generar la imagen.
 */
export async function generateDream(description: string): Promise<string> {
  const prompt = `surreal dreamscape, ethereal, oil painting style, ${description}`;
  
  try {
    // 1. Intentamos con Gemini primero
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
    console.warn("Fallo en Gemini, intentando con Hugging Face...", error);
    // 2. Si Gemini falla, usamos Hugging Face como respaldo
    try {
      return await generateWithHuggingFace(prompt);
    } catch (hfError) {
      console.error("Ambos modelos de generación fallaron:", hfError);
      throw new Error("No se pudo generar el sueño tras intentar con ambos modelos.");
    }
  }
}
