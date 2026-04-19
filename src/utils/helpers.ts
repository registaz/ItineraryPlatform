/**
 * Date and time utility functions
 */

export function calculateDayCount(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  return diffDays;
}

export function generateDaysList(startDate: string, endDate: string): string[] {
  const days = [];
  const current = new Date(startDate);
  const last = new Date(endDate);

  while (current <= last) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(time: string): string {
  // Expects HH:MM format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const startMinutes = timeToMinutes(time);
  const endMinutes = (startMinutes + minutesToAdd) % (24 * 60); // Handle day overflow
  return minutesToTime(endMinutes);
}

export function getDayNumberFromDate(startDate: string, currentDate: string): number {
  const start = new Date(startDate);
  const current = new Date(currentDate);
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

/**
 * Budget and cost utilities
 */

export function calculateTotalCost(activities: any[]): number {
  return activities.reduce((sum, activity) => sum + (activity.costEstimate || 0), 0);
}

export function groupCostByCategory(activities: any[]): Record<string, number> {
  return activities.reduce((acc, activity) => {
    const category = activity.category || 'other';
    acc[category] = (acc[category] || 0) + (activity.costEstimate || 0);
    return acc;
  }, {} as Record<string, number>);
}

export function calculateBudgetRemaining(totalBudget: number, spent: number): number {
  return Math.max(0, totalBudget - spent);
}

export function calculateBudgetPercentage(spent: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, (spent / total) * 100);
}

/**
 * ID Generation
 */

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Form utilities
 */

export function isFormDataValid(formData: any): boolean {
  return (
    formData.country &&
    formData.startDate &&
    formData.endDate &&
    formData.budget > 0 &&
    formData.currency &&
    formData.theme &&
    formData.dayStartTime &&
    new Date(formData.startDate) < new Date(formData.endDate)
  );
}

/**
 * Export utilities
 */

export function downloadJSON(data: any, filename: string = 'itinerary.json'): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatCountryForAPI(country: string): string {
  // Remove extra whitespace and format for API calls
  return country.trim().toLowerCase().replace(/\s+/g, ' ');
}
