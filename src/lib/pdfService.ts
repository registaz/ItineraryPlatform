import { Itinerary } from '@/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function generatePDF(itinerary: Itinerary): Promise<Uint8Array> {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to check if we need a new page
  const ensurePageSpace = (neededSpace: number) => {
    if (yPosition + neededSpace > height - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title
  doc.setFontSize(24);
  doc.setFont('', 'bold');
  doc.text(`${itinerary.country} Itinerary`, width / 2, yPosition, {
    align: 'center',
  });
  yPosition += 15;

  // Trip Details
  doc.setFontSize(11);
  doc.setFont('', 'normal');

  const startDate = new Date(itinerary.dateRange.start).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const endDate = new Date(itinerary.dateRange.end).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tripDetails = [
    [`Dates: ${startDate} to ${endDate}`],
    [`Duration: ${itinerary.days.length} days`],
    [`Theme: ${itinerary.theme}`],
    [`Budget: ${itinerary.budget.total.toLocaleString()} ${itinerary.budget.currency}`],
    [`Planned Spending: ${itinerary.budget.spent.toLocaleString()} ${itinerary.budget.currency}`],
    [`Day Start Time: ${itinerary.dayStartTime}`],
  ];

  doc.setFontSize(10);
  tripDetails.forEach((detail) => {
    doc.text(detail[0], 20, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Days and Activities
  itinerary.days.forEach((day) => {
    ensurePageSpace(30);

    // Day header
    const dayDate = new Date(day.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    doc.setFontSize(12);
    doc.setFont('', 'bold');
    doc.text(`Day ${day.dayNumber}: ${dayDate}`, 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('', 'normal');

    // Activities for this day
    day.activities.forEach((activity) => {
      ensurePageSpace(15);

      const endTime = calculateEndTime(activity.startTime, activity.duration);

      // Activity time and title
      doc.setFont('', 'bold');
      doc.text(
        `${activity.startTime} - ${endTime} | ${activity.title}`,
        25,
        yPosition
      );
      yPosition += 5;

      // Activity details
      doc.setFont('', 'normal');
      doc.setFontSize(9);

      const detailsText = [
        `Duration: ${activity.duration} minutes`,
        `Cost: ${activity.costEstimate} ${itinerary.budget.currency}`,
      ];

      if (activity.location) {
        detailsText.push(`Location: ${activity.location}`);
      }

      detailsText.push(`Category: ${activity.category}`);
      detailsText.push(`${activity.description}`);

      detailsText.forEach((detail) => {
        doc.text(detail, 30, yPosition);
        yPosition += 4;
      });

      yPosition += 3;
    });

    // Day summary
    doc.setFont('', 'bold');
    doc.setFontSize(10);
    doc.text(`Day Total: ${day.totalCost} ${itinerary.budget.currency}`, 25, yPosition);
    yPosition += 8;
  });

  // Summary page
  ensurePageSpace(50);
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(14);
  doc.setFont('', 'bold');
  doc.text('Budget Summary', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('', 'normal');

  doc.setFont('', 'bold');
  doc.text('Total Budget:', 20, yPosition);
  doc.setFont('', 'normal');
  doc.text(`${itinerary.budget.total} ${itinerary.budget.currency}`, 100, yPosition);
  yPosition += 8;

  doc.setFont('', 'bold');
  doc.text('Total Planned:', 20, yPosition);
  doc.setFont('', 'normal');
  doc.text(`${itinerary.budget.spent} ${itinerary.budget.currency}`, 100, yPosition);
  yPosition += 8;

  doc.setFont('', 'bold');
  doc.text('Remaining:', 20, yPosition);
  doc.setFont('', 'normal');
  doc.text(
    `${itinerary.budget.total - itinerary.budget.spent} ${itinerary.budget.currency}`,
    100,
    yPosition
  );
  yPosition += 15;

  // Cost by category
  doc.setFont('', 'bold');
  doc.setFontSize(11);
  doc.text('Spending by Category:', 20, yPosition);
  yPosition += 7;

  doc.setFont('', 'normal');
  doc.setFontSize(10);

  const categoryTotals: Record<string, number> = {};
  itinerary.days.forEach((day) => {
    day.activities.forEach((activity) => {
      const cat = activity.category;
      let cost = activity.costEstimate || 0;
      if (cost === 0 && activity.suggestions && activity.suggestions.length > 0) {
        const selectedIndex = activity.selectedSuggestionIndex ?? 0;
        cost = activity.suggestions[selectedIndex]?.costEstimate || 0;
      }
      categoryTotals[cat] = (categoryTotals[cat] || 0) + cost;
    });
  });

  Object.entries(categoryTotals).forEach(([category, total]) => {
    doc.text(`${category}: ${total} ${itinerary.budget.currency}`, 25, yPosition);
    yPosition += 5;
  });

  // Footer
  yPosition = height - 20;
  doc.setFontSize(8);
  doc.setFont('', 'normal');
  doc.text('Generated by Travel Itinerary Planner', width / 2, yPosition, {
    align: 'center',
  });

  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer);
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;

  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}
