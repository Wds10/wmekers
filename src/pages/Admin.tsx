import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Users, DollarSign, Box } from 'lucide-react';

export default function Admin() {
    const { profile, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'inventory'>('users');
    const [stats, setStats] = useState({ users: 0, models: 0, revenue: 0 });
    const [users, setUsers] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Inventory State
    const [uploading, setUploading] = useState(false);
    const [models, setModels] = useState<any[]>([]);
    const [newItem, setNewItem] = useState({ title: '', description: '', price: 0, category: 'Characters' });
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    useEffect(() => {
        if (profile?.role === 'admin') {
            fetchStats();
            if (activeTab === 'users') fetchUsers();
            if (activeTab === 'transactions') fetchTransactions();
            if (activeTab === 'inventory') fetchModels();
        }
    }, [profile, activeTab]);

    const fetchStats = async () => {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: modelCount } = await supabase.from('models').select('*', { count: 'exact', head: true });
        const { data: txs } = await supabase.from('transactions').select('platform_fee');
        const revenue = txs?.reduce((acc: any, tx: any) => acc + tx.platform_fee, 0) || 0;
        setStats({ users: userCount || 0, models: modelCount || 0, revenue });
        setLoading(false);
    };

    const fetchUsers = async () => {
        const { data } = await supabase.from('profiles').select('*').limit(20);
        if (data) setUsers(data);
    };

    const fetchTransactions = async () => {
        const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(20);
        if (data) setTransactions(data);
    };

    const fetchModels = async () => {
        const { data } = await supabase.from('models').select('*').order('created_at', { ascending: false });
        if (data) setModels(data);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setUploading(true);
            if (!modelFile || !previewFile || !newItem.title) {
                alert("Please fill all fields and select files");
                return;
            }

            const modelExt = modelFile.name.split('.').pop();
            const modelPath = `uploads/${Date.now()}_${modelFile.name.replace(/\s/g, '_')}`;
            const previewPath = `uploads/${Date.now()}_preview_${previewFile.name.replace(/\s/g, '_')}`;

            // Upload Model
            const { error: modelErr } = await supabase.storage.from('models').upload(modelPath, modelFile);
            if (modelErr) throw modelErr;

            // Upload Preview
            const { error: prevErr } = await supabase.storage.from('previews').upload(previewPath, previewFile);
            if (prevErr) throw prevErr;

            // Insert DB
            const { error: dbErr } = await supabase.from('models').insert({
                title: newItem.title,
                description: newItem.description,
                price: Number(newItem.price),
                category: newItem.category,
                file_path: modelPath,
                preview_path: previewPath,
                seller_id: user?.id
            });
            if (dbErr) throw dbErr;

            alert("Item added successfully!");
            setNewItem({ title: '', description: '', price: 0, category: 'Characters' });
            setModelFile(null);
            setPreviewFile(null);
            fetchModels();
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteModel = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await supabase.from('models').delete().eq('id', id);
        fetchModels();
    };

    if (loading) return <div>Loading...</div>;

    if (!user) {
        // Redirect to login if not logged in
        window.location.href = '/login';
        return null;
    }

    if (profile?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold text-red-500">Access Denied: Admin Only</h2>
                <div className="bg-surface p-6 rounded-lg border border-white/10 text-left max-w-md w-full">
                    <p className="text-gray-400 mb-2">Debug Information:</p>
                    <p><strong>User ID:</strong> <span className="font-mono text-sm">{user?.id || 'Not Logged In'}</span></p>
                    <p><strong>Email:</strong> <span className="font-mono text-sm">{user?.email || 'N/A'}</span></p>
                    <p><strong>Current Role:</strong> <span className="font-mono text-uppercase text-yellow-400">{profile?.role || 'None'}</span></p>
                    <p className="text-xs text-gray-500 mt-4">
                        If you believe this is an error, try logging out and back in to refresh your permissions.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Total Users</span>
                        <Users className="text-primary" />
                    </div>
                    <div className="text-3xl font-bold">{stats.users}</div>
                </div>

                <div className="bg-surface p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Total Models</span>
                        <Box className="text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold">{stats.models}</div>
                </div>

                <div className="bg-surface p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Platform Revenue</span>
                        <DollarSign className="text-green-500" />
                    </div>
                    <div className="text-3xl font-bold">${stats.revenue.toFixed(2)}</div>
                </div>
            </div>

            <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'transactions' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Transactions
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'inventory' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Inventory Management
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">Platform Users</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td className="p-4">{u.full_name || 'N/A'}</td>
                                            <td className="p-4 capitalize">{u.role}</td>
                                            <td className="p-4">{new Date(u.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Method</th>
                                        <th className="p-4">Buyer ID</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {transactions.map((t) => (
                                        <tr key={t.id}>
                                            <td className="p-4">{new Date(t.created_at).toLocaleDateString()}</td>
                                            <td className="p-4">${t.amount}</td>
                                            <td className="p-4 capitalize">{t.payment_method}</td>
                                            <td className="p-4 font-mono text-sm">{t.buyer_id.slice(0, 8)}...</td>
                                            <td className="p-4">
                                                {t.status === 'completed' ? (
                                                    <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400">
                                                            Pending
                                                        </span>
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Confirm payment received?')) return;
                                                                await supabase.from('transactions').update({ status: 'completed' }).eq('id', t.id);
                                                                fetchTransactions();
                                                            }}
                                                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="space-y-8">
                    {/* Upload Form */}
                    <div className="bg-surface rounded-xl border border-white/10 p-6">
                        <h2 className="text-xl font-bold mb-6">Add New Product</h2>
                        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={newItem.title}
                                        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-primary focus:outline-none"
                                        placeholder="e.g. Iron Man Helmet"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={newItem.price}
                                            onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pl-8 focus:border-primary focus:outline-none"
                                            placeholder="0 for Free"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Set to 0 for Free Download</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                                    <select
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-primary focus:outline-none"
                                    >
                                        <option>Characters</option>
                                        <option>Vehicles</option>
                                        <option>Props</option>
                                        <option>Environment</option>
                                        <option>Weapons</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                                    <textarea
                                        value={newItem.description}
                                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 h-24 focus:border-primary focus:outline-none"
                                        placeholder="Product details..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">3D File (STL/OBJ)</label>
                                        <input
                                            type="file"
                                            accept=".stl,.obj"
                                            onChange={e => setModelFile(e.target.files?.[0] || null)}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Preview Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setPreviewFile(e.target.files?.[0] || null)}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        {uploading ? 'Uploading...' : 'Add to Catalog'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Product List */}
                    <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Current Inventory</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-gray-400">
                                        <tr>
                                            <th className="p-4">Preview</th>
                                            <th className="p-4">Title</th>
                                            <th className="p-4">Price</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {models.map((m) => (
                                            <tr key={m.id}>
                                                <td className="p-4">
                                                    <img src={`${supabase.storage.from('previews').getPublicUrl(m.preview_path).data.publicUrl}?t=${Date.now()}`} className="w-12 h-12 object-cover rounded bg-black" alt="" />
                                                </td>
                                                <td className="p-4 font-medium">{m.title}</td>
                                                <td className="p-4">
                                                    {m.price === 0 ? <span className="text-green-400">Free</span> : `$${m.price}`}
                                                </td>
                                                <td className="p-4 text-sm text-gray-400">{m.category}</td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleDeleteModel(m.id)}
                                                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
