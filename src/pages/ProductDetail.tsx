import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ThreeViewer from '../components/ThreeViewer';
import { ShoppingCart, User as UserIcon, ShoppingBag, Loader2, Package } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const ARS_RATE = 1200;

export default function ProductDetail() {
    const { id } = useParams();
    // const [searchParams] = useSearchParams();
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
        if (id) {
            // Restore from LocalStorage if available (Fix for reload/lost session)
            const cachedUrl = localStorage.getItem(`purchased_${id}`);
            if (cachedUrl) {
                console.log("Restored purchase from cache");
                setSignedUrl(cachedUrl);
                setHasPurchased(true);
            }
            fetchModel(id);
        }
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
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, model, hasPurchased, t]);

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

            // CHECK TRANSACTION STATUS
            if (user) {
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
                    // IF MODEL IS FREE AND NO TRANSACTION EXISTS -> CREATE ONE (For Persistence)
                    if (data.price === 0) {
                        await createFreeTransaction(modelId, user.id);
                        setHasPurchased(true);
                    } else if (data.seller_id === user.id) {
                        setHasPurchased(true); // Sellers own their models
                    }
                }
            } else if (data.price === 0) {
                // Guest User showing free model (State only, no persistence)
                setHasPurchased(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createFreeTransaction = async (modelId: string, userId: string) => {
        try {
            const { error } = await supabase.from('transactions').insert({
                buyer_id: userId,
                model_id: modelId,
                amount: 0,
                platform_fee: 0,
                seller_earnings: 0,
                payment_method: 'free',
                status: 'completed',
                payment_id: `free_${userId}_${modelId}`
            });
            if (error) console.error("Error creating free tx:", error);
        } catch (e) {
            console.error(e);
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
                    productId: model.id,
                    userId: user.id // Send User ID to link payment
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

    const handleDownload = async (overriddenUrl?: string) => {
        const targetUrl = overriddenUrl || signedUrl;

        if (targetUrl) {
            const a = document.createElement('a');
            a.href = targetUrl;
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

    // OPTIMISTIC SUCCESS RENDER (Prevents Black Screen)
    // If URL indicates success, show the view IMMEDIATELY while data loads in background.
    // Recovery/Success View Logic
    // if (isPaymentApproved || hasPurchased) { ... } REMOVED - Using PaymentSuccess page now.

    // Safe Render: Ensure model exists before accessing properties
    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    if (!model) return <div className="text-center p-12 text-xl">Model not found</div>;

    // RECOVERY VIEW REMOVED - Backend handles verification now.


    // Old Success View removed (moved to top for Optimistic Render)

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

                    {/* Pay / Download Button based on Purchase Status */}
                    {hasPurchased ? (
                        <button
                            onClick={() => handleDownload()}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:shadow-[0_0_30px_rgba(22,163,74,0.6)] flex items-center justify-center space-x-2"
                        >
                            <Package size={20} />
                            <span>Descargar Ahora (Comprado)</span>
                        </button>
                    ) : (
                        model.price === 0 ? (
                            <button
                                onClick={() => handleDownload()} // Direct download logic
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:shadow-[0_0_30px_rgba(22,163,74,0.6)] flex items-center justify-center space-x-2"
                            >
                                <Package size={20} />
                                <span>Descargar Gratis</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="w-full py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                            >
                                <ShoppingCart size={20} />
                                <span>{t.product.pay}</span>
                            </button>
                        )
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Description</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{model.description || 'No description available.'}</p>
                </div>

                {/* Payment Modal / Checkout Pop-up */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-white text-black rounded-lg max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                            {/* Header */}
                            <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-800">Finalizar Compra</h3>
                                <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-black transition-colors text-2xl leading-none">&times;</button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Order Summary */}
                                <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        <Package className="text-gray-400 w-8 h-8 sm:w-10 sm:h-10" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-lg leading-tight truncate">{model.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">Licencia: {model.license}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        {model.price === 0 ? (
                                            <div className="font-bold text-xl text-green-600">FREE</div>
                                        ) : (
                                            <>
                                                <div className="font-bold text-xl">${model.price} USD</div>
                                                <div className="text-sm text-gray-500">~ ${(model.price * ARS_RATE).toLocaleString('es-AR')} ARS</div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <hr className="border-gray-200" />

                                {/* Payment/Download Section */}
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">
                                        {model.price === 0 ? "Descargar ahora" : "Selecciona método de pago"}
                                    </h4>

                                    <div className="space-y-3">
                                        {model.price === 0 ? (
                                            <button
                                                onClick={() => handleDownload()} // Directly download if free
                                                className="w-full flex items-center justify-center p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md font-bold text-lg"
                                            >
                                                Descargar Gratis
                                            </button>
                                        ) : (
                                            <>
                                                {/* Mercado Pago Button */}
                                                <div className="relative">
                                                    {!preferenceId ? (
                                                        <button
                                                            onClick={handleCreatePreference}
                                                            disabled={creatingPreference}
                                                            className="w-full flex items-center justify-between p-4 border-2 border-transparent bg-[#009EE3] hover:bg-[#008ED0] text-white rounded-lg transition-all shadow-md group"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="bg-white/20 p-2 rounded hidden sm:block">
                                                                    <div className="w-6 h-6 flex items-center justify-center font-bold text-white text-xs">MP</div>
                                                                </div>
                                                                <div className="text-left">
                                                                    <div className="font-bold text-lg">Mercado Pago</div>
                                                                    <div className="text-xs text-blue-100 hidden sm:block">Tarjetas de crédito, débito y efectivo</div>
                                                                </div>
                                                            </div>
                                                            {creatingPreference ? <Loader2 className="animate-spin" /> : <span className="font-bold text-lg sm:text-xl">${(model.price * ARS_RATE).toLocaleString('es-AR')} ARS</span>}
                                                        </button>
                                                    ) : (
                                                        <a
                                                            href={preferenceId}
                                                            className="w-full flex items-center justify-between p-4 border-2 border-[#009EE3] bg-white hover:bg-blue-50 text-[#009EE3] rounded-lg transition-all shadow-md"
                                                        >
                                                            <span className="font-bold">Continuar a Mercado Pago &rarr;</span>
                                                        </a>
                                                    )}
                                                </div>

                                                {/* PayPal Button Container */}
                                                <div className="relative bg-[#003087]/5 rounded-lg border border-[#003087]/20 p-1">
                                                    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                                                        <PayPalButtons
                                                            style={{ layout: "horizontal", color: "blue", height: 50, tagline: false, label: "pay" }}
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
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-200">
                                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Pagos procesados de forma segura con cifrado SSL.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
