import { Box, Hexagon, Triangle, Circle, Star, Sparkles } from 'lucide-react';

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Deep Cyberpunk Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0a0a12] to-[#12001f]" />

            {/* Noise & Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* Neon Glow Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-700" />
            <div className="absolute top-[40%] left-[40%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-bounce duration-[10s]" />

            {/* Floating Shapes */}
            <div className="absolute top-20 left-10 animate-float-slow opacity-30 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <Box size={64} strokeWidth={1} />
            </div>
            <div className="absolute bottom-40 right-20 animate-float-medium opacity-30 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                <Hexagon size={80} strokeWidth={1} />
            </div>
            <div className="absolute top-1/3 right-1/4 animate-float-fast opacity-20 text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                <Triangle size={48} strokeWidth={1} />
            </div>
            <div className="absolute bottom-10 left-1/3 animate-pulse opacity-20 text-cyan-500">
                <Circle size={32} strokeWidth={1} />
            </div>

            {/* Sparkles / Stars */}
            <div className="absolute top-1/4 left-1/2 animate-ping opacity-40 text-yellow-200 duration-[3s]">
                <Star size={16} fill="currentColor" />
            </div>
            <div className="absolute top-3/4 right-1/3 animate-ping opacity-30 text-white duration-[5s] delay-1000">
                <Sparkles size={24} />
            </div>
            <div className="absolute top-10 right-10 animate-spin-slow opacity-20 text-gray-400">
                <Box size={24} />
            </div>
        </div>
    );
}
