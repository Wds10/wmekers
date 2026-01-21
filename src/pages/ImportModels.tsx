
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ImportModels() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [urls, setUrls] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    const [processing, setProcessing] = useState(false);

    const handleImport = async () => {
        if (!urls.trim()) return;
        setProcessing(true);
        setLogs([]);

        const urlList = urls.split('\n').map(u => u.trim()).filter(u => u);

        for (const source_url of urlList) {
            try {
                addLog(`Processing: ${source_url}...`, 'info');

                // Call Serverless Function
                // Note: In local dev, this points to localhost:3000/api usually if using 'vercel dev'
                // In production, it's relative /api/import-model
                const response = await fetch('/api/import-model', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ source_url })
                });

                const data = await response.json();

                if (response.ok) {
                    addLog(`✅ Success: ${data.extracted?.title || 'Model Imported'}`, 'success');
                    if (data.message.includes('Metadata extracted')) {
                        addLog(`⚠️ Partial: Metadata found. File download manual step needed.`, 'warning');
                    }
                } else {
                    addLog(`❌ Failed: ${data.error}`, 'error');
                }

            } catch (err: any) {
                addLog(`❌ Network Error: ${err.message}`, 'error');
            }
        }
        setProcessing(false);
    };

    const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'warning') => {
        setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
    };

    if (profile?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Admin Access Required</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button onClick={() => navigate('/admin')} className="flex items-center text-gray-400 hover:text-white mb-6">
                <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold mb-8 flex items-center">
                <UploadCloud className="mr-3 text-primary" /> Auto-Import Models (Beta)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="bg-surface p-6 rounded-xl border border-white/10">
                        <label className="block text-sm font-bold mb-2 text-gray-300">
                            Source URLs (One per line)
                        </label>
                        <p className="text-xs text-gray-500 mb-4">
                            Supports extraction from public pages.
                            <br />Requires <strong>CC0</strong> or <strong>CC-BY</strong> license.
                            <br />Strictly rejects NC (Non-Commercial).
                        </p>
                        <textarea
                            value={urls}
                            onChange={(e) => setUrls(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-4 h-64 font-mono text-sm focus:border-primary focus:outline-none"
                            placeholder="https://cults3d.com/en/3d-model/..."
                        />
                        <button
                            onClick={handleImport}
                            disabled={processing || !urls}
                            className={`w-full mt-4 py-3 rounded-lg font-bold flex items-center justify-center transition-all
                                ${processing ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'}
                            `}
                        >
                            {processing ? 'Processing...' : 'Start Import Pipeline'}
                        </button>
                    </div>
                </div>

                {/* Logs Section */}
                <div className="bg-surface rounded-xl border border-white/10 flex flex-col h-[500px]">
                    <div className="p-4 border-b border-white/10 bg-white/5 font-bold">
                        Process Logs
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
                        {logs.length === 0 && (
                            <div className="text-gray-500 text-center mt-20">Waiting to start...</div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className={`p-2 rounded border border-transparent ${log.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                log.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        'text-gray-400'
                                }`}>
                                <span className="opacity-50 mr-2">[{log.time}]</span>
                                {log.msg}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
