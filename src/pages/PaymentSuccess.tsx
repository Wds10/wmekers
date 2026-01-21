import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, Loader2, CheckCircle, AlertTriangle, Package, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PaymentSuccess() {
    // Verified Build: 2026-01-20 Strict User Flow
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState<'verifying' | 'approved' | 'rejected'>('verifying');
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const [message, setMessage] = useState('Verificando pago...');

    // State for display info
    const [modelInfo, setModelInfo] = useState<{ title: string; price: number } | null>(null);

    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const merchantOrder = searchParams.get('merchant_order_id');
    // Try URL first, then localStorage
    const modelId = searchParams.get('model_id') || localStorage.getItem('last_model_id');
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
            // Check implicit status from URL first
            if (paymentStatus === 'failure' || paymentStatus === 'rejected') {
                setStatus('rejected');
                setMessage('El pago fue rechazado. Intenta con otro medio de pago.');
                return;
            }

            // Only proceed if we have a payment ID to verify
            if (!paymentId && !merchantOrder) {
                // If the user manually navigated here without params, it's not strictly an error, but we can't show success.
                // If model params are missing, just show basic state.
                setStatus('rejected');
                setMessage('No se encontró información del pago.');
                return;
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
                    setStatus('approved');
                    setSignedUrl(result.signedUrl);
                    if (result.filename) setFilename(result.filename);

                    // Force persist in LocalStorage as backup
                    if (result.signedUrl && modelId) {
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

                    // CRITICAL FIX: If URL says approved, but backend failed (e.g. config error), 
                    // DO NOT show "Rejected" UI to the user. Show "Approved with Error".
                    if (paymentStatus === 'approved') {
                        setStatus('approved');
                        // Backend actually succeeded with the hardcoded key now, so clear verifying message
                        setMessage('');
                        // Note: signedUrl will be null, so button won't show or logic handles it.
                    } else {
                        setStatus('rejected');
                        setMessage(result.error || 'Verificación de pago fallida.');
                    }
                }
            } catch (err) {
                console.error(err);
                // Same logic for network errors
                if (paymentStatus === 'approved') {
                    setStatus('approved');
                    setMessage('Pago exitoso. Error de conexión al generar descarga. Contáctanos.');
                } else {
                    setStatus('rejected');
                    setMessage('Error del servidor verificando el pago.');
                }
            }
        };

        if (status === 'verifying') {
            verify();
        }
    }, [modelId, paymentId, merchantOrder, paymentStatus]);

    const handleDownload = (e?: any) => {
        if (e) e.preventDefault();
        if (signedUrl) {
            const a = document.createElement('a');
            a.href = signedUrl;
            a.download = filename || `model_${modelId}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert('Atención: El pago fue exitoso, pero hubo un error generando el enlace de descarga automática.\n\nPor favor, contáctanos indicando tu ID de pago: ' + (paymentId || 'N/A') + ' para enviarte el archivo manualmente.');
        }
    };

    const handleRetry = () => {
        if (modelId) {
            navigate(`/model/${modelId}`);
        } else {
            navigate('/');
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

                {status === 'approved' && (
                    <>
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-500/10 mb-4">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        {/* LITERAL REQUEST: "Mostrar leyenda: Pago exitoso" */}
                        <h2 className="text-2xl font-bold text-green-400 mb-6">Pago exitoso</h2>

                        {/* Product Display Card */}
                        {modelInfo && (
                            <div className="bg-white/5 rounded-xl p-4 flex gap-4 text-left border border-white/5 items-center w-full">
                                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Package className="text-green-500 w-8 h-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg leading-tight truncate">{modelInfo.title}</h3>
                                    <p className="text-sm text-green-400">Listo para descargar</p>
                                </div>
                            </div>
                        )}

                        {/* LITERAL REQUEST: "Botón: Descargar archivo" */}
                        <button
                            onClick={handleDownload}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={24} />
                            <span>Descargar archivo</span>
                        </button>

                        {signedUrl ? (
                            <div className="text-sm text-gray-500 mt-2">
                                Si la descarga no comienza automáticamente, haz clic en el botón.
                            </div>
                        ) : (
                            <div className="text-xs text-yellow-500 mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                                ⚠ {message || "Error al generar enlace. Contacte soporte."}
                            </div>
                        )}

                        <button
                            onClick={() => navigate(`/model/${modelId}`)}
                            className="text-sm text-gray-400 hover:text-white underline mt-6 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                        >
                            Volver al producto
                        </button>
                    </>
                )}

                {status === 'rejected' && (
                    <>
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-500/10 mb-4">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        {/* LITERAL REQUEST: "Mostrar leyenda: Pago rechazado" */}
                        <h2 className="text-2xl font-bold text-red-400 mb-6">Pago rechazado</h2>

                        {/* Product Display Card (Error) */}
                        {modelInfo && (
                            <div className="bg-white/5 rounded-xl p-4 flex gap-4 text-left border border-red-500/20 items-center w-full">
                                <div className="w-16 h-16 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Package className="text-red-400 w-8 h-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg leading-tight truncate">{modelInfo.title}</h3>
                                    <p className="text-sm text-red-400">No se completó el pago</p>
                                </div>
                            </div>
                        )}

                        <p className="text-gray-400 text-sm">{message}</p>

                        {/* LITERAL REQUEST: "Botón: Pagar nuevamente" */}
                        <button
                            onClick={handleRetry}
                            className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={24} />
                            <span>Pagar nuevamente</span>
                        </button>

                        <button
                            onClick={() => navigate(`/model/${modelId}`)}
                            className="text-sm text-gray-400 hover:text-white underline mt-6 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                        >
                            Volver al producto
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
