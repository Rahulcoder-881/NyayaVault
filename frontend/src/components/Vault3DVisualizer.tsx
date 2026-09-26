import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { LifecycleStageId } from '../types';
import { LIFECYCLE_STAGES } from '../constants';
import { ShieldAlert, ShieldCheck, Cpu } from 'lucide-react';

interface Vault3DVisualizerProps {
  integrityScore: number;
  isTampered: boolean;
  activeStage: LifecycleStageId | null;
  onSelectStage: (stage: LifecycleStageId) => void;
  merkleRoot: string;
}

export const Vault3DVisualizer: React.FC<Vault3DVisualizerProps> = ({
  integrityScore,
  isTampered,
  activeStage,
  onSelectStage,
  merkleRoot
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Mesh refs for dynamic animation
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const wireMeshRef = useRef<THREE.Mesh | null>(null);
  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);
  const stageNodesRef = useRef<{ id: LifecycleStageId; mesh: THREE.Mesh; line: THREE.Line }[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 280;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(isTampered ? 0xef4444 : 0x06b6d4, 3.2, 50);
    pointLight.position.set(0, 2, 8);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(isTampered ? 0xb91c1c : 0x6366f1, 2.0, 40);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    // 4. Central Cryptographic Vault Core
    const coreGeo = new THREE.IcosahedronGeometry(2.2, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: isTampered ? 0xef4444 : 0x0891b2,
      roughness: 0.15,
      metalness: 0.9,
      wireframe: false,
      emissive: isTampered ? 0x7f1d1d : 0x0e7490,
      emissiveIntensity: 0.75
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // Wireframe Cage around Core
    const wireGeo = new THREE.IcosahedronGeometry(2.65, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: isTampered ? 0xf87171 : 0x67e8f9,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);
    wireMeshRef.current = wireMesh;

    // 5. Holographic Orbit Rings
    const ringGeo1 = new THREE.TorusGeometry(4.4, 0.045, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: isTampered ? 0xef4444 : 0x38bdf8,
      transparent: true,
      opacity: 0.65
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);
    ring1Ref.current = ring1;

    const ringGeo2 = new THREE.TorusGeometry(5.2, 0.035, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: isTampered ? 0xf87171 : 0x818cf8,
      transparent: true,
      opacity: 0.5
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);
    ring2Ref.current = ring2;

    // 6. 6 Lifecycle Stage Nodal Mesh Objects
    const stageNodes: { id: LifecycleStageId; mesh: THREE.Mesh; line: THREE.Line }[] = [];
    const radius = 5.2;

    LIFECYCLE_STAGES.forEach((stage, i) => {
      const angle = (i / LIFECYCLE_STAGES.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * (radius * 0.45);
      const z = Math.sin(angle) * 1.5;

      const nodeGeo = new THREE.SphereGeometry(0.44, 20, 20);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: stage.id === activeStage ? 0x38bdf8 : new THREE.Color(stage.color),
        emissive: stage.id === activeStage ? 0x0284c7 : new THREE.Color(stage.color),
        emissiveIntensity: 0.85,
        metalness: 0.6,
        roughness: 0.15
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, y, z);
      scene.add(nodeMesh);

      // Connecting ray from vault center to node
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: isTampered ? 0xef4444 : new THREE.Color(stage.color),
        transparent: true,
        opacity: 0.4
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      stageNodes.push({ id: stage.id, mesh: nodeMesh, line });
    });
    stageNodesRef.current = stageNodes;

    // 7. Dynamic Cryptographic Particle Nebula
    const partCount = 280;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(partCount * 3);
    for (let p = 0; p < partCount * 3; p += 3) {
      const r = 3 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      partPos[p] = r * Math.cos(phi) * Math.cos(theta);
      partPos[p + 1] = r * Math.sin(phi);
      partPos[p + 2] = r * Math.cos(phi) * Math.sin(theta);
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      size: 0.09,
      color: isTampered ? 0xf87171 : 0x38bdf8,
      transparent: true,
      opacity: 0.65
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const speed = isTampered ? 2.5 : 1.0;

      if (coreMeshRef.current) {
        coreMeshRef.current.rotation.y = elapsed * 0.25 * speed;
        coreMeshRef.current.rotation.x = elapsed * 0.15 * speed;
      }
      if (wireMeshRef.current) {
        wireMeshRef.current.rotation.y = -elapsed * 0.35 * speed;
        wireMeshRef.current.rotation.z = elapsed * 0.12 * speed;
      }
      if (ring1Ref.current) {
        ring1Ref.current.rotation.z = elapsed * 0.4 * speed;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.x = elapsed * 0.3 * speed;
      }

      // Orbital pulse on stage nodes
      stageNodesRef.current.forEach((item, idx) => {
        const pulse = 1 + Math.sin(elapsed * 2 + idx) * 0.12;
        item.mesh.scale.set(pulse, pulse, pulse);
      });

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [isTampered]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
      isTampered 
        ? 'border-red-500/50 bg-gradient-to-br from-red-950/40 via-slate-950 to-red-950/20 glow-crimson' 
        : 'border-cyan-500/25 bg-gradient-to-br from-slate-950 via-slate-900/90 to-cyan-950/30 glow-cyan'
    }`}>
      {/* 3D Canvas Mount */}
      <div 
        ref={mountRef} 
        className="w-full h-64 md:h-72 cursor-pointer"
        title="Interactive 3D Cryptographic Vault Core & Nodal Lifecycle Timeline"
      />

      {/* Floating HUD Badges Overlay */}
      <div className="absolute top-3 left-4 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className={`px-3 py-1.5 rounded-xl border backdrop-blur-md flex items-center space-x-2 shadow-lg ${
          isTampered 
            ? 'bg-red-950/85 border-red-500/60 text-red-200' 
            : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
        }`}>
          {isTampered ? (
            <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          )}
          <div className="text-xs font-bold tracking-wider uppercase font-mono">
            {isTampered ? 'TAMPER ALERT // QUARANTINE ENFORCED' : `CRYPTOGRAPHIC VAULT // ${integrityScore}% CONSENSUS`}
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700/60 text-slate-300 text-xs font-mono shadow-md">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>FIPS 180-4 SHA-256</span>
        </div>
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>THREE.JS WEBGL RENDERER</span>
        </div>
      </div>

      {/* Top Right Live Telemetry */}
      <div className="absolute top-3 right-4 flex items-center space-x-2">
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/85 border border-slate-800/90 backdrop-blur-md shadow-lg flex items-center space-x-2">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">Merkle Tree Root</div>
            <div className={`text-xs font-mono font-bold truncate max-w-[130px] sm:max-w-[200px] ${
              isTampered ? 'text-red-400' : 'text-cyan-400'
            }`}>
              {merkleRoot ? `${merkleRoot.substring(0, 16)}...` : 'CALCULATING...'}
            </div>
          </div>
          {merkleRoot && (
            <button
              onClick={() => navigator.clipboard.writeText(merkleRoot)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-300 text-slate-400 border border-slate-700 text-xs transition-colors"
              title="Copy Merkle Root Hash"
            >
              <Cpu className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Stage Selector Quick Bar */}
      <div className="absolute bottom-2.5 inset-x-2.5 sm:inset-x-4 p-2 rounded-xl bg-slate-950/85 border border-slate-800/90 backdrop-blur-md flex items-center justify-between overflow-x-auto text-xs space-x-1 shadow-xl">
        <span className="text-[11px] font-mono text-slate-400 px-2 uppercase tracking-wider shrink-0 hidden md:inline">
          6-Stage Custody:
        </span>
        <div className="flex items-center space-x-1 w-full justify-between">
          {LIFECYCLE_STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectStage(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeStage === s.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: s.color }}
              />
              <span className="hidden sm:inline">Stage {s.id}:</span>
              <span>{s.shortName}</span>
            </button>
          ))}
          {activeStage !== null && (
            <button
              onClick={() => onSelectStage(null as any)}
              className="text-[11px] text-cyan-400 hover:underline px-2 shrink-0 font-mono"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
