import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, ShoppingBag } from 'lucide-react';

export default function Marketplace() {
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['Characters', 'Vehicles', 'Environment', 'Props', 'Animals', 'Weapons'];

    useEffect(() => {
        fetchModels();
    }, [selectedCategory]);

    const fetchModels = async () => {
        setLoading(true);
        let query = supabase
            .from('models')
            .select('*, profiles(full_name)');

        if (selectedCategory !== 'All') {
            if (selectedCategory === 'Free') {
                query = query.eq('price', 0);
            } else {
                query = query.eq('category', selectedCategory);
            }
        }

        const { data, error } = await query;
        if (error) console.error(error);
        else setModels(data || []);

        setLoading(false);
    };

    const filteredModels = models.filter(
        model => model.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <h1 className="text-3xl font-bold">Marketplace</h1>

                <div className="flex w-full md:w-auto gap-4">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface border border-white/10 rounded-lg py-2 pl-10 pr-4 focus:border-primary focus:outline-none"
                        />
                    </div>

                    {/* Category Buttons */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'All'
                                ? 'bg-primary text-white'
                                : 'bg-surface border border-white/10 text-gray-400 hover:text-white'
                                }`}
                        >
                            All Models
                        </button>
                        <button
                            onClick={() => setSelectedCategory('Free')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'Free'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                : 'bg-surface border border-white/10 text-gray-400 hover:text-white'
                                }`}
                        >
                            Free
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat
                                    ? 'bg-primary text-white'
                                    : 'bg-surface border border-white/10 text-gray-400 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredModels.map((model) => (
                        <Link to={`/model/${model.id}`} key={model.id} className="group bg-surface rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                            <div className="aspect-[4/3] bg-black/50 relative overflow-hidden">
                                {model.preview_path ? (
                                    <img
                                        src={`${supabase.storage.from('previews').getPublicUrl(model.preview_path).data.publicUrl}?t=${new Date().getTime()}`}
                                        alt={model.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
                                        <div className="text-center p-4">
                                            <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                                <ShoppingBag size={24} className="opacity-50" />
                                            </div>
                                            <span className="text-sm font-medium">No Preview</span>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-sm font-bold border border-white/10">
                                    ${model.price}
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">{model.title}</h3>
                                <p className="text-sm text-gray-400 mb-3 ml-1">by {model.profiles?.full_name}</p>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="bg-white/5 px-2 py-1 rounded text-gray-300">{model.category}</span>
                                    <button className="text-primary hover:text-white transition-colors">
                                        <ShoppingBag size={18} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
