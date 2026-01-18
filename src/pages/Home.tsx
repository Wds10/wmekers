
import { Link } from 'react-router-dom';
import { ArrowRight, Box, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
    const { t } = useLanguage();

    return (
        <div className="space-y-24">
            {/* Hero Section */}
            <section className="relative pt-10">
                <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full w-1/2 h-1/2 top-0 left-1/4 -z-10" />

                <div className="text-center max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>{t.home.hero_badge}</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        {t.home.hero_title_1} <br />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {t.home.hero_title_2}
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400">
                        {t.home.hero_desc}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                        <Link to="/market" className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all flex items-center space-x-2">
                            <span>{t.home.btn_explore}</span>
                            <ArrowRight size={20} />
                        </Link>
                        <Link to="/register" className="px-8 py-4 bg-surface border border-white/10 text-white rounded-full font-bold hover:bg-white/5 transition-all">
                            {t.home.btn_creator}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-2xl bg-surface border border-white/5 hover:border-primary/50 transition-colors group">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Box className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t.home.feat_quality_title}</h3>
                    <p className="text-gray-400">{t.home.feat_quality_desc}</p>
                </div>

                <div className="p-8 rounded-2xl bg-surface border border-white/5 hover:border-blue-500/50 transition-colors group">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t.home.feat_secure_title}</h3>
                    <p className="text-gray-400">{t.home.feat_secure_desc}</p>
                </div>

                <div className="p-8 rounded-2xl bg-surface border border-white/5 hover:border-purple-500/50 transition-colors group">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Box className="text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t.home.feat_instant_title}</h3>
                    <p className="text-gray-400">{t.home.feat_instant_desc}</p>
                </div>
            </section>
        </div>
    );
}
