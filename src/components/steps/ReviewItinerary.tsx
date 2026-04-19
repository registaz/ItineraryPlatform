'use client';

import React, { useState, useEffect } from 'react';
import { useFormStore } from '@/stores/formStore';
import { useItineraryStore } from '@/stores/formStore';
import { formatDate } from '@/utils/helpers';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { generateMockItinerary } from '@/lib/mockItineraryGenerator';

export default function ReviewItinerary() {
  const { formData, nextStep } = useFormStore();
  const { setCurrentItinerary } = useFormStore();
  const { addItinerary } = useItineraryStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate form data
  const isFormValid =
    formData.country &&
    formData.region &&
    formData.startDate &&
    formData.endDate &&
    formData.budget &&
    formData.currency &&
    formData.theme &&
    formData.dayStartTime &&
    formData.interests &&
    formData.interests.length > 0 &&
    formData.flight?.origin;

  const handleGenerateItinerary = async () => {
    if (!isFormValid) {
      setError('Please complete all fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: formData.country,
          region: formData.region,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: formData.budget,
          currency: formData.currency,
          theme: formData.theme,
          dayStartTime: formData.dayStartTime,
          interests: formData.interests || [],
          accommodation: formData.accommodation || '',
          flight: {
            origin: formData.flight?.origin || '',
            arrivalTime: formData.flight?.arrivalTime || '12:00',
            departureTime: formData.flight?.departureTime || '18:00',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setCurrentItinerary(result.data);
        addItinerary(result.data);
        nextStep();
      } else if (isFormValid) {
        // API returned unexpected format, use mock itinerary
        const mockItinerary = generateMockItinerary({
          country: formData.country || '',
          region: formData.region || '',
          startDate: formData.startDate || '',
          endDate: formData.endDate || '',
          budget: formData.budget || 1000,
          currency: formData.currency || 'USD',
          theme: formData.theme || '',
          dayStartTime: formData.dayStartTime || '10:00',
          interests: formData.interests || [],
          accommodation: formData.accommodation || '',
          flight: {
            origin: formData.flight?.origin || '',
            arrivalTime: formData.flight?.arrivalTime || '12:00',
            departureTime: formData.flight?.departureTime || '18:00',
          },
        });
        setCurrentItinerary(mockItinerary);
        addItinerary(mockItinerary);
        nextStep();
      } else {
        setError(result.error || 'Failed to generate itinerary');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError' && isFormValid) {
        // Timeout - use mock itinerary and proceed
        const mockItinerary = generateMockItinerary({
          country: formData.country || '',
          region: formData.region || '',
          startDate: formData.startDate || '',
          endDate: formData.endDate || '',
          budget: formData.budget || 1000,
          currency: formData.currency || 'USD',
          theme: formData.theme || '',
          dayStartTime: formData.dayStartTime || '10:00',
          interests: formData.interests || [],
          accommodation: formData.accommodation || '',
          flight: {
            origin: formData.flight?.origin || '',
            arrivalTime: formData.flight?.arrivalTime || '12:00',
            departureTime: formData.flight?.departureTime || '18:00',
          },
        });
        setCurrentItinerary(mockItinerary);
        addItinerary(mockItinerary);
        nextStep();
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getDayOfWeek = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getTimeLabel = () => {
    if (!formData.dayStartTime) return '';
    const [hours, minutes] = formData.dayStartTime.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getThemeEmoji = (theme?: string) => {
    const emojis: Record<string, string> = {
      adventure: '🏔️',
      shopping: '🛍️',
      relaxation: '🏖️',
      culture: '🏛️',
      food: '🍜',
      nature: '🌿',
      nightlife: '🎉',
      'budget-friendly': '💰',
      luxury: '✨',
      'family-friendly': '👨‍👩‍👧‍👦',
    };
    return emojis[theme || 'adventure'] || '✈️';
  };

  return (
    <div className="space-y-6">
      {/* Summary of Trip */}
      {isFormValid && (
        <div className="space-y-4">
          {/* Trip Overview Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              {getThemeEmoji(formData.theme)} Your {formData.region}, {formData.country} Adventure
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-indigo-100 text-sm">Starting:</p>
                <p className="font-bold">{formatDate(formData.startDate!)}</p>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Ending:</p>
                <p className="font-bold">{formatDate(formData.endDate!)}</p>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Duration:</p>
                <p className="font-bold">{calculateDays()} days</p>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Budget:</p>
                <p className="font-bold">
                  {formData.budget?.toLocaleString()} {formData.currency}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-indigo-100 text-sm">Day Start Time:</p>
                <p className="font-bold">{getTimeLabel()}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-semibold mb-1">LOCATION</p>
              <p className="text-lg font-bold text-blue-900">{formData.region}, {formData.country}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-green-600 font-semibold mb-1">THEME</p>
              <p className="text-lg font-bold text-green-900 capitalize">
                {formData.theme}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-xs text-purple-600 font-semibold mb-1">BUDGET</p>
              <p className="text-lg font-bold text-purple-900">
                {formData.budget?.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-xs text-orange-600 font-semibold mb-1">START TIME</p>
              <p className="text-lg font-bold text-orange-900">{getTimeLabel()}</p>
            </div>
          </div>

          {/* Trip Interests */}
          {formData.interests && formData.interests.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-xs text-indigo-600 font-semibold mb-3">YOUR INTERESTS</p>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-full capitalize"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Information Box */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="text-cyan-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-cyan-900 mb-1">Ready to Generate?</p>
              <p className="text-sm text-cyan-800">
                Click the button below to use AI to generate your personalized itinerary based on your preferences.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-red-900 mb-1">Error</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerateItinerary}
        disabled={!isFormValid || isGenerating}
        className={`w-full py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
          isGenerating || !isFormValid
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader size={24} className="animate-spin" />
            Generating Your Itinerary...
          </>
        ) : (
          <>
            ✨ Generate My Itinerary
          </>
        )}
      </button>

      {/* Validation Warning */}
      {!isFormValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Please go back and complete all required fields before generating your itinerary.
          </p>
        </div>
      )}
    </div>
  );
}
