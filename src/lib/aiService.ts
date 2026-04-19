import { AIGenerationRequest, Itinerary, Day, Activity } from '@/types';
import { generateMockItinerary } from './mockItineraryGenerator';
import { generateDaysList, generateId } from '@/utils/helpers';

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

export async function generateItineraryWithAI(
  params: AIGenerationRequest
): Promise<Itinerary> {
  const { country, region, startDate, endDate, budget, currency, theme, dayStartTime, interests, flight } = params;

  const days = generateDaysList(startDate, endDate);

  const systemPrompt = `You are an expert travel planner. Create a JSON itinerary with daily activities in ${region}, ${country}.

IMPORTANT RULES:
- Return ONLY valid JSON in the exact format requested
- No markdown, no explanations, no extra text
- Days should show real activities specific to ${region}, ${country}
- Each day should be assigned to a unique area/neighborhood within ${region}
- Activities must respect ${dayStartTime} start time
- Keep costs realistic and within ${budget} ${currency} total
- Generate 4-5 activities per day covering morning, afternoon, and EVENING/DINNER
- Include dining and dinner activities every day
- Prioritize activities related to: ${interests.join(', ')}
- Ensure selected interests are well-represented in the itinerary
- FLIGHT CONSTRAINTS:
  * First day (${startDate}): No activities before ${flight.arrivalTime} (arrival time)
  * Last day (${endDate}): No activities after ${flight.departureTime} (departure time)
  * Schedule activities to make full use of available time
- Focus on attractions, experiences, and activities unique to ${region}`;

  const userPrompt = `Create a ${days.length}-day itinerary for ${region}, ${country}.
Budget: ${budget} ${currency}
Theme: ${theme}
Start time: ${dayStartTime}
Arrival: ${flight.arrivalTime} on ${startDate}
Departure: ${flight.departureTime} on ${endDate}
Origin: ${flight.origin}
User Interests: ${interests.join(', ')}

IMPORTANT: Include evening and dinner activities EVERY day. Don't end activities early.

Return this JSON:
{
  "days": [
    {
      "date": "2026-05-05",
      "dayNumber": 1,
      "area": "Area/Neighborhood Name",
      "activities": [
        {
          "startTime": "14:00",
          "duration": 120,
          "title": "Activity",
          "description": "brief description",
          "costEstimate": 50,
          "category": "attraction",
          "location": "place"
        },
        {
          "startTime": "19:00",
          "duration": 90,
          "title": "Dinner at Local Restaurant",
          "description": "Experience local cuisine",
          "costEstimate": 30,
          "category": "dining",
          "location": "restaurant name"
        }
      ]
    }
  ]
}`;

  const fullPrompt = `${systemPrompt}\n\nUser Request:\n${userPrompt}`;

  // Call Ollama API with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minute timeout

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: false,
        temperature: 0.7,
      }),
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle different response formats
    let responseText = '';
    if (data.response) {
      responseText = data.response;
    } else if (typeof data === 'string') {
      responseText = data;
    } else if (data.message?.content) {
      responseText = data.message.content;
    } else if (data.choices?.[0]?.message?.content) {
      responseText = data.choices[0].message.content;
    }

    if (!responseText) {
      console.error('Ollama response format:', JSON.stringify(data, null, 2));
      throw new Error('Empty response from Ollama');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const jsonString = responseText
        .replace(/```json\n?|\n?```/g, '')
        .replace(/```\n?|\n?```/g, '')
        .trim();
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Failed to parse itinerary from AI response');
    }

    // Calculate total spent
    let totalSpent = 0;

    // Transform AI response into Itinerary structure
    const itineraryDays: Day[] = (parsedResponse.days || []).map((dayData: any, index: number) => {
      const activities: Activity[] = (dayData.activities || []).map((activity: any) => {
        const costEstimate = Number(activity.costEstimate) || 0;
        totalSpent += costEstimate;

        return {
          id: generateId(),
          title: activity.title || 'Activity',
          startTime: activity.startTime || dayStartTime,
          duration: Number(activity.duration) || 60,
          location: activity.location || 'TBD',
          description: activity.description || '',
          costEstimate: costEstimate,
          category: activity.category || 'other',
          customized: false,
        };
      });

      return {
        id: generateId(),
        date: dayData.date || days[index] || startDate,
        dayNumber: dayData.dayNumber || index + 1,
        area: dayData.area || 'Main Area',
        activities: activities,
        totalCost: activities.reduce((sum, act) => sum + (act.costEstimate || 0), 0),
      };
    });

    const itinerary: Itinerary = {
      id: generateId(),
      title: `${region}, ${country} Trip`,
      country: country,
      region: region,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      budget: {
        total: budget,
        currency: currency,
        spent: totalSpent,
      },
      theme: theme,
      dayStartTime: dayStartTime,
      flight: {
        origin: flight.origin,
        arrivalTime: flight.arrivalTime,
        departureTime: flight.departureTime,
      },
      days: itineraryDays,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiGenerated: true,
      },
    };

    return itinerary;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error in generateItineraryWithAI:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Itinerary generation timed out, using fallback');
      return generateMockItinerary(params);
    }
    
    // On any other error with Ollama, use fallback
    console.warn('Ollama API error, using fallback itinerary:', error);
    return generateMockItinerary(params);
  }
}
