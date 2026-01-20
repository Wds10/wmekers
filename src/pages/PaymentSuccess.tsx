import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const [message, setMessage] = useState('Verifying payment...');

    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const merchantOrder = searchParams.get('merchant_order_id');
    const modelId = searchParams.get('model_id');
    const paymentStatus = searchParams.get('payment_status') || searchParams.get('status') || searchParams.get('collection_status');

    useEffect(() => {
        const verify = async () => {
            if (!modelId || (paymentStatus !== 'approved' && paymentStatus !== 'completed')) {
                // strict check, but accept completed for manual/free
                if (paymentStatus === 'failure' || paymentStatus === 'rejected') {
                    setStatus('error');
                    setMessage('Payment was rejected or failed.');
                    return;
                }
                // Allow verification to proceed if parameters exist, backend will confirm.
                if (!paymentId && !merchantOrder) {
                    setStatus('error');
                    setMessage('Invalid payment parameters.');
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
                    setMessage(result.error || 'Payment verification failed. Please contact support.');
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage('Server error verifying payment.');
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
                        <h2 className="text-2xl font-bold">Verifying Payment...</h2>
                        <p className="text-gray-400">Please wait while we secure your download.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-500/10">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-400">¡Pago Exitoso!</h2>
                        <p className="text-gray-300">Tu transacción ha sido verificada correctamente.</p>

                        <button
                            onClick={handleDownload}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 animate-bounce-subtle"
                        >
                            <Download size={24} />
                            <span>Descargar Archivo</span>
                        </button>

                        <div className="text-sm text-gray-500 mt-2">
                            Si la descarga no comienza automáticamente, haz clic en el botón.
                        </div>

                        <button
                            onClick={() => navigate(`/model/${modelId}`)}
                            className="text-sm text-gray-400 hover:text-white underline mt-6"
                        >
                            Volver al producto
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-500/10">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-400">Pago No Exitoso</h2>
                        <p className="text-gray-400">No se pudo verificar el pago o fue rechazado.</p>
                        <p className="text-sm text-gray-500 bg-black/20 p-2 rounded">{message}</p>
                        <p className="text-xs text-gray-500 mt-1">ID Ref: {paymentId || 'N/A'}</p>

                        <button
                            onClick={() => navigate(`/model/${modelId}`)}
                            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors mt-4"
                        >
                            Intentar pagar nuevamente
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
