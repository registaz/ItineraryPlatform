import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/lib/pdfService';
import { Itinerary } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const itinerary: Itinerary = await request.json();

    if (!itinerary || !itinerary.country) {
      return NextResponse.json(
        { error: 'Invalid itinerary data' },
        { status: 400 }
      );
    }

    const pdfBuffer = await generatePDF(itinerary);

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${itinerary.country.toLowerCase()}-itinerary.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      },
      { status: 500 }
    );
  }
}
