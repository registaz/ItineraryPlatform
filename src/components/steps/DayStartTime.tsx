'use client';

import React, { useEffect } from 'react';
import { useFormStore } from '@/stores/formStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dayStartTimeSchema, DayStartTimeData } from '@/validators/formValidation';
import { Clock, Info } from 'lucide-react';

export default function DayStartTime() {
  const { formData, updateFormField, nextStep } = useFormStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DayStartTimeData>({
    resolver: zodResolver(dayStartTimeSchema),
    defaultValues: {
      dayStartTime: formData.dayStartTime || '09:00',
    },
  });

  const dayStartTime = watch('dayStartTime');

  // Auto-save to store when time changes
  useEffect(() => {
    if (dayStartTime) {
      updateFormField('dayStartTime', dayStartTime);
    }
  }, [dayStartTime, updateFormField]);

  // Suggested times with emojis
  const suggestedTimes = [
    { time: '06:00', label: 'Early Bird', emoji: '🌄' },
    { time: '08:00', label: 'Morning', emoji: '☀️' },
    { time: '09:00', label: 'Late Morning', emoji: '🌞' },
    { time: '10:00', label: 'Mid-morning', emoji: '☕' },
    { time: '12:00', label: 'Midday', emoji: '🍽️' },
    { time: '14:00', label: 'Afternoon', emoji: '🌤️' },
    { time: '16:00', label: 'Late Afternoon', emoji: '☕' },
    { time: '18:00', label: 'Evening', emoji: '🌅' },
  ];

  const onSubmit = (data: DayStartTimeData) => {
    updateFormField('dayStartTime', data.dayStartTime);
    nextStep();
  };

  const handleQuickSelectTime = (time: string) => {
    setValue('dayStartTime', time);
  };

  const getCurrentTime = () => {
    const [hours, minutes] = dayStartTime.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Important Note */}
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 flex gap-3">
        <Info className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-semibold text-amber-900 mb-1">Before We Generate Your Itinerary</p>
          <p className="text-sm text-amber-800">
            What time do you typically wake up and start your day? This helps us schedule activities at times that work for you.
          </p>
        </div>
      </div>

      {/* Time Picker */}
      <div>
        <label htmlFor="dayStartTime" className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
          <Clock size={18} />
          What time do you want your day to start?
        </label>
        <input
          id="dayStartTime"
          type="time"
          {...register('dayStartTime')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-center text-lg"
        />
        {errors.dayStartTime && (
          <p className="mt-2 text-sm text-red-600">{errors.dayStartTime.message}</p>
        )}
      </div>

      {/* Selected Time Display */}
      {dayStartTime && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 text-center">
          <p className="text-sm text-gray-600 mb-2">Your day will start at</p>
          <p className="text-3xl font-bold text-indigo-900">{getCurrentTime()}</p>
        </div>
      )}

      {/* Quick Select Buttons */}
      <div>
        <p className="text-sm font-medium text-gray-900 mb-3">Or choose a suggested time:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {suggestedTimes.map((option) => (
            <button
              key={option.time}
              type="button"
              onClick={() => handleQuickSelectTime(option.time)}
              className={`p-3 rounded-lg border-2 transition-all text-sm font-medium flex flex-col items-center gap-1 ${
                dayStartTime === option.time
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{option.emoji}</span>
              <span className="text-xs">{option.label}</span>
              <span className="text-xs font-bold">{option.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-blue-900">Why this matters:</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Activities will be scheduled after your chosen start time</li>
          <li>✓ No early morning surprises if you're not a morning person</li>
          <li>✓ Respects your natural sleep schedule</li>
        </ul>
      </div>
    </form>
  );
}
