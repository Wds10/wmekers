
import { Link } from 'react-router-dom';
import { ArrowRight, Box, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
    const { t } = useLanguage();

    return (

        <div className="space-y-16 min-h-screen pb-20">
            {/* Futuristic Hero Section */}
            <section className="relative h-[500px] flex items-center justify-center overflow-hidden rounded-3xl mx-4 mt-4 glass border-white/5 shadow-2xl group">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-black to-secondary/40 opacity-80 group-hover:scale-105 transition-transform duration-[2s]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

                <div className="absolute top-10 right-10 w-64 h-64 md:w-96 md:h-96 opacity-80 animate-float-slow pointer-events-none z-0">
                    <img
                        src="https://images.unsplash.com/photo-1541434969-92c2b37aa0a5?q=80&w=1000&auto=format&fit=crop"
                        alt="3D Spaceship"
                        className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.5)] mask-image-gradient"
                    />
                </div>
                <div className="absolute bottom-10 left-10 w-48 h-48 opacity-60 animate-float-medium pointer-events-none z-0 mix-blend-screen">
                    <img
                        src="https://images.unsplash.com/photo-1614726365723-49cfa1118671?q=80&w=500&auto=format&fit=crop"
                        alt="3D Sphere"
                        className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(236,72,153,0.5)] rounded-full"
                    />
                </div>

                <div className="relative z-10 text-center space-y-6 max-w-4xl px-4">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/50 border border-white/20 backdrop-blur-md text-sm text-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        <span className="tracking-wide uppercase text-xs font-bold text-left whitespace-normal">{t.home.hero_badge}</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 text-glow drop-shadow-2xl">
                        {t.home.hero_title_1} <br />
                        <span className="text-white">{t.home.hero_title_2}</span>
                    </h1>

                    <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
                        {t.home.hero_desc}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                        <Link to="/market" className="px-10 py-5 bg-white text-black rounded-full font-bold hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all flex items-center gap-3">
                            <span>{t.home.btn_explore}</span>
                            <ArrowRight size={20} />
                        </Link>

                    </div>
                </div>
            </section>

            {/* "Spotify-style" Categories/Features */}
            <section className="px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-8 bg-primary rounded-full"></span>
                        Why W3D Market?
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-8 rounded-2xl group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Box size={120} />
                        </div>
                        <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(131,0,233,0.3)]">
                            <Box size={28} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">{t.home.feat_quality_title}</h3>
                        <p className="text-muted leading-relaxed">{t.home.feat_quality_desc}</p>
                    </div>

                    <div className="glass-card p-8 rounded-2xl group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShieldCheck size={120} />
                        </div>
                        <div className="w-14 h-14 bg-secondary/20 rounded-full flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,210,255,0.3)]">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">{t.home.feat_secure_title}</h3>
                        <p className="text-muted leading-relaxed">{t.home.feat_secure_desc}</p>
                    </div>

                    <div className="glass-card p-8 rounded-2xl group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Box size={120} />
                        </div>
                        <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(29,185,84,0.3)]">
                            <Box size={28} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">{t.home.feat_instant_title}</h3>
                        <p className="text-muted leading-relaxed">{t.home.feat_instant_desc}</p>
                    </div>
                </div>
            </section>

            {/* "Mercado Libre style" Call to Action Banner */}
            <section className="px-4">
                <div className="rounded-3xl bg-gradient-to-r from-gray-900 to-black border border-white/10 p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-4xl font-black mb-4 tracking-tight">Join the Revolution</h2>
                        <p className="text-lg text-gray-400 mb-8">Start selling your 3D models today or find the perfect assets for your next project.</p>
                        <Link to="/market" className="inline-block border-b-2 border-primary text-white hover:text-primary transition-colors pb-1 text-lg font-bold">
                            Go to Marketplace &rarr;
                        </Link>
                    </div>
                    {/* Decorative Elements */}
                    <div className="relative z-10 flex gap-4">
                        <div className="w-32 h-40 bg-surface rounded-xl rotate-[-6deg] border border-white/10 shadow-2xl glass-card flex items-center justify-center">
                            <Box className="text-gray-600" size={40} />
                        </div>
                        <div className="w-32 h-40 bg-surface rounded-xl rotate-[6deg] border border-white/10 shadow-2xl glass-card flex items-center justify-center mt-8">
                            <Box className="text-primary" size={40} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
