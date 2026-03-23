/**
 * @fileoverview Componente que renderiza un canvas 3D usando Three.js y React Three Fiber.
 * Aplica shaders personalizados para crear un efecto de distorsión orgánica sobre la imagen del sueño.
 */
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Vertex shader personalizado para crear un efecto de onda orgánica en el plano 3D.
 * @type {string}
 */
const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Organic wave distortion
    float wave1 = sin(pos.x * 2.0 + uTime * 1.5) * 0.1;
    float wave2 = cos(pos.y * 2.0 + uTime * 1.0) * 0.1;
    pos.z += wave1 + wave2;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

/**
 * Fragment shader personalizado para renderizar la textura de la imagen con un ligero cambio de color dinámico.
 * @type {string}
 */
const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uTime;

  void main() {
    vec2 uv = vUv;
    
    // Slight color shift over time
    vec4 color = texture2D(uTexture, uv);
    float r = color.r + sin(uTime * 0.5) * 0.05;
    float g = color.g + cos(uTime * 0.7) * 0.05;
    float b = color.b + sin(uTime * 0.3) * 0.05;
    
    gl_FragColor = vec4(r, g, b, color.a);
  }
`;

/**
 * Propiedades para el componente interno DreamPlane.
 * @interface DreamPlaneProps
 * @property {string} imageUrl - URL o cadena base64 de la imagen a renderizar como textura.
 */
interface DreamPlaneProps {
  imageUrl: string;
}

/**
 * Componente interno que representa la malla (mesh) 3D del plano donde se dibuja el sueño.
 * @param {DreamPlaneProps} props - Propiedades del componente.
 * @returns {JSX.Element} El elemento mesh de Three.js.
 */
const DreamPlane: React.FC<DreamPlaneProps> = ({ imageUrl }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTexture: { value: texture },
    }),
    [texture]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[16, 9, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Propiedades para el componente principal DreamCanvas.
 * @interface DreamCanvasProps
 * @property {string} imageUrl - URL o cadena base64 de la imagen a renderizar.
 */
interface DreamCanvasProps {
  imageUrl: string;
}

/**
 * Contenedor principal del canvas 3D que configura la cámara, luces y el entorno de React Three Fiber.
 * @param {DreamCanvasProps} props - Propiedades del componente.
 * @returns {JSX.Element} El contenedor del canvas 3D.
 */
const DreamCanvas: React.FC<DreamCanvasProps> = ({ imageUrl }) => {
  return (
    <div className="w-full h-full absolute inset-0 rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <React.Suspense fallback={null}>
          <DreamPlane imageUrl={imageUrl} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default DreamCanvas;
