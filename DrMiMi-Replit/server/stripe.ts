import Stripe from 'stripe';

// Initialize Stripe with test key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_', {
  apiVersion: '2024-06-20',
});

export interface CreateCheckoutSessionParams {
  userId: string;
  itemType: 'article' | 'course' | 'summary';
  itemId: string;
  itemTitle: string;
  priceInDZD: number;
  taxRate: number;
  successUrl: string;
  cancelUrl: string;
}

export interface WebhookEvent {
  type: string;
  data: any;
}

// Convert DZD to USD (approximation - update with real rates)
const convertDZDtoUSD = (dzdAmount: number): number => {
  const exchangeRate = 0.0074; // 1 DZD = 0.0074 USD (update as needed)
  return Math.round(dzdAmount * exchangeRate * 100) / 100; // Round to 2 decimals
};

// Create Stripe checkout session
export async function createCheckoutSession({
  userId,
  itemType,
  itemId,
  itemTitle,
  priceInDZD,
  taxRate,
  successUrl,
  cancelUrl
}: CreateCheckoutSessionParams) {
  try {
    // Convert price to USD for Stripe
    const priceInUSD = convertDZDtoUSD(priceInDZD);
    const taxInUSD = priceInUSD * (taxRate / 100);
    const totalInUSD = priceInUSD + taxInUSD;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd', // Stripe requires USD or other supported currencies
            product_data: {
              name: itemTitle,
              description: `${itemType === 'article' ? 'Article' : itemType === 'course' ? 'Cours' : 'Résumé'} - Dr.MiMi`,
              metadata: {
                itemType,
                itemId,
                priceInDZD: priceInDZD.toString(),
                originalCurrency: 'DZD'
              }
            },
            unit_amount: Math.round(totalInUSD * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        itemType,
        itemId,
        priceInDZD: priceInDZD.toString(),
        taxRate: taxRate.toString(),
      },
      payment_intent_data: {
        metadata: {
          userId,
          itemType,
          itemId,
        }
      }
    });

    return {
      sessionId: session.id,
      url: session.url,
      priceInUSD: totalInUSD,
      priceInDZD,
      exchangeRate: 0.0074
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return null;
  }
}

// Handle successful payment
export async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  // Extract metadata
  const { userId, itemType, itemId, priceInDZD, taxRate } = session.metadata || {};
  
  if (!userId || !itemType || !itemId) {
    throw new Error('Missing required metadata in checkout session');
  }

  return {
    userId,
    itemType,
    itemId,
    priceInDZD: parseFloat(priceInDZD || '0'),
    taxRate: parseFloat(taxRate || '19'),
    amountPaid: session.amount_total ? session.amount_total / 100 : 0,
    currency: session.currency,
    paymentIntentId: session.payment_intent as string,
    customerEmail: session.customer_details?.email || null,
    status: 'paid'
  };
}

// Get customer portal session
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    return session.url;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
}

// Create a product for testing
export async function createTestProduct(name: string, priceInCents: number) {
  try {
    const product = await stripe.products.create({
      name,
      description: 'Test product for Dr.MiMi platform',
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceInCents,
      currency: 'usd',
    });

    return {
      productId: product.id,
      priceId: price.id,
    };
  } catch (error) {
    console.error('Error creating test product:', error);
    throw error;
  }
}

// List all products
export async function listProducts() {
  try {
    const products = await stripe.products.list({
      limit: 100,
      active: true,
    });
    
    return products.data;
  } catch (error) {
    console.error('Error listing products:', error);
    throw error;
  }
}

// Retrieve payment intent
export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}

export default stripe;