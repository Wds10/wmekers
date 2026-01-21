
import { Box, Hexagon, Triangle, Circle } from 'lucide-react';

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-[#050510]" />

            {/* Animated Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* Floating Shapes */}
            <div className="absolute top-20 left-10 animate-float-slow opacity-20 text-blue-500">
                <Box size={64} strokeWidth={1} />
            </div>
            <div className="absolute bottom-40 right-20 animate-float-medium opacity-20 text-purple-500">
                <Hexagon size={80} strokeWidth={1} />
            </div>
            <div className="absolute top-1/3 right-1/4 animate-float-fast opacity-10 text-pink-500">
                <Triangle size={48} strokeWidth={1} />
            </div>
            <div className="absolute bottom-10 left-1/3 animate-pulse opacity-10 text-cyan-500">
                <Circle size={32} strokeWidth={1} />
            </div>

            {/* Glow Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-1000" />
        </div>
    );
}
