import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DEMO_MODELS = [
    // Free Section (Pokemon / Plants) - Using 3D Renders (Home)
    { id: '1', title: 'Charizard (Dragón Fuego)', price: 0, category: 'Characters', preview_path: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/6.png', profiles: { full_name: 'Nintendo Fan' } },
    { id: '2', title: 'Mewtwo (Psíquico)', price: 0, category: 'Characters', preview_path: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/150.png', profiles: { full_name: 'Legendary' } },
    { id: '3', title: 'Groot (Baby)', price: 0, category: 'Characters', preview_path: 'https://images.unsplash.com/photo-1626278664285-f796b961805d?auto=format&fit=crop&w=500&q=80', profiles: { full_name: 'Marvel Fan' } },
    { id: '4', title: 'Pikachu (Eléctrico)', price: 0, category: 'Characters', preview_path: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/25.png', profiles: { full_name: 'Ash K.' } },

    // Premium Section (Robots / Cars / Heroes)
    { id: '5', title: 'Optimus Prime (Líder)', price: 15, category: 'Vehicles', preview_path: 'https://images.unsplash.com/photo-1608270586620-25fd19606384?auto=format&fit=crop&w=500&q=80', profiles: { full_name: 'Cybertron' } },
    { id: '6', title: 'Spider-Hero (Action Pose)', price: 12, category: 'Characters', preview_path: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=500&q=80', profiles: { full_name: 'Spidey' } },
    { id: '7', title: 'Caballero Z (Pegaso)', price: 20, category: 'Characters', preview_path: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=500&q=80', profiles: { full_name: 'Cosmo' } },
    { id: '8', title: 'Cyber Sport Car 2077', price: 25, category: 'Vehicles', preview_path: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80', profiles: { full_name: 'Racer X' } }
];



export default function Marketplace() {
    const { t } = useLanguage();
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');



    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        setLoading(true);
        // Fetch ALL models (no filtering by category for now, or just 'All')
        let query = supabase
            .from('models')
            .select('*, profiles(full_name)');

        const { data, error } = await query;
        if (error) {
            console.error(error);
        } else {
            // Include Demo Models if DB is empty to satisfy user request for specific "Objects"
            if (!data || data.length === 0) {
                setModels(DEMO_MODELS);
            } else {
                setModels(data);
            }
        }

        setLoading(false);
    };



    const allModels = models.filter(
        model => (model.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const premiumModels = allModels.filter(m => m.price > 0);
    const freeModels = allModels.filter(m => m.price === 0);

    const ModelGrid = ({ list }: { list: any[] }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {list.map((model) => (
                <Link to={`/model/${model.id}`} key={model.id} className="group bg-surface/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                    <div className="aspect-[4/3] bg-black/50 relative overflow-hidden">
                        {model.preview_path ? (
                            <img
                                src={model.preview_path.startsWith('http')
                                    ? model.preview_path
                                    : `${supabase.storage.from('previews').getPublicUrl(model.preview_path).data.publicUrl}?t=${new Date().getTime()}`
                                }
                                alt={model.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 animate-float-slow"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
                                <span className="text-sm font-medium">No Preview</span>
                            </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-sm font-bold border border-white/10">
                            {model.price === 0 ? t.product.free : `$${model.price}`}
                        </div>
                    </div>

                    <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">{model.title}</h3>
                        <div className="flex items-center justify-between text-sm">
                            <span className="bg-white/5 px-2 py-1 rounded text-gray-400">{model.category || 'Model'}</span>
                            <button className="text-primary hover:text-white transition-colors">
                                <ShoppingBag size={18} />
                            </button>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );

    return (
        <div className="space-y-12">
            {/* Header & Search NO FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface/30 p-4 rounded-2xl backdrop-blur-md border border-white/5">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">{t.nav.market}</h1>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={t.marketplace.search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:border-primary focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Grid or Empty State */}
            {loading ? (
                <div className="text-center py-20 animate-pulse">Loading...</div>
            ) : (
                <div className="space-y-12">
                    {/* PREMIUM SECTION */}
                    {premiumModels.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-1 h-8 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"></span>
                                <span className="text-yellow-400">Premium</span>
                            </h2>
                            <ModelGrid list={premiumModels} />
                        </section>
                    )}

                    {/* FREE SECTION */}
                    {freeModels.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-1 h-8 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"></span>
                                <span className="text-green-400">{t.marketplace.free_header || 'Gratis'}</span>
                            </h2>
                            <ModelGrid list={freeModels} />
                        </section>
                    )}

                    {premiumModels.length === 0 && freeModels.length === 0 && (
                        <div className="text-center py-20 text-gray-500">No models found.</div>
                    )}
                </div>
            )}
        </div>
    );
}
