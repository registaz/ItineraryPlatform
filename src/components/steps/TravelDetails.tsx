'use client';

import React, { useEffect } from 'react';
import { useFormStore } from '@/stores/formStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { travelDetailsSchema, TravelDetailsData } from '@/validators/formValidation';
import { TRAVEL_THEMES, CURRENCIES } from '@/types';
import { Calendar, DollarSign, Sparkles, Plane } from 'lucide-react';

export default function TravelDetails() {
  const { formData, updateFormField, nextStep } = useFormStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TravelDetailsData>({
    resolver: zodResolver(travelDetailsSchema),
    defaultValues: {
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      budget: formData.budget || 1000,
      currency: (formData.currency || 'USD') as any,
      theme: (formData.theme || 'adventure') as any,
      accommodation: formData.accommodation || '',
      origin: formData.flight?.origin || '',
      arrivalTime: formData.flight?.arrivalTime || '12:00',
      departureTime: formData.flight?.departureTime || '18:00',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const budget = watch('budget');
  const theme = watch('theme');
  const currency = watch('currency');
  const accommodation = watch('accommodation');
  const origin = watch('origin');
  const arrivalTime = watch('arrivalTime');
  const departureTime = watch('departureTime');

  // Auto-save form data to store as user makes changes
  useEffect(() => {
    if (startDate) updateFormField('startDate', startDate);
    if (endDate) updateFormField('endDate', endDate);
    if (budget) updateFormField('budget', budget);
    if (currency) updateFormField('currency', currency);
    if (theme) updateFormField('theme', theme);
    if (accommodation) updateFormField('accommodation', accommodation);
    if (origin || arrivalTime || departureTime) {
      updateFormField('flight', {
        origin: origin || '',
        arrivalTime: arrivalTime || '12:00',
        departureTime: departureTime || '18:00',
      });
    }
  }, [startDate, endDate, budget, currency, theme, accommodation, origin, arrivalTime, departureTime, updateFormField]);

  const handleThemeClick = (selectedTheme: string) => {
    setValue('theme', selectedTheme);
    updateFormField('theme', selectedTheme);
  };

  const onSubmit = (data: TravelDetailsData) => {
    updateFormField('startDate', data.startDate);
    updateFormField('endDate', data.endDate);
    updateFormField('budget', data.budget);
    updateFormField('currency', data.currency);
    updateFormField('theme', data.theme);
    updateFormField('accommodation', data.accommodation);
    updateFormField('flight', {
      origin: data.origin,
      arrivalTime: data.arrivalTime,
      departureTime: data.departureTime,
    });
    nextStep();
  };

  // Get theme emoji
  const getThemeEmoji = (t: string) => {
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
    return emojis[t] || '✈️';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      {/* Start Date */}
      <div>
        <label htmlFor="startDate" className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
          <Calendar size={18} className="text-blue-600" />
          Start Date
        </label>
        <input
          id="startDate"
          type="date"
          {...register('startDate')}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-slate-900 placeholder-slate-400"
        />
        {errors.startDate && (
          <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.startDate.message}</p>
        )}
      </div>

      {/* End Date */}
      <div>
        <label htmlFor="endDate" className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
          <Calendar size={18} className="text-blue-600" />
          End Date
        </label>
        <input
          id="endDate"
          type="date"
          {...register('endDate')}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-slate-900 placeholder-slate-400"
        />
        {errors.endDate && (
          <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.endDate.message}</p>
        )}
      </div>

      {/* Budget Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Budget Amount */}
        <div>
          <label htmlFor="budget" className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
            <DollarSign size={18} className="text-blue-600" />
            Budget
          </label>
          <input
            id="budget"
            type="number"
            {...register('budget', { valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-slate-900 placeholder-slate-400"
          />
          {errors.budget && (
            <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.budget.message}</p>
          )}
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-semibold text-slate-900 mb-2.5">
            Currency
          </label>
          <select
            id="currency"
            {...register('currency')}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-slate-900"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Budget Display */}
      {budget && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-blue-900">
            {budget.toLocaleString()} {currency}
          </p>
        </div>
      )}

      {/* Accommodation Information */}
      <div className="space-y-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🏨</span>
          <h3 className="text-sm font-semibold text-slate-900">Accommodation (Optional)</h3>
        </div>
        
        <div>
          <label htmlFor="accommodation" className="block text-sm font-medium text-slate-700 mb-2">
            Hotel/Accommodation Name or Area
          </label>
          <input
            id="accommodation"
            type="text"
            placeholder="e.g., Shibuya Hotel, Shinjuku Guest House, or area name"
            {...register('accommodation')}
            className="w-full px-3.5 py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white text-slate-900 placeholder-slate-400"
          />
          <p className="text-xs text-purple-700 bg-purple-100 rounded p-2 mt-2">
            💡 Helps us plan activities near your accommodation and create a logical daily flow.
          </p>
        </div>
      </div>

      {/* Flight Information */}
      <div className="space-y-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-1">
          <Plane size={18} className="text-amber-600" />
          <h3 className="text-sm font-semibold text-slate-900">Flight Information</h3>
        </div>
        
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-slate-700 mb-2">
            Origin Country
          </label>
          <input
            id="origin"
            type="text"
            placeholder="e.g., USA, Canada"
            {...register('origin')}
            className="w-full px-3.5 py-2.5 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition bg-white text-slate-900 placeholder-slate-400"
          />
          {errors.origin && (
            <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.origin.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="arrivalTime" className="block text-sm font-medium text-slate-700 mb-2">
              Arrival Time on {startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'start date'}
            </label>
            <input
              id="arrivalTime"
              type="time"
              {...register('arrivalTime')}
              className="w-full px-3.5 py-2.5 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition bg-white text-slate-900"
            />
            {errors.arrivalTime && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.arrivalTime.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="departureTime" className="block text-sm font-medium text-slate-700 mb-2">
              Departure Time on {endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'end date'}
            </label>
            <input
              id="departureTime"
              type="time"
              {...register('departureTime')}
              className="w-full px-3.5 py-2.5 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition bg-white text-slate-900"
            />
            {errors.departureTime && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.departureTime.message}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-amber-700 bg-amber-100 rounded p-2">
          💡 This helps us schedule activities around your arrival and departure times.
        </p>
      </div>

      {/* Travel Theme */}
      <div>
        <label htmlFor="theme" className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3.5">
          <Sparkles size={18} className="text-blue-600" />
          Travel Theme
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {TRAVEL_THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleThemeClick(t)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium flex items-center gap-2.5 ${
                theme === t
                  ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <span className="text-lg">{getThemeEmoji(t)}</span>
              {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
        {errors.theme && (
          <p className="mt-2 text-sm text-red-600 font-medium">{errors.theme.message}</p>
        )}
      </div>

      {/* Theme Description */}
      {theme && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-900">
            ✨ Your trip will be tailored for <span className="font-semibold text-blue-600">{theme}</span> experiences.
          </p>
        </div>
      )}
    </form>
  );
}
