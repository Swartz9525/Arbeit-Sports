import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Procedural 3D Athletic Shoe Model
function Shoe({ soleColor, bodyColor, lacesColor, accentColor }: {
  soleColor: string;
  bodyColor: string;
   lacesColor: string;
  accentColor: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Smooth rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} scale={[1.2, 1.2, 1.2]}>
      {/* Upper Mesh Body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.8, 0.5, 0.8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Front Toe Box */}
      <mesh position={[0.7, 0.25, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <boxGeometry args={[0.7, 0.3, 0.76]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>

      {/* Heel Accents */}
      <mesh position={[-0.8, 0.45, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.78]} />
        <meshStandardMaterial color={accentColor} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Dynamic Sole */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[2.0, 0.18, 0.92]} />
        <meshStandardMaterial color={soleColor} roughness={0.1} metalness={0.7} />
      </mesh>

      {/* Laces Assembly */}
      <group position={[0.2, 0.62, 0]}>
        <mesh rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.4, 0.05, 0.6]} />
          <meshStandardMaterial color={lacesColor} roughness={0.8} />
        </mesh>
        <mesh position={[0.1, 0.05, 0]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.4, 0.05, 0.55]} />
          <meshStandardMaterial color={lacesColor} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

export default function ShoeShowcase() {
  const [soleColor, setSoleColor] = useState('#8b5cf6'); // Violet
  const [bodyColor, setBodyColor] = useState('#1e1b4b'); // Deep Blue
  const [lacesColor, setLacesColor] = useState('#06b6d4'); // Cyan
  const [accentColor, setAccentColor] = useState('#ec4899'); // Pink

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8 w-full max-w-5xl mx-auto shadow-2xl">
      {/* 3D Canvas Box */}
      <div className="w-full md:w-2/3 h-80 md:h-[450px] relative rounded-xl overflow-hidden bg-gradient-to-br from-[#0c0c14] to-[#161624] border border-white/5">
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-violet-600/30 text-violet-400 text-xs font-semibold rounded-full border border-violet-500/30 uppercase tracking-widest">
            3D CUSTOMIZER
          </span>
        </div>

        <Canvas camera={{ position: [2.5, 1.5, 3.5], fov: 45 }}>
          <ambientLight intensity={1.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          
          <Shoe 
            soleColor={soleColor} 
            bodyColor={bodyColor} 
            lacesColor={lacesColor} 
            accentColor={accentColor} 
          />

          <ContactShadows position={[0, -0.22, 0]} opacity={0.65} scale={10} blur={2.5} far={4} />
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            minDistance={2} 
            maxDistance={6}
            maxPolarAngle={Math.PI / 2} 
          />
        </Canvas>
        
        <div className="absolute bottom-4 right-4 z-10 text-white/40 text-xs font-mono select-none">
          Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Customizer Panels */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-white mb-1">APEX RUNNER 3D</h3>
          <p className="text-zinc-400 text-sm">Customize materials and colorways in real time.</p>
        </div>

        <div className="space-y-4">
          {/* Sole color picker */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2 uppercase tracking-wide">Sole Finish</label>
            <div className="flex gap-2">
              {['#8b5cf6', '#ef4444', '#10b981', '#ffffff', '#27272a'].map((c) => (
                <button
                  key={c}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${soleColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                  onClick={() => setSoleColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Body color picker */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2 uppercase tracking-wide">Mesh Body</label>
            <div className="flex gap-2">
              {['#1e1b4b', '#18181b', '#06b6d4', '#e11d48', '#d97706'].map((c) => (
                <button
                  key={c}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${bodyColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                  onClick={() => setBodyColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Laces color picker */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2 uppercase tracking-wide">Athletic Laces</label>
            <div className="flex gap-2">
              {['#06b6d4', '#eab308', '#ffffff', '#ef4444', '#18181b'].map((c) => (
                <button
                  key={c}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${lacesColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                  onClick={() => setLacesColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Accent color picker */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2 uppercase tracking-wide">Heel Accent</label>
            <div className="flex gap-2">
              {['#ec4899', '#f97316', '#a855f7', '#10b981', '#ffffff'].map((c) => (
                <button
                  key={c}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                  onClick={() => setAccentColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="flex justify-between items-center text-sm font-semibold mb-3">
            <span className="text-zinc-400">Total Price</span>
            <span className="text-white text-lg">$189.99</span>
          </div>
          <button className="w-full py-3 btn-neon font-bold rounded-xl text-sm transition-all">
            ADD CUSTOM EDITION TO CART
          </button>
        </div>
      </div>
    </div>
  );
}
