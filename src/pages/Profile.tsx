import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingBag, Download } from 'lucide-react';


export default function Profile() {
    const { user, profile } = useAuth();
    const [myModels, setMyModels] = useState<any[]>([]);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);

        // 1. Fetch My Models (if creator)
        const { data: models } = await supabase
            .from('models')
            .select('*')
            .eq('seller_id', user.id);
        setMyModels(models || []);

        // 2. Fetch Purchases
        const { data: txs } = await supabase
            .from('transactions')
            .select('*, models(*)')
            .eq('buyer_id', user.id)
            .eq('status', 'completed');

        setPurchases(txs || []);
        setLoading(false);
    };

    const handleDownload = async (path: string, filename: string) => {
        const { data } = await supabase.storage.from('models').download(path);
        if (data) {
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center text-4xl font-bold text-gray-500 border border-white/10">
                    {profile?.full_name?.[0] || user?.email?.[0]}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{profile?.full_name}</h1>
                    <p className="text-gray-400">{user?.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-sm border border-white/10 capitalize">
                            {profile?.role} Account
                        </span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-sm border border-white/10">
                            {profile?.country}
                        </span>
                    </div>
                </div>
            </div>

            {/* Creator Section */}
            {profile?.role === 'creator' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center space-x-2">
                        <Package className="text-primary" />
                        <span>My Models</span>
                    </h2>

                    {myModels.length === 0 ? (
                        <p className="text-gray-500">You haven't uploaded any models yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {myModels.map(model => (
                                <div key={model.id} className="bg-surface rounded-xl p-4 border border-white/5">
                                    <div className="font-bold mb-1">{model.title}</div>
                                    <div className="text-sm text-gray-400 mb-2">${model.price}</div>
                                    <div className="text-xs text-gray-500">{new Date(model.created_at).toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Purchases Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                    <ShoppingBag className="text-blue-500" />
                    <span>My Library</span>
                </h2>

                {purchases.length === 0 ? (
                    <p className="text-gray-500">You haven't made any purchases yet.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {purchases.map(tx => (
                            <div key={tx.id} className="bg-surface rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-black/50 rounded-lg overflow-hidden relative">
                                        {/* Thumbnail or Icon */}
                                        <Package className="w-full h-full p-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{tx.models?.title}</div>
                                        <div className="text-sm text-gray-400">Purchased on {new Date(tx.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownload(tx.models?.file_path, tx.models?.file_path.split('/').pop())}
                                    className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Download size={18} />
                                    <span>Download</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
