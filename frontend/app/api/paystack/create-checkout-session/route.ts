import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, amount, metadata } = await request.json();

    // Initialize Paystack transaction :cite[3]
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount, // Amount in kobo
        metadata,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initialize Paystack transaction');
    }

    const data = await response.json();

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}