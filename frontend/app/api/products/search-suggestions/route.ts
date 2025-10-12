import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!query) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Fetch from your products API with search
    const productsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?q=${encodeURIComponent(query)}&limit=${limit}`
    );

    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }

    const productsData = await productsResponse.json();

    const suggestions = productsData.data.map((product: any) => ({
      type: 'product',
      id: product._id,
      name: product.title,
      image: product.images[0]?.url,
      category: product.categoryId?.name,
      priceCents: product.priceCents,
      brand: product.brand
    }));

    return NextResponse.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch search suggestions' },
      { status: 500 }
    );
  }
}