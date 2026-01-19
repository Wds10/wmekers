
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { title, unit_price, quantity, productId } = req.body;

    try {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating preference' });
    }
}
