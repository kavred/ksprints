/* -------------------------------------------------------------------------- */
/*               VERCEL SERVERLESS FUNCTION — STRIPE CHECKOUT                  */
/* -------------------------------------------------------------------------- */
// POST /api/checkout
//
// Receives the cart from the frontend, validates items against server-side
// pricing, and creates a Stripe Checkout Session.
//
// Environment variables required (set in Vercel Dashboard):
//   STRIPE_SECRET_KEY — your Stripe secret key (sk_live_... or sk_test_...)
/* -------------------------------------------------------------------------- */

const Stripe = require('stripe');
const serverProductData = require('./product-data');

module.exports = async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Initialize Stripe with the secret key from environment
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { items } = req.body; // [{ id: 'v_japandi', color: '#E11D48', qty: 2 }, ...]

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty or invalid.' });
        }

        // Build Stripe line items from validated server-side data
        const line_items = [];

        for (const item of items) {
            const product = serverProductData[item.id];

            if (!product) {
                return res.status(400).json({ error: `Unknown product: ${item.id}` });
            }

            if (!item.qty || item.qty < 1 || item.qty > 10) {
                return res.status(400).json({ error: `Invalid quantity for ${product.title}` });
            }

            line_items.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.title,
                        description: `Color: ${item.color || 'Default'}`,
                    },
                    // Stripe expects amount in cents
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: item.qty,
            });
        }

        // Determine the base URL for success/cancel redirects
        const origin = req.headers.origin || req.headers.referer?.replace(/\/[^/]*$/, '') || 'https://ksprints.vercel.app';

        // Create the Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: line_items,
            // Collect US shipping addresses only, free shipping
            shipping_address_collection: {
                allowed_countries: ['US'],
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: { amount: 0, currency: 'usd' },
                        display_name: 'Free Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 5 },
                            maximum: { unit: 'business_day', value: 10 },
                        },
                    },
                },
            ],
            // Store the full cart as metadata for order fulfillment
            metadata: {
                cart_json: JSON.stringify(items),
            },
            success_url: `${origin}/success.html`,
            cancel_url: `${origin}/cancel.html`,
        });

        return res.status(200).json({ url: session.url });

    } catch (err) {
        console.error('Stripe Checkout error:', err);
        return res.status(500).json({ error: 'Failed to create checkout session.' });
    }
};
