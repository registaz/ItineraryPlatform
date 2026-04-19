import { NextRequest, NextResponse } from 'next/server';
import { generateItineraryWithAI } from '@/lib/aiService';
import { aiGenerationRequestSchema } from '@/validators/formValidation';
import { ApiResponse, Itinerary } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();

    // Validate with Zod
    const validationResult = aiGenerationRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request parameters',
          message: validationResult.error.message,
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const params = validationResult.data;

    // Check if Ollama is accessible (optional warning, not a blocker)
    const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
    const ollamaModel = process.env.OLLAMA_MODEL || 'mistral';

    // Generate itinerary
    const itinerary = await generateItineraryWithAI(params);

    return NextResponse.json(
      {
        success: true,
        data: itinerary,
      } as ApiResponse<Itinerary>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating itinerary:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate itinerary';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
