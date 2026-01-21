
import { Link } from 'react-router-dom';
import { ArrowRight, Box, ShieldCheck, Zap } from 'lucide-react';
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

                <div className="absolute top-10 left-[-50px] md:left-10 w-72 h-72 md:w-[500px] md:h-[500px] opacity-100 animate-float-slow pointer-events-none z-0">
                    <img
                        src="https://images.unsplash.com/photo-1541434969-92c2b37aa0a5?q=80&w=1000&auto=format&fit=crop"
                        alt="3D Spaceship"
                        className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(168,85,247,0.5)] mask-image-gradient transform -rotate-12"
                    />
                </div>
                <div className="absolute top-20 right-[-50px] md:right-10 w-64 h-64 md:w-[450px] md:h-[450px] opacity-100 animate-float-medium pointer-events-none z-0 mix-blend-lighten">
                    <img
                        src="https://images.unsplash.com/photo-1614726365723-49cfa1118671?q=80&w=500&auto=format&fit=crop"
                        alt="3D Sphere"
                        className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.6)] rounded-full"
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
            {/* Features Section with Side Characters */}
            <section className="relative z-10 py-20 px-4 w-full overflow-hidden">
                <div className="max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_2fr_1fr] gap-8 items-center">

                    {/* LEFT SIDE CHARACTERS (Hidden on mobile) */}
                    <div className="hidden xl:flex flex-col gap-12 items-center p-4 animate-in slide-in-from-left duration-1000">
                        <img src="https://images.unsplash.com/photo-1613771404721-c5b4e3f43350?auto=format&fit=crop&w=500&q=80" className="w-48 h-48 object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.5)] animate-float-slow hover:scale-110 transition-transform rounded-xl grayscale-[0.2]" alt="Charizard 3D" />
                        <img src="https://images.unsplash.com/photo-1596727147705-53a9d020d0e1?auto=format&fit=crop&w=500&q=80" className="w-56 h-56 object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-float-medium hover:scale-110 transition-transform rounded-xl grayscale-[0.2]" alt="Mewtwo 3D" />
                        <img src="https://images.unsplash.com/photo-1626278664285-f796b961805d?auto=format&fit=crop&w=500&q=80" className="w-32 h-32 object-contain drop-shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-float-fast hover:scale-110 transition-transform rounded-xl secondary" alt="Groot 3D" />
                    </div>

                    {/* CENTER FEATURES (Original Content) */}
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                ¿Por qué W3D Market?
                            </h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                                La plataforma definitiva para tus necesidades de impresión 3D.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Box className="text-secondary" size={32} />,
                                    title: t.home.feat_quality_title,
                                    desc: t.home.feat_quality_desc,
                                    color: "from-secondary/20 to-purple-900/20"
                                },
                                {
                                    icon: <ShieldCheck className="text-blue-400" size={32} />,
                                    title: t.home.feat_secure_title,
                                    desc: t.home.feat_secure_desc,
                                    color: "from-blue-500/20 to-cyan-900/20"
                                },
                                {
                                    icon: <Zap className="text-green-400" size={32} />,
                                    title: t.home.feat_instant_title,
                                    desc: t.home.feat_instant_desc,
                                    color: "from-green-500/20 to-emerald-900/20"
                                }
                            ].map((feature, i) => (
                                <div key={i} className={`p-6 rounded-2xl bg-gradient-to-br ${feature.color} border border-white/10 backdrop-blur-sm hover:translate-y-[-5px] transition-all duration-300 group`}>
                                    <div className="mb-4 p-3 bg-black/40 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300 border border-white/5">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-100">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE CHARACTERS (Hidden on mobile) */}
                    <div className="hidden xl:flex flex-col gap-12 items-center p-4 animate-in slide-in-from-right duration-1000">
                        <img src="https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=500&q=80" className="w-56 h-56 object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-float-medium hover:scale-110 transition-transform" alt="Spiderman" />
                        <img src="https://images.unsplash.com/photo-1608270586620-25fd19606384?auto=format&fit=crop&w=500&q=80" className="w-48 h-48 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-float-slow hover:scale-110 transition-transform" alt="Optimus" />
                        <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80" className="w-64 h-32 object-contain drop-shadow-[0_0_20px_rgba(236,72,153,0.5)] animate-float-fast hover:scale-110 transition-transform" alt="Car" />
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
