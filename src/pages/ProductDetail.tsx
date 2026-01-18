import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ThreeViewer from '../components/ThreeViewer';
import { ShoppingCart, Download, User as UserIcon, Shield, ShoppingBag } from 'lucide-react';

export default function ProductDetail() {
    const { id } = useParams();
    const { user, profile } = useAuth();
    const { t } = useLanguage();
    const [model, setModel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        if (id) fetchModel(id);
    }, [id, user]);

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

            // Check purchase or ownership (OR if price is 0)
            if (data.price === 0) {
                setHasPurchased(true);
            } else if (user) {
                const { data: tx } = await supabase
                    .from('transactions')
                    .select('status')
                    .eq('buyer_id', user.id)
                    .eq('model_id', modelId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (tx) {
                    if (tx.status === 'completed') setHasPurchased(true);
                    else if (tx.status === 'pending') setIsPending(true);
                }
            }

            /* 
            // Commented out to allow Admin to test the Payment Modal
            if (user && data.seller_id === user.id) {
                setHasPurchased(true);
            } 
            */
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleBuy = () => {
        if (!user) {
            alert("Please login to purchase");
            return;
        }
        setShowPaymentModal(true);
    };

    const confirmPayment = async () => {
        setPurchasing(true);
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const isArgentina = profile?.country === 'Argentina';
            const paymentMethod = isArgentina ? 'mercadopago' : 'paypal';
            const commission = 0.10;
            const platformFee = model.price * commission;
            const sellerEarnings = model.price - platformFee;

            {
                const { error } = await supabase.from('transactions').insert({
                    buyer_id: user?.id,
                    model_id: model.id,
                    amount: model.price,
                    platform_fee: platformFee,
                    seller_earnings: sellerEarnings,
                    payment_method: paymentMethod,
                    status: 'pending',
                    payment_id: `manual_${Date.now()}`
                });

                if (error) throw error;

                setIsPending(true); // Update UI to Pending
                setShowPaymentModal(false);

                // Open WhatsApp AFTER successful database insert
                const waNumber = '5491134818977';
                const message = `Hola! Ya pagué por el modelo: ${model.title}. Soy ${user?.email || 'N/A'}. Espero confirmación.`;
                const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
                window.open(waUrl, '_blank');

                alert("Purchase registered! Redirecting to WhatsApp to complete payment.");
            }
        } catch (err: any) {
            alert("Payment failed: " + err.message);
        } finally {
            setPurchasing(false);
        }
    };

    // ... (Render Modal outside) ...
    /* 
       Note: I will insert the Modal verify logic in the return statement in the next edit chunk or here if possible. 
       Actually, I need to insert the Modal JSX in the return.
       I will split this into two edits or use multi_replace.
       I'll use REPLACE for the handleBuy logic first, then add the Modal to the JSX.
    */

    const handleDownload = async () => {
        // For free items or purchased items
        const { data, error } = await supabase.storage.from('models').download(model.file_path);
        if (error) {
            console.error(error);
            alert("Download failed. Ensure you have purchased this item.");
            return;
        }

        if (data) {
            // Check if response is actually an error in JSON format
            if (data.type === 'application/json') {
                const text = await data.text();
                alert("Download error: " + text);
                return;
            }

            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            // Force correct extension based on file_path
            const filename = model.file_path.split('/').pop() || 'model.stl';
            a.download = filename;
            document.body.appendChild(a); // Append to body to ensure click works in all browsers
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!model) return <div>Model not found</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="h-[350px] lg:h-[600px] sticky top-24">
                {signedUrl ? (
                    <ThreeViewer url={signedUrl} filename={model.file_path} />
                ) : (
                    <div className="w-full h-full bg-surface rounded-xl flex items-center justify-center text-gray-500 flex-col gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <ShoppingBag size={32} className="opacity-50" />
                        </div>
                        <p>3D Preview Unavailable</p>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">{model.title}</h1>
                    <div className="flex items-center space-x-2 text-gray-400">
                        <UserIcon size={16} />
                        <span>{t.product.created_by} <span className="text-white font-medium">{model.profiles?.full_name}</span></span>
                    </div>
                </div>

                <div className="bg-surface border border-white/10 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-primary">
                            {model.price === 0 ? t.product.free : `$${model.price}`}
                        </span>
                        <span className="text-xs font-mono px-2 py-1 bg-white/5 rounded border border-white/10">{model.license} {t.product.license}</span>
                    </div>

                    {!hasPurchased ? (
                        isPending ? (
                            <button
                                disabled
                                className="w-full py-4 bg-yellow-500/20 text-yellow-400 font-bold text-lg rounded-lg border border-yellow-500/50 cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                <span>{t.product.verifying}</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    console.log("Pagar clicked");
                                    handleBuy();
                                }}
                                disabled={purchasing}
                                className="w-full py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                            >
                                {purchasing ? (
                                    <span>{t.product.processing}</span>
                                ) : (
                                    <>
                                        <ShoppingCart size={20} />
                                        <span>{t.product.pay}</span>
                                    </>
                                )}
                            </button>
                        )
                    ) : (
                        <button
                            onClick={handleDownload}
                            className="w-full py-4 bg-green-500 text-white font-bold text-lg rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                        >
                            <Download size={20} />
                            <span>
                                {t.product.download}
                            </span>
                        </button>
                    )}

                    {user?.id === model.seller_id && (
                        <div className="text-center text-sm text-gray-400 pt-2">
                            {t.product.owned}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Description</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {model.description}
                    </p>
                </div>

                <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-start space-x-3 text-sm text-gray-400">
                        <Shield size={20} className="text-primary mt-1" />
                        <div>
                            <p className="text-white font-medium mb-1">{t.product.secure}</p>
                            <p>Processed via {profile?.country === 'Argentina' ? 'Mercado Pago' : 'PayPal'}.</p>
                        </div>
                    </div>
                </div>
            </div>
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-surface border border-white/10 rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold">Complete Payment</h3>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 text-center">
                            <p className="text-gray-400 text-sm mb-1">Transfer Amount</p>
                            <p className="text-3xl font-bold text-white">${model.price} USD</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                                <p className="text-sm text-gray-400 mb-2">Mercado Pago Alias</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-lg font-mono text-yellow-400">walter.david.ws</code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText("walter.david.ws")}
                                        className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                                <p className="text-sm text-gray-400 mb-2">PayPal Email</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-lg font-mono text-blue-400 text-sm break-all">reygarufa10@gmail.com</code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText("reygarufa10@gmail.com")}
                                        className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20 shrink-0 ml-2"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <a
                                    href="https://www.paypal.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-2 text-xs text-gray-500 hover:text-white text-center"
                                >
                                    Go to PayPal.com
                                </a>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 text-center">
                            Please transfer the exact amount. Once done, click below to unlock.
                        </div>

                        <button
                            onClick={confirmPayment}
                            disabled={purchasing}
                            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-green-500/20"
                        >
                            {purchasing ? "Verifying..." : "I Have Paid"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
