import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const itineraries = await prisma.itinerary.findMany({
      include: {
        days: {
          include: {
            activities: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(itineraries);
  } catch (error) {
    console.error('Failed to fetch itineraries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itineraries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const itinerary = await request.json();

    // Validate required fields
    if (!itinerary.title || !itinerary.country || !itinerary.days) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if itinerary exists (if it has an id from previous save)
    const existingItinerary = itinerary.id 
      ? await prisma.itinerary.findUnique({
          where: { id: itinerary.id }
        })
      : null;

    if (existingItinerary) {
      // Update existing itinerary
      const updatedItinerary = await prisma.itinerary.update({
        where: { id: itinerary.id },
        data: {
          title: itinerary.title,
          country: itinerary.country,
          region: itinerary.region,
          startDate: new Date(itinerary.dateRange.start),
          endDate: new Date(itinerary.dateRange.end),
          budget: itinerary.budget.total,
          currency: itinerary.budget.currency,
          spentAmount: itinerary.budget.spent,
          theme: itinerary.theme,
          dayStartTime: itinerary.dayStartTime,
          days: {
            deleteMany: {},
            create: itinerary.days.map((day: any) => ({
              date: new Date(day.date),
              dayNumber: day.dayNumber,
              area: day.area,
              activities: {
                create: day.activities.map((activity: any) => ({
                  title: activity.title,
                  startTime: activity.startTime,
                  duration: activity.duration,
                  location: activity.location,
                  description: activity.description,
                  costEstimate: activity.costEstimate,
                  category: activity.category,
                  customized: activity.customized !== false,
                })),
              },
            })),
          },
        },
        include: {
          days: {
            include: {
              activities: true,
            },
          },
        },
      });

      return NextResponse.json(updatedItinerary);
    } else {
      // Create new itinerary
      const newItinerary = await prisma.itinerary.create({
        data: {
          title: itinerary.title,
          country: itinerary.country,
          region: itinerary.region,
          startDate: new Date(itinerary.dateRange.start),
          endDate: new Date(itinerary.dateRange.end),
          budget: itinerary.budget.total,
          currency: itinerary.budget.currency,
          spentAmount: itinerary.budget.spent,
          theme: itinerary.theme,
          dayStartTime: itinerary.dayStartTime,
          aiGenerated: itinerary.aiGenerated !== false,
          days: {
            create: itinerary.days.map((day: any) => ({
              date: new Date(day.date),
              dayNumber: day.dayNumber,
              area: day.area,
              activities: {
                create: day.activities.map((activity: any) => ({
                  title: activity.title,
                  startTime: activity.startTime,
                  duration: activity.duration,
                  location: activity.location,
                  description: activity.description,
                  costEstimate: activity.costEstimate,
                  category: activity.category,
                  customized: activity.customized !== false,
                })),
              },
            })),
          },
        },
        include: {
          days: {
            include: {
              activities: true,
            },
          },
        },
      });

      return NextResponse.json(newItinerary);
    }
  } catch (error) {
    console.error('Failed to save itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to save itinerary' },
      { status: 500 }
    );
  }
}
