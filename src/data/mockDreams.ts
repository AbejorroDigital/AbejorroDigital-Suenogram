/**
 * @fileoverview Datos simulados de sueños para poblar el mapa inicial.
 */

/**
 * Interfaz que define la estructura de los datos de un sueño.
 * @interface DreamData
 * @property {string} id - Identificador único del sueño.
 * @property {number} lat - Latitud geográfica donde ocurrió o se registró el sueño.
 * @property {number} lng - Longitud geográfica donde ocurrió o se registró el sueño.
 * @property {string} description - Descripción detallada del sueño.
 * @property {string} author - Nombre del autor o soñador.
 */
export interface DreamData {
  id: string;
  lat: number;
  lng: number;
  description: string;
  author: string;
}

/**
 * Lista de sueños simulados (mock) que actúan como base de datos inicial.
 * @type {DreamData[]}
 */
export const mockDreams: DreamData[] = [
  {
    id: "mx-1",
    lat: 19.6926, // Teotihuacán, México
    lng: -98.8436,
    description: "Una pirámide antigua flotando en un cielo de nubes de algodón de azúcar al atardecer, rodeada de alebrijes de neón luminosos.",
    author: "Valentina"
  },
  {
    id: "ve-1",
    lat: 5.9690, // Parque Nacional Canaima, Venezuela
    lng: -62.5362,
    description: "Un tepuy colosal del cual cae una cascada de luz estelar brillante hacia una selva densa con hojas de cristal.",
    author: "Gabriel"
  },
  {
    id: "ca-1",
    lat: 51.1784, // Banff, Canadá
    lng: -115.5708,
    description: "Un bosque nevado donde los pinos son de hielo azul y la aurora boreal forma puentes sólidos y resplandecientes en el cielo.",
    author: "Sophie"
  }
];
