import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, Loader2, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PaymentSuccess() {
    // Verified Build: 2026-01-20 Screenshot Layout Fix
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const [message, setMessage] = useState('Verificando pago...');

    // State for display info
    const [modelInfo, setModelInfo] = useState<{ title: string; price: number } | null>(null);

    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const merchantOrder = searchParams.get('merchant_order_id');
    const modelId = searchParams.get('model_id');
    const paymentStatus = searchParams.get('payment_status') || searchParams.get('status') || searchParams.get('collection_status');

    // Fetch basic model info for display
    useEffect(() => {
        const fetchModelInfo = async () => {
            if (modelId) {
                const { data } = await supabase.from('models').select('title, price').eq('id', modelId).single();
                if (data) setModelInfo(data);
            }
        };
        fetchModelInfo();
    }, [modelId]);

    useEffect(() => {
        const verify = async () => {
            if (!modelId || (paymentStatus !== 'approved' && paymentStatus !== 'completed')) {
                // strict check, but accept completed for manual/free
                if (paymentStatus === 'failure' || paymentStatus === 'rejected') {
                    setStatus('error');
                    setMessage('El pago fue rechazado o falló.');
                    return;
                }
                // Allow verification to proceed if parameters exist, backend will confirm.
                if (!paymentId && !merchantOrder) {
                    setStatus('error');
                    setMessage('Parámetros de pago inválidos.');
                    return;
                }
            }

            try {
                // CALL BACKEND VERIFICATION
                const response = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentId: paymentId || merchantOrder,
                        modelId: modelId
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    setStatus('success');
                    setSignedUrl(result.signedUrl);
                    if (result.filename) setFilename(result.filename);

                    // Force persist in LocalStorage as backup
                    if (result.signedUrl) {
                        localStorage.setItem(`purchased_${modelId}`, result.signedUrl);
                    }

                    // Auto Download Attempt
                    setTimeout(() => {
                        if (result.signedUrl) {
                            const a = document.createElement('a');
                            a.href = result.signedUrl;
                            a.download = result.filename || `model_${modelId}.zip`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }
                    }, 1500);

                } else {
                    console.error("Verification failed", result);
                    setStatus('error');
                    setMessage(result.error || 'Verificación de pago fallida.');
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage('Error del servidor verificando el pago.');
            }
        };

        if (status === 'verifying') {
            verify();
        }
    }, [modelId, paymentId, merchantOrder, paymentStatus]);

    const handleDownload = () => {
        if (signedUrl) {
            const a = document.createElement('a');
            a.href = signedUrl;
            a.download = filename || `model_${modelId}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl text-center space-y-6">

                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                        <h2 className="text-2xl font-bold">Verificando Pago...</h2>
                        <p className="text-gray-400">Por favor espera un momento.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-500/10 mb-4">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-400 mb-6">¡Pago Exitoso!</h2>

                        {/* Product Display Card with Integrated Button */}
                        {modelInfo && (
                            <div className="bg-white/5 rounded-xl p-4 flex gap-4 text-left border border-white/5 items-center w-full">
                                <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Package className="text-gray-400 w-10 h-10" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                                    <h3 className="font-bold text-lg leading-tight truncate">{modelInfo.title}</h3>
                                    <button
                                        onClick={handleDownload}
                                        className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 w-fit"
                                    >
                                        <Download size={16} />
                                        <span>Descargar archivo</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {!modelInfo && (
                            <button
                                onClick={handleDownload}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={24} />
                                <span>Descargar Archivo</span>
                            </button>
                        )}

                        <div className="text-sm text-gray-500 mt-6">
                            Si la descarga no comienza automáticamente, haz clic en el botón.
                        </div>

                        <button
                            onClick={() => navigate(`/model/${modelId}`)}
                            className="text-sm text-gray-400 hover:text-white underline mt-2 px-4 py-2"
                        >
                            Volver al producto
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-500/10 mb-4">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-400 mb-6">Pago No Exitoso</h2>

                        {/* Product Display Card (Error) */}
                        {modelInfo && (
                            <div className="bg-white/5 rounded-xl p-4 flex gap-4 text-left border border-red-500/20 items-center w-full">
                                <div className="w-20 h-20 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Package className="text-red-400 w-10 h-10" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                                    <h3 className="font-bold text-lg leading-tight truncate">{modelInfo.title}</h3>
                                    <button
                                        onClick={() => navigate(`/model/${modelId}`)}
                                        className="py-2 px-4 bg-white text-black font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors w-fit"
                                    >
                                        Intentar pagar nuevamente
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="text-gray-400 text-sm mt-4">El pago no pudo ser completado.</p>
                        <p className="text-xs text-gray-500 bg-black/20 p-2 rounded font-mono break-all">{message}</p>

                        <button
                            onClick={() => navigate(`/model/${modelId}`)}
                            className="text-sm text-gray-400 hover:text-white underline mt-2 px-4 py-2"
                        >
                            Volver al producto
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
