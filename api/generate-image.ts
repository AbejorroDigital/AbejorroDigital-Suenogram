/**
 * Función serverless de Vercel que actúa como proxy hacia la API de Hugging Face.
 * Esto evita el bloqueo de CORS del navegador, ya que la petición se hace
 * desde el servidor de Vercel (server-side) y no desde el navegador del usuario.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const hfApiKey = process.env.SUENOGRAMA_API_KEY;
  if (!hfApiKey) {
    return res.status(500).json({ error: 'La clave API de Hugging Face no está configurada en el servidor.' });
  }

  try {
    const { prompt, model } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Se requiere un prompt.' });
    }

    const modelId = model || 'stabilityai/stable-diffusion-xl-base-1.0';

    const hfResponse = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text().catch(() => hfResponse.statusText);
      return res.status(hfResponse.status).json({
        error: `Error de Hugging Face (${hfResponse.status}): ${errorText}`,
      });
    }

    // Convertir la imagen a base64 y devolverla
    const arrayBuffer = await hfResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = hfResponse.headers.get('content-type') || 'image/jpeg';

    return res.status(200).json({
      image: `data:${contentType};base64,${base64}`,
    });
  } catch (error: any) {
    console.error('Error en proxy de Hugging Face:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
}
