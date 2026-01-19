import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ThreeViewer from '../components/ThreeViewer';
import { ShoppingCart, Download, User as UserIcon, ShoppingBag, Loader2 } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Initialize MP
// const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || 'TEST-00000000-0000-0000-0000-000000000000';
// initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });

const ARS_RATE = 1200;

export default function ProductDetail() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { user, profile } = useAuth();
    const { t } = useLanguage();
    const [model, setModel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [hasPurchased, setHasPurchased] = useState(false);
    // const [isPending, setIsPending] = useState(false);

    // MP State
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [creatingPreference, setCreatingPreference] = useState(false);

    useEffect(() => {
        if (id) fetchModel(id);
    }, [id, user]);

    useEffect(() => {
        // Realtime Subscription for automatic updates logic
        const channel = supabase
            .channel('transactions-update')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transactions',
                    filter: user ? `buyer_id=eq.${user.id}` : undefined
                },
                (payload) => {
                    console.log('Realtime transaction received:', payload);
                    if (
                        payload.new.model_id === model?.id &&
                        (payload.new.status === 'completed' || payload.new.status === 'approved')
                    ) {
                        setHasPurchased(true);
                        // Auto Download with delay
                        setTimeout(() => {
                            handleDownload();
                        }, 1000);

                        // Clean URL after delay to avoid re-triggering on refresh
                        // setTimeout(() => {
                        //     window.history.replaceState({}, '', window.location.pathname);
                        // }, 5000);
                    }
                }
            )
            .subscribe();

        const checkPaymentAndDownload = async () => {
            const status = searchParams.get('payment_status');
            const paymentId = searchParams.get('payment_id');
            const merchantOrder = searchParams.get('merchant_order_id');

            // CASE 1: Payment Approved BUT Session Lost (Mobile Redirect Issue)
            if (status === 'approved' && !user && !loading) {
                // We cannot record transaction without user ID, so we MUST ask for login
                // We will handle this in the render part
                return;
            }

            // CASE 2: Payment Approved AND User Exists
            if (status === 'approved' && user && model && !hasPurchased) {
                try {
                    // Record transaction in DB if not exists
                    const { error } = await supabase.from('transactions').insert({
                        buyer_id: user.id,
                        model_id: model.id,
                        amount: model.price,
                        platform_fee: model.price * 0.1,
                        seller_earnings: model.price * 0.9,
                        payment_method: 'mercadopago',
                        status: 'completed',
                        payment_id: paymentId || merchantOrder || 'unknown_mp_id'
                    });

                    if (error && error.code !== '23505') {
                        console.error("Error DB: " + error.message);
                    }

                    if (!error || error.code === '23505') {
                        // Trust the URL for immediate feedback
                        setHasPurchased(true);
                        setTimeout(() => {
                            handleDownload();
                        }, 1000);
                    }
                } catch (e: any) {
                    console.error("Auto-record error:", e);
                }
            }
        };

        checkPaymentAndDownload();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [searchParams, user, model, hasPurchased, t]);

    const fetchModel = async (modelId: string) => {
        try {
            const { data, error } = await supabase
                .from('models')
                .select('*, profiles(full_name, country)')
                .eq('id', modelId)
                .single();

            if (error) throw error;
            setModel(data);

            const { data: signData } = await supabase
                .storage
                .from('models')
                .createSignedUrl(data.file_path, 3600);
            if (signData) setSignedUrl(signData.signedUrl);

            if (data.price === 0) {
                setHasPurchased(true);
            } else if (user) {
                const { data: tx } = await supabase
                    .from('transactions')
                    .select('status')
                    .eq('buyer_id', user.id)
                    .eq('model_id', modelId)
                    .in('status', ['completed', 'approved'])
                    .limit(1)
                    .single();

                if (tx) {
                    setHasPurchased(true);
                } else {
                    if (data.seller_id === user.id) setHasPurchased(true);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePreference = async () => {
        if (!user) { alert("Please login"); return; }
        setCreatingPreference(true);
        try {
            const response = await fetch('/api/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: model.title,
                    unit_price: model.price * ARS_RATE,
                    quantity: 1,
                    productId: model.id
                })
            });
            const data = await response.json();
            if (data.init_point) {
                setPreferenceId(data.init_point); // Reuse state
                window.location.href = data.init_point; // Auto redirect
            } else if (data.id) {
                // Fallback if only ID returned (shouldn't happen with new api)
                setPreferenceId(data.id);
            }
            else alert(t.payment.error_preference + ": " + (data.error || JSON.stringify(data)));
        } catch (e) {
            console.error(e);
            alert(t.payment.error_preference);
        } finally {
            setCreatingPreference(false);
        }
    };

    const handlePayPalApprove = async (_data: any, actions: any) => {
        return actions.order.capture().then(async (details: any) => {
            const { error } = await supabase.from('transactions').insert({
                buyer_id: user?.id,
                model_id: model.id,
                amount: model.price,
                platform_fee: model.price * 0.1,
                seller_earnings: model.price * 0.9,
                payment_method: 'paypal',
                status: 'completed',
                payment_id: details.id
            });
            if (!error) {
                setHasPurchased(true);
                alert(t.payment.success);
            }
        });
    };

    const handleDownload = async () => {
        if (signedUrl) {
            const a = document.createElement('a');
            a.href = signedUrl;
            a.download = model.file_path.split('/').pop() || 'model.stl';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }

        const { data, error } = await supabase.storage.from('models').download(model.file_path);
        if (error) { alert("Download failed"); return; }
        if (data) {
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = model.file_path.split('/').pop() || 'model.stl';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Safe Render: Ensure model exists before accessing properties
    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    if (!model) return <div className="text-center p-12 text-xl">Model not found</div>;

    // SESSION RECOVERY VIEW (Mobile Redirect Fix)
    const isPaymentApproved = searchParams.get('payment_status') === 'approved';
    if (isPaymentApproved && !user) {
        return (
            <div className="max-w-lg mx-auto py-12 px-4 text-center animate-fade-in">
                <div className="bg-surface border border-yellow-500/30 rounded-3xl p-8 shadow-2xl">
                    <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
                        <UserIcon className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Pago Detectado / Payment Detected</h1>
                    <p className="text-gray-300 mb-6">
                        {t.payment?.verifying || "Por favor inicia sesión para vincular tu compra y descargar el archivo."}
                        <br />
                        <span className="text-sm text-gray-500">(La sesión pudo cerrarse durante la redirección)</span>
                    </p>
                    <a
                        href="/login"
                        className="block w-full py-4 bg-primary text-black font-bold text-lg rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        Iniciar Sesión / Log In
                    </a>
                </div>
            </div>
        );
    }

    // SUCCESS VIEW - Mobile Safe (No 3D Viewer, No Complex Grid)
    if (hasPurchased) {
        return (
            <div className="max-w-lg mx-auto py-12 px-4 text-center animate-fade-in">
                <div className="bg-surface border border-green-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Background Bloom */}
                    <div className="absolute top-0 left-0 w-full h-full bg-green-500/5 z-0"></div>

                    <div className="relative z-10 space-y-6">
                        <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-500/10">
                            <Download className="w-10 h-10 text-green-400" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-white">{t.payment.success}</h1>
                            <p className="text-gray-400">{t.product.download_ready || "Tu archivo está listo para descargar."}</p>
                        </div>

                        <div className="py-6">
                            <button
                                onClick={handleDownload}
                                className="w-full py-5 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold text-xl rounded-xl shadow-xl hover:shadow-green-500/25 transition-all flex items-center justify-center gap-3 animate-pulse"
                            >
                                <Download size={28} />
                                <span>{t.product.download}</span>
                            </button>
                        </div>

                        <div className="text-sm text-gray-500 pt-4 border-t border-white/10">
                            <p>ID de Transacción: {searchParams.get('payment_id') || 'Registrado'}</p>
                            <a href="/" className="text-primary hover:underline mt-2 inline-block">Volver a la tienda</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isArgentina = profile?.country === 'Argentina';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Viewer Section */}
            <div className="h-[350px] lg:h-[600px] sticky top-24">
                {signedUrl ? (
                    <ThreeViewer url={signedUrl} filename={model.file_path} />
                ) : (
                    <div className="w-full h-full bg-surface rounded-xl flex items-center justify-center text-gray-500 flex-col gap-4">
                        <ShoppingBag size={32} className="opacity-50" />
                        <p>3D Preview Unavailable</p>
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">{model.title || 'Untitled Model'}</h1>
                    <div className="flex items-center space-x-2 text-gray-400">
                        <UserIcon size={16} />
                        <span>{t.product.created_by} <span className="text-white font-medium">{model.profiles?.full_name || 'Unknown'}</span></span>
                    </div>
                </div>

                <div className="bg-surface border border-white/10 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-primary">
                            {model.price === 0 ? t.product.free :
                                (isArgentina ? `$${(model.price * ARS_RATE).toLocaleString('es-AR')} ARS` : `$${model.price} USD`)
                            }
                        </span>
                        <span className="text-xs font-mono px-2 py-1 bg-white/5 rounded border border-white/10">{model.license} {t.product.license}</span>
                    </div>

                    {/* Pay Button */}
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                        <ShoppingCart size={20} />
                        <span>{t.product.pay}</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Description</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{model.description || 'No description available.'}</p>
                </div>

                {/* Payment Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-surface border border-white/10 rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >✕</button>

                            <h3 className="text-2xl font-bold mb-6 text-center">
                                Selecciona Método de Pago
                            </h3>

                            {/* Mercado Pago Option */}
                            <div className="mb-8 p-4 bg-[#009EE3]/10 rounded-xl border border-[#009EE3]/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xl font-bold text-[#009EE3]">Mercado Pago</h4>
                                    <span className="font-mono text-white bg-black/30 px-2 py-1 rounded">ARS</span>
                                </div>
                                <p className="text-white text-2xl font-bold mb-4">
                                    ${Number(model.price * ARS_RATE).toLocaleString('es-AR')}
                                </p>
                                {!preferenceId ? (
                                    <button
                                        onClick={handleCreatePreference}
                                        disabled={creatingPreference}
                                        className="w-full py-3 bg-[#009EE3] hover:bg-[#008ED0] text-white font-bold rounded-lg transition-colors flex justify-center items-center shadow-lg"
                                    >
                                        {creatingPreference ? <Loader2 className="animate-spin" /> : t.payment.pay_mp}
                                    </button>
                                ) : (
                                    <a
                                        href={preferenceId}
                                        className="w-full py-3 bg-[#009EE3] hover:bg-[#008ED0] text-white font-bold rounded-lg transition-colors flex justify-center items-center shadow-lg text-center"
                                    >
                                        Pagar ahora en Mercado Pago
                                    </a>
                                )}
                                <p className="text-xs text-white/50 text-center mt-2">
                                    (Comisión aplicada por plataforma)
                                </p>
                            </div>

                            <div className="border-t border-white/10 my-6"></div>

                            {/* PayPal Option */}
                            <div className="p-4 bg-[#003087]/10 rounded-xl border border-[#003087]/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xl font-bold text-[#003087]">PayPal</h4>
                                    <span className="font-mono text-white bg-black/30 px-2 py-1 rounded">USD</span>
                                </div>
                                <p className="text-white text-2xl font-bold mb-4">
                                    ${model.price}
                                </p>
                                <div className="w-full z-0 relative">
                                    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                                        <PayPalButtons
                                            style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                                            createOrder={(_data, actions) => {
                                                return actions.order.create({
                                                    intent: "CAPTURE",
                                                    purchase_units: [{
                                                        amount: {
                                                            value: model.price.toString(),
                                                            currency_code: 'USD'
                                                        }
                                                    }]
                                                });
                                            }}
                                            onApprove={handlePayPalApprove}
                                        />
                                    </PayPalScriptProvider>
                                </div>
                            </div>

                            <p className="text-center text-xs text-gray-500 mt-4">
                                {t.product.secure}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
