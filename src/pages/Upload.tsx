import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FileBox, ImageIcon, AlertCircle } from 'lucide-react';

export default function UploadPage() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Characters',
        license: 'Standard',
    });

    const [modelFile, setModelFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<File | null>(null);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.id !== profile?.id) return; // Basic check
        if (!modelFile) {
            setError("Please select a 3D model file.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Upload Model File

            const modelPath = `${user.id}/${Date.now()}_${modelFile.name.replace(/\s/g, '_')}`;
            const { error: modelError } = await supabase.storage
                .from('models')
                .upload(modelPath, modelFile);

            if (modelError) throw modelError;

            // 2. Upload Preview Image (Optional)
            let previewPath = null;
            if (previewImage) {
                const previewExt = previewImage.name.split('.').pop();
                const pPath = `${user.id}/${Date.now()}_preview.${previewExt}`;
                const { error: previewError } = await supabase.storage
                    .from('previews')
                    .upload(pPath, previewImage);

                if (previewError) throw previewError;
                previewPath = pPath;
            }

            // 3. Insert Database Record
            const { error: dbError } = await supabase.from('models').insert({
                seller_id: user.id,
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                license: formData.license,
                file_path: modelPath,
                preview_path: previewPath
            });

            if (dbError) throw dbError;

            navigate('/market');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to upload model.");
        } finally {
            setLoading(false);
        }
    };

    if (!user || profile?.role !== 'creator') {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Creator Access Required</h2>
                <p className="text-gray-400">Please register as a creator to upload models.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Upload New Model</h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 flex items-center space-x-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleUpload} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-surface border border-white/10 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-bold border-b border-white/10 pb-2 mb-4">Model Details</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none"
                            placeholder="e.g. Cyberpunk Character"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none"
                            placeholder="Describe your model..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none"
                            >
                                <option>Characters</option>
                                <option>Vehicles</option>
                                <option>Environment</option>
                                <option>Props</option>
                                <option>Animals</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Price (USD)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Files */}
                <div className="bg-surface border border-white/10 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-bold border-b border-white/10 pb-2 mb-4">Assets</h3>

                    {/* Model File */}
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-colors relative group">
                        <input
                            type="file"
                            accept=".stl,.obj,.fbx,.glb,.gltf"
                            onChange={e => setModelFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center space-y-2 pointer-events-none">
                            <FileBox size={32} className={modelFile ? "text-primary" : "text-gray-500"} />
                            <div className="text-sm font-medium">
                                {modelFile ? modelFile.name : "Drop 3D Model File Here"}
                            </div>
                            <div className="text-xs text-gray-500">
                                STL, OBJ, FBX, GLB (Max 50MB)
                            </div>
                        </div>
                    </div>

                    {/* Preview Image */}
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-colors relative group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setPreviewImage(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center space-y-2 pointer-events-none">
                            <ImageIcon size={32} className={previewImage ? "text-primary" : "text-gray-500"} />
                            <div className="text-sm font-medium">
                                {previewImage ? previewImage.name : "Drop Cover Image (Optional)"}
                            </div>
                            <div className="text-xs text-gray-500">
                                JPG, PNG (Recommended 1280x720)
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                >
                    {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Uploading...</span>
                        </div>
                    ) : (
                        'Publish Model'
                    )}
                </button>
            </form>
        </div>
    );
}
