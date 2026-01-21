import { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Stage, PresentationControls, useGLTF, Html } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';

import { Loader2 } from 'lucide-react';

function Model({ url, filename }: { url: string; filename: string }) {
    const extension = (filename || 'model.glb').split('.').pop()?.toLowerCase();

    // GLTF/GLB
    if (extension === 'gltf' || extension === 'glb') {
        const { scene } = useGLTF(url);
        return <primitive object={scene} />;
    }

    // FBX
    if (extension === 'fbx') {
        const fbx = useLoader(FBXLoader, url);
        return <primitive object={fbx} />;
    }

    // OBJ
    if (extension === 'obj') {
        const obj = useLoader(OBJLoader, url);
        return <primitive object={obj} />;
    }

    // STL
    if (extension === 'stl') {
        const geometry = useLoader(STLLoader, url);
        return (
            <mesh geometry={geometry}>
                <meshStandardMaterial color="#6366f1" roughness={0.5} metalness={0.5} />
            </mesh>
        );
    }

    return (
        <Html center>
            <div className="text-white bg-red-500/20 p-2 rounded">
                Unsupported format: {extension}
            </div>
        </Html>
    );
}

export default function ThreeViewer({ url, filename }: { url: string; filename: string }) {
    // Key forces remount on url change properly
    return (
        <div className="w-full h-full min-h-[300px] relative bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-white/10">
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }} style={{ position: 'absolute', inset: 0 }}>
                <Suspense fallback={<Html center><Loader2 className="animate-spin text-primary w-8 h-8" /></Html>}>
                    <PresentationControls speed={1.5} global zoom={0.5} polar={[-0.1, Math.PI / 4]}>
                        <Stage environment="city" intensity={0.6}>
                            <Model url={url} filename={filename} />
                        </Stage>
                    </PresentationControls>
                </Suspense>
            </Canvas>
        </div>
    );
}
