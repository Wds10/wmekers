
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase Admin (Bypasses RLS)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize MP
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-1475830055280005-011911-d4bfff78665633e9390cd436ac703888-228386560';
const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Allow CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentId, modelId } = req.body;

    if (!paymentId || !modelId) {
        return res.status(400).json({ error: 'Missing paymentId or modelId' });
    }

    try {
        console.log(`Verifying payment ${paymentId} for model ${modelId}`);

        // 1. Verify Payment with Mercado Pago
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: paymentId });

        if (paymentData.status !== 'approved') {
            return res.status(400).json({
                error: 'Payment not approved',
                status: paymentData.status,
                detail: paymentData.status_detail
            });
        }

        // 2. Extract User ID from External Reference
        // Check both external_reference and metadata as fallback
        const userId = paymentData.external_reference || (paymentData.metadata as any)?.user_id;

        if (!userId) {
            return res.status(400).json({ error: 'Payment missing user reference' });
        }

        console.log(`Payment approved for User ${userId}`);

        // 3. Initialize Supabase Admin
        // Fallback for dev if service key is missing but usually this logic requires it.
        // If no service key, we can't bypass RLS. 
        if (!SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
            return res.status(500).json({ error: "Server Configuration Error" });
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // 4. Get Model details (price for recording)
        const { data: model, error: modelError } = await supabaseAdmin
            .from('models')
            .select('price, file_path, seller_id')
            .eq('id', modelId)
            .single();

        if (modelError || !model) throw new Error('Model not found');

        // 5. Record Transaction (Idempotent upsert)
        const { error: txError } = await supabaseAdmin
            .from('transactions')
            .upsert({
                buyer_id: userId,
                model_id: modelId,
                amount: model.price,
                platform_fee: model.price * 0.1,
                seller_earnings: model.price * 0.9,
                payment_method: 'mercadopago',
                status: 'completed',
                payment_id: paymentId,
                updated_at: new Date().toISOString()
            }, { onConflict: 'payment_id' }); // Avoid duplicates

        if (txError) {
            console.error("DB Insert Error:", txError);
            throw txError;
        }

        // 6. Generate Signed URL for immediate download
        const { data: signData, error: signError } = await supabaseAdmin
            .storage
            .from('models')
            .createSignedUrl(model.file_path, 3600); // 1 hour validity

        if (signError) throw signError;

        return res.status(200).json({
            success: true,
            signedUrl: signData.signedUrl,
            message: 'Purchase verified and recorded'
        });

    } catch (error: any) {
        console.error('Verification Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
