import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (replace with database in production)
let categories = [
  { _id: '1', name: 'Electronics', slug: 'electronics' },
  { _id: '2', name: 'Clothing', slug: 'clothing' },
  { _id: '3', name: 'Home & Garden', slug: 'home-garden' },
];

// GET all categories
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    // Validation
    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and slug are required',
        },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existingCategory = categories.find(cat => cat.slug === slug);
    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'A category with this slug already exists',
        },
        { status: 400 }
      );
    }

    const newCategory = {
      _id: Date.now().toString(),
      name,
      slug,
    };

    categories.push(newCategory);

    return NextResponse.json({
      success: true,
      data: newCategory,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create category',
      },
      { status: 500 }
    );
  }
}