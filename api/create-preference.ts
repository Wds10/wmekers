
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!process.env.MP_ACCESS_TOKEN) {
            throw new Error('MP_ACCESS_TOKEN is missing in server environment');
        }

        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
        const { title, unit_price, quantity, productId } = req.body;

        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: productId,
                        title: title,
                        quantity: quantity || 1,
                        unit_price: Number(unit_price),
                        currency_id: 'ARS',
                    },
                ],
                back_urls: {
                    success: `${req.headers.origin}/product/${productId}?payment_status=approved`,
                    failure: `${req.headers.origin}/product/${productId}?payment_status=failure`,
                    pending: `${req.headers.origin}/product/${productId}?payment_status=pending`,
                },
                auto_return: 'approved',
            },
        });

        res.status(200).json({ id: result.id });
    } catch (error: any) {
        console.error('MP Error:', error);
        // Extract useful info from MP error object which might not be an Error instance
        const errorMsg = error.message || error.cause?.description || JSON.stringify(error, Object.getOwnPropertyNames(error));
        res.status(500).json({ error: errorMsg, full_details: error });
    }
}
