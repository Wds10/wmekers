
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
                        src="/models_sliced/hero_xwing.png"
                        alt="3D Spaceship"
                        className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(168,85,247,0.5)] transform -rotate-12 filter brightness-125"
                    />
                </div>
                <div className="absolute top-20 right-[-50px] md:right-10 w-64 h-64 md:w-[450px] md:h-[450px] opacity-100 animate-float-medium pointer-events-none z-0 mix-blend-lighten">
                    <img
                        src="/models_sliced/hero_sphere.png"
                        alt="3D Sphere"
                        className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.6)] rounded-full filter brightness-125"
                    />
                </div>

                <div className="relative z-10 text-center space-y-6 max-w-4xl px-4">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/50 border border-white/20 backdrop-blur-md text-sm text-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        <span className="tracking-wide uppercase text-xs font-bold text-left whitespace-normal">Unete a la Revolución</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 text-glow drop-shadow-2xl">
                        Comenzá Tu Modelo 3D <br />
                        <span className="text-white">Hoy Mismo</span>
                    </h1>

                    <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
                        Acceso perfecto a miles de archivos. Ir al Mercado.
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
            {/* Features Section with Side Characters (2x2 Grids) */}
            <section className="relative z-10 py-20 px-4 w-full overflow-hidden">
                {/* Reference Background */}
                <div className="absolute inset-0 bg-[url('/images/reference_collage.png')] bg-cover bg-center opacity-5 pointer-events-none mix-blend-overlay"></div>

                <div className="max-w-[1920px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_1.5fr_1fr] gap-4 items-center relative z-10">

                    {/* LEFT SIDE CHARACTERS (2x2 Grid) */}
                    <div className="hidden xl:grid grid-cols-2 gap-6 p-4 animate-in slide-in-from-left duration-1000">
                        <img src="/models_sliced/char_charizard.png" className="w-full h-48 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.6)] hover:scale-110 transition-transform filter brightness-125 contrast-125" alt="Charizard" />
                        <img src="/models_sliced/char_mewtwo.png" className="w-full h-48 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.6)] hover:scale-110 transition-transform mt-8 filter brightness-125 contrast-125" alt="Mewtwo" />
                        <img src="/models_sliced/char_groot.png" className="w-full h-48 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:scale-110 transition-transform filter brightness-125 contrast-125" alt="Groot" />
                        <img src="/models_sliced/char_seiya_1.png" className="w-full h-48 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] hover:scale-110 transition-transform mt-8 filter brightness-125 contrast-125" alt="Saint Seiya" />
                    </div>

                    {/* CENTER FEATURES */}
                    <div className="max-w-4xl mx-auto space-y-12 px-4">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center gap-8 mb-8">
                                <img src="/models_sliced/hero_xwing.png" className="h-24 object-contain animate-float-slow" alt="X-Wing" />
                                <img src="/models_sliced/hero_sphere.png" className="h-24 object-contain animate-float-medium" alt="Sphere" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                                ¿Por qué W3D Market?
                            </h2>
                            <p className="text-gray-300 max-w-2xl mx-auto text-lg drop-shadow-md">
                                La plataforma definitiva para tus necesidades de impresión 3D en Argentina.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: <Box className="text-purple-400" size={32} />,
                                    title: t.home.feat_quality_title,
                                    desc: t.home.feat_quality_desc,
                                    color: "from-purple-900/40 to-indigo-900/40"
                                },
                                {
                                    icon: <ShieldCheck className="text-blue-400" size={32} />,
                                    title: t.home.feat_secure_title,
                                    desc: t.home.feat_secure_desc,
                                    color: "from-blue-900/40 to-cyan-900/40"
                                },
                                {
                                    icon: <Zap className="text-pink-400" size={32} />,
                                    title: t.home.feat_instant_title,
                                    desc: t.home.feat_instant_desc,
                                    color: "from-pink-900/40 to-fuchsia-900/40"
                                }
                            ].map((feature, i) => (
                                <div key={i} className={`p-6 rounded-2xl bg-gradient-to-br ${feature.color} border border-white/10 backdrop-blur-md hover:translate-y-[-5px] transition-all duration-300 group shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]`}>
                                    <div className="mb-4 p-3 bg-black/60 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300 border border-white/10 shadow-inner">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE CHARACTERS (2x2 Grid) */}
                    <div className="hidden xl:grid grid-cols-2 gap-6 p-4 animate-in slide-in-from-right duration-1000">
                        <img src="/models_sliced/char_seiya_2.png" className="w-full h-48 object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:scale-105 transition-transform filter brightness-125 contrast-125" alt="Saint Seiya 2" />
                        <img src="/models_sliced/char_spiderman.png" className="w-full h-48 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.6)] hover:scale-105 transition-transform mt-8 filter brightness-125 contrast-125" alt="Spiderman" />
                        <img src="/models_sliced/vehicle_optimus.png" className="w-full h-48 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] hover:scale-105 transition-transform filter brightness-125 contrast-125" alt="Optimus" />
                        <img src="/models_sliced/vehicle_car.png" className="w-full h-48 object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.6)] hover:scale-105 transition-transform mt-8 filter brightness-125 contrast-125" alt="Car" />
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
