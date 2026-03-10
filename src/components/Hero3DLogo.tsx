"use client";

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, useTexture, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function CoinMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef1 = useRef<THREE.MeshStandardMaterial>(null);
  const materialRef2 = useRef<THREE.MeshStandardMaterial>(null);
  
  // Textura del logo
  const texture = useTexture('/images/omega-logo.jpeg');
  texture.colorSpace = THREE.SRGBColorSpace;
  // Mejorar drásticamente la calidad de textura para que no se pixele
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  // Centrar el eje para poder rotar y hacer zoom
  texture.center.set(0.5, 0.5);
  // Rotar 90 grados para que la parte esférica apunte hacia arriba
  texture.rotation = Math.PI / 2;
  // Hacer ZOOM IN PROFUNO (63%) a la textura para comerse todo el 
  // ancho del margen negro y que el borde del cilindro sea el anillo dorado puro
  texture.repeat.set(0.63, 0.63);
  texture.needsUpdate = true;
  
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotación fija (leve ángulo) para notar el grosor 3D, sin que gire eternamente
      const targetRotationY = hovered ? 0 : 0.45; 
      const targetRotationX = hovered ? -0.15 : 0; 

      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.08);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.08);
    }

    // Interpolar suavemente el emisivo "abrillantado"
    const targetIntensity = hovered ? 0.8 : 0.2; // 0.2 de luz base para que no se vea oscuro
    if (materialRef1.current) {
      materialRef1.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef1.current.emissiveIntensity, targetIntensity, 0.1);
    }
    if (materialRef2.current) {
      materialRef2.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef2.current.emissiveIntensity, targetIntensity, 0.1);
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHover(true)} 
      onPointerOut={() => setHover(false)}
      scale={[1.15, 1.15, 1.15]} 
    >
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        {/* cylinderGeometry args: [radiusTop, radiusBottom, height, radialSegments] */}
        <cylinderGeometry args={[2, 2, 0.2, 64]} /> {/* Ligeramente más fina para mayor realismo */}

        {/* material-0: Side Rim (Lado dorado puro más billante) */}
        <meshStandardMaterial 
          attach="material-0" 
          color="#eab308" 
          metalness={0.7} 
          roughness={0.25} 
        />
        
        {/* material-1: Face Cap (Cara frontal con logo) */}
        <meshStandardMaterial 
          ref={materialRef1}
          attach="material-1" 
          map={texture} 
          emissiveMap={texture} // Usa la misma textura como emisor de luz propia
          metalness={0.6} 
          roughness={0.4} 
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
        
        {/* material-2: Back Cap (Cara trasera con logo) */}
        <meshStandardMaterial 
          ref={materialRef2}
          attach="material-2" 
          map={texture} 
          emissiveMap={texture}
          metalness={0.6} 
          roughness={0.4} 
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

export default function Hero3DLogo() {
  return (
    <div className="w-full h-[400px] md:h-[550px] relative z-20 cursor-grab active:cursor-grabbing flex items-center justify-center">
      <Canvas 
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        dpr={[1, 2]} // Usa el pixel ratio nativo del dispositivo para más nitidez
      >
        
        <ambientLight intensity={1.5} />
        
        {/* Luz de acento blanco/neutro para dar volumen */}
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={2.5} 
          color="#ffffff" 
          castShadow 
        />
        
        {/* Luz lateral dorada vibrante */}
        <pointLight position={[-5, -5, 2]} intensity={2} color="#dda124" />
        
        <Float 
          speed={2.5} 
          rotationIntensity={0.6} 
          floatIntensity={1.2} 
          floatingRange={[-0.3, 0.3]} 
        >
          <CoinMesh />
        </Float>
        
        {/* Base de sombra contra el piso para efecto levitación */}
        <ContactShadows position={[0, -2.8, 0]} opacity={0.65} scale={15} blur={2.5} far={4} color="#000000" />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
