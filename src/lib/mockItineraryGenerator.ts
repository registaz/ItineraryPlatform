import { AIGenerationRequest, Itinerary, Day, Activity, ActivitySuggestion } from '@/types';
import { generateId, generateDaysList } from '@/utils/helpers';

// Location-specific activity database for popular destinations
const DESTINATION_GUIDES: Record<string, any> = {
  'Tokyo': {
    areas: [
      {
        name: 'Asakusa',
        description: 'Historic temple district',
        activities: [
          { startTime: '10:00', title: 'Senso-ji Temple & Nakamise Street', location: 'Asakusa Temple', cost: 5, description: 'Tokyo\'s oldest Buddhist temple with vibrant shopping street selling traditional souvenirs' },
          { startTime: '12:00', title: 'Lunch at traditional restaurant', location: 'Asakusa', cost: 30, description: 'Try local Japanese dishes in historic setting' },
          { startTime: '14:00', title: 'Sumida River cruise', location: 'Asakusa Pier', cost: 15, description: 'Scenic boat ride along the river with city views' },
          { startTime: '18:00', title: 'Dinner in Asakusa', location: 'Local izakaya', cost: 35, description: 'Evening dining experience with local atmosphere' },
        ]
      },
      {
        name: 'Shibuya & Shinjuku',
        description: 'Modern entertainment district',
        activities: [
          { startTime: '09:00', title: 'Meiji Shrine & Yoyogi Park', location: 'Meiji Shrine', cost: 0, description: 'Sacred forest shrine with peaceful walking paths and beautiful gardens' },
          { startTime: '11:00', title: 'Yoyogi Park exploration', location: 'Yoyogi Park', cost: 0, description: 'Large urban park with seasonal flowers, great for relaxing' },
          { startTime: '13:00', title: 'Lunch in Shinjuku', location: 'Shinjuku', cost: 30, description: 'Contemporary restaurants in busy shopping district' },
          { startTime: '15:00', title: 'Shibuya Crossing & shopping', location: 'Shibuya', cost: 60, description: 'Experience world\'s busiest crossing and trendy fashion stores' },
          { startTime: '19:00', title: 'Dinner in vibrant district', location: 'Shibuya/Shinjuku', cost: 40, description: 'Experience Tokyo\'s famous nightlife and entertainment' },
        ]
      },
      {
        name: 'Ginza',
        description: 'Upscale shopping and dining',
        activities: [
          { startTime: '08:00', title: 'Tsukiji Outer Market early visit', location: 'Tsukiji Market', cost: 25, description: 'Fresh seafood market with sushi breakfast and local produce' },
          { startTime: '10:00', title: 'Ginza luxury shopping', location: 'Ginza', cost: 100, description: 'Flagship stores of luxury brands and renowned Japanese designers' },
          { startTime: '12:30', title: 'Michelin-listed or upscale lunch', location: 'Ginza', cost: 80, description: 'Fine dining experience with world-class Japanese kaiseki or tempura' },
          { startTime: '15:00', title: 'Architectural landmarks tour', location: 'Ginza/Marunouchi', cost: 20, description: 'Modern buildings and historic structures showcasing Tokyo\'s evolution' },
          { startTime: '19:00', title: 'Dinner at specialty restaurant', location: 'Ginza', cost: 50, description: 'Innovative Japanese fusion or traditional fine dining' },
        ]
      },
      {
        name: 'Akihabara',
        description: 'Electronics and anime culture',
        activities: [
          { startTime: '10:00', title: 'Akihabara Electric Town tour', location: 'Akihabara', cost: 40, description: 'World\'s largest electronics district with anime/game culture museums' },
          { startTime: '12:30', title: 'Anime-themed café lunch', location: 'Akihabara', cost: 25, description: 'Unique themed dining experiences (maid cafes or anime restaurants)' },
          { startTime: '14:00', title: 'Retro arcade gaming', location: 'Akihabara arcades', cost: 20, description: 'Classic and modern arcade games, nostalgic entertainment' },
          { startTime: '16:30', title: 'Specialty shops and anime market', location: 'Akihabara', cost: 30, description: 'Manga, anime figures, and gaming merchandise shopping' },
          { startTime: '19:00', title: 'Late dinner in the district', location: 'Akihabara', cost: 30, description: 'Casual ramen or izakaya dining' },
        ]
      }
    ]
  },
  'Hokkaido': {
    areas: [
      {
        name: 'Sapporo Central',
        description: 'Capital city attractions',
        activities: [
          { startTime: '09:00', title: 'Maruyama Park & Hokkaido Shrine', location: 'Maruyama', cost: 0, description: 'Beautiful shrine surrounded by forest with panoramic city views from the park' },
          { startTime: '11:30', title: 'Walk Odori Park', location: 'Odori', cost: 0, description: 'Large urban park with seasonal attractions and green spaces' },
          { startTime: '13:00', title: 'Sapporo Ramen Alley lunch', location: 'Ramen Alley', cost: 25, description: 'Try authentic Hokkaido miso ramen at famous legendary ramen shops' },
          { startTime: '14:30', title: 'Hokkaido Museum visit', location: 'Odori', cost: 15, description: 'Learn about Hokkaido\'s history, Ainu culture, and natural heritage' },
          { startTime: '18:00', title: 'Dinner in Susukino district', location: 'Susukino', cost: 45, description: 'Experience local izakayas and traditional Hokkaido cuisine' },
        ]
      },
      {
        name: 'Otaru Day Trip',
        description: 'Historic port town',
        activities: [
          { startTime: '08:30', title: 'Train to Otaru (30 min)', location: 'Otaru Station', cost: 10, description: 'Scenic JR train ride to charming historic port town' },
          { startTime: '10:00', title: 'Otaru Canal Waterfront Walk', location: 'Otaru Canal', cost: 0, description: 'Stroll along beautifully restored canal and century-old warehouses' },
          { startTime: '11:30', title: 'Fresh seafood at market', location: 'Otaru Market', cost: 35, description: 'Sample fresh local seafood and uni (sea urchin) at waterfront restaurants' },
          { startTime: '13:30', title: 'Glass workshop and museum', location: 'Otaru Glass Museum', cost: 10, description: 'See beautiful handblown glass artworks and local craft traditions' },
          { startTime: '15:30', title: 'Historic warehouses & shops', location: 'Otaru Old Town', cost: 20, description: 'Browse antique shops, cafes, and art galleries in restored buildings' },
          { startTime: '17:30', title: 'Return train to Sapporo', location: 'Otaru Station', cost: 10, description: 'Evening return with scenic sunset views along the coast' },
        ]
      },
      {
        name: 'Asahikawa Day Trip',
        description: 'Ramen capital and zoo',
        activities: [
          { startTime: '09:00', title: 'Visit Asahiyama Zoo', location: 'Asahiyama Zoo', cost: 20, description: 'One of Japan\'s most popular zoos with innovative natural habitat designs' },
          { startTime: '12:00', title: 'Asahikawa Ramen Village lunch', location: 'Ramen Village', cost: 20, description: 'Famous for unique miso-based ramen with distinctive creamy local style' },
          { startTime: '14:00', title: 'Shopping at local mall', location: 'Aeon Mall Asahikawa', cost: 50, description: 'Modern shopping center with local brands and international retailers' },
          { startTime: '16:00', title: 'Local craft shops', location: 'Asahikawa', cost: 30, description: 'Browse traditional crafts and local artisan products' },
          { startTime: '18:00', title: 'Return to Sapporo', location: 'Transport', cost: 15, description: 'Scenic return journey' },
        ]
      }
    ]
  }
};

// Generate 3-4 alternative suggestions for an activity
function generateAlternatives(baseActivity: any, areaName: string, interests: string[]): ActivitySuggestion[] {
  const alternatives: ActivitySuggestion[] = [
    {
      title: baseActivity.title,
      location: baseActivity.location,
      description: baseActivity.description,
      costEstimate: baseActivity.cost || 25,
    }
  ];

  // Add alternative variations based on interests
  const alternatives_pool: Record<string, ActivitySuggestion[]> = {
    '09:00': [
      { title: 'Morning Coffee & Pastries', location: `${areaName} Café`, description: 'Start the day with local coffee and pastries', costEstimate: 15 },
      { title: 'Sunrise Walk & Photography', location: `${areaName} Park`, description: 'Early morning stroll with scenic viewpoints', costEstimate: 0 },
    ],
    '12:00': [
      { title: 'Street Food Market Visit', location: `${areaName} Market`, description: 'Sample local street food and specialties', costEstimate: 20 },
      { title: 'Casual Lunch Spot', location: `${areaName} District`, description: 'Lunch at a popular local restaurant', costEstimate: 25 },
    ],
    '14:00': [
      { title: 'Local Museum or Gallery', location: `${areaName} Cultural Center`, description: 'Explore local art and history', costEstimate: 12 },
      { title: 'Shopping & Browsing', location: `${areaName} Shopping District`, description: 'Local shops and boutique browsing', costEstimate: 30 },
    ],
    '18:00': [
      { title: 'Dinner at Recommended Restaurant', location: `${areaName} Fine Dining`, description: 'Evening meal at a well-reviewed restaurant', costEstimate: 45 },
      { title: 'Casual Evening Meal', location: `${areaName} Comfort Food`, description: 'Relaxed dining experience', costEstimate: 30 },
    ]
  };

  // Add 2-3 more alternatives from the pool if available
  const timeAlterns = alternatives_pool[baseActivity.startTime] || [];
  for (let i = 0; i < Math.min(timeAlterns.length, 3); i++) {
    alternatives.push(timeAlterns[i]);
  }

  return alternatives.slice(0, 4); // Max 4 alternatives
}

export function generateMockItinerary(params: AIGenerationRequest): Itinerary {
  const { country, region, startDate, endDate, budget, currency, theme, dayStartTime, interests, accommodation, flight } = params;

  const days = generateDaysList(startDate, endDate);
  const destinationGuide = DESTINATION_GUIDES[region] || DESTINATION_GUIDES['Tokyo'];
  const areas = destinationGuide.areas || [];

  let totalSpent = 0;
  const itineraryDays: Day[] = days.map((date, dayIndex) => {
    // Rotate through available areas
    const areaIndex = dayIndex % areas.length;
    const currentArea = areas[areaIndex];
    const areaName = currentArea.name;
    let dayActivities = [...currentArea.activities];

    // First day: filter activities to start after arrival time
    if (dayIndex === 0) {
      const [arrHour, arrMin] = flight.arrivalTime.split(':').map(Number);
      const arrivalMinutes = arrHour * 60 + arrMin;
      dayActivities = [
        {
          startTime: flight.arrivalTime,
          title: 'Arrival & Hotel Check-in',
          location: accommodation || `${areaName} Hotel`,
          cost: 0,
          description: 'Arrive and settle into your accommodation'
        },
        ...dayActivities.filter(a => {
          const [aHour, aMin] = a.startTime.split(':').map(Number);
          return aHour * 60 + aMin >= arrivalMinutes + 120; // At least 2 hours after arrival
        }).slice(0, 3)
      ];
    }

    // Last day: filter activities to end before departure time
    if (dayIndex === days.length - 1) {
      const [depHour, depMin] = flight.departureTime.split(':').map(Number);
      const departureMinutes = depHour * 60 + depMin;
      dayActivities = dayActivities
        .filter(a => {
          const [aHour, aMin] = a.startTime.split(':').map(Number);
          return aHour * 60 + aMin < departureMinutes - 180; // End 3 hours before departure
        })
        .slice(0, 3);
      // Add return to hotel/airport activity
      dayActivities.push({
        startTime: `${String(Math.max(depHour - 2, 0)).padStart(2, '0')}:00`,
        title: 'Return to hotel/Prepare for departure',
        location: accommodation || `${areaName} Hotel`,
        cost: 0,
        description: 'Pack and prepare for departure'
      });
    }

    const activities: Activity[] = dayActivities.map((activity) => {
      const cost = activity.cost || Math.floor(Math.random() * 40) + 20;
      totalSpent += cost;

      // Generate alternatives for this activity
      const suggestions = generateAlternatives(activity, areaName, interests);

      return {
        id: generateId(),
        startTime: activity.startTime,
        duration: Math.floor(60 + Math.random() * 90),
        category: activity.category || ('attraction' as any),
        customized: false,
        suggestions: suggestions,
        selectedSuggestionIndex: 0, // Default to first suggestion
      };
    });

    return {
      id: generateId(),
      date: date,
      dayNumber: dayIndex + 1,
      area: areaName,
      activities: activities,
      totalCost: activities.reduce((sum, act) => {
        if (act.suggestions && act.suggestions.length > 0) {
          const selectedIndex = act.selectedSuggestionIndex ?? 0;
          return sum + (act.suggestions[selectedIndex]?.costEstimate || 0);
        }
        return sum + (act.costEstimate || 0);
      }, 0),
    };
  });

  return {
    id: generateId(),
    title: `${region}, ${country} Adventure`,
    country: country,
    region: region,
    dateRange: {
      start: startDate,
      end: endDate,
    },
    budget: {
      total: budget,
      currency: currency,
      spent: Math.min(Math.max(totalSpent, 100), budget),
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
      aiGenerated: false,
    },
  };
}
