'use client';

import React, { useEffect, useState } from 'react';
import { useFormStore } from '@/stores/formStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { interestsSchema, InterestsData } from '@/validators/formValidation';
import { TRAVEL_INTERESTS } from '@/types';
import { Heart, Compass, Plus, X } from 'lucide-react';

const INTEREST_ICONS: Record<string, string> = {
  hiking: '🥾',
  museums: '🏛️',
  'local food': '🍜',
  nightlife: '🎉',
  beaches: '🏖️',
  'historical sites': '🏰',
  shopping: '🛍️',
  photography: '📸',
  'adventure sports': '🪂',
  'spa & wellness': '🧘',
  'art galleries': '🎨',
  architecture: '🏗️',
  'nature & wildlife': '🦁',
  'spiritual sites': '🕉️',
  'local markets': '🏪',
};

export default function TripInterests() {
  const { formData, updateFormField, nextStep } = useFormStore();
  const [customInput, setCustomInput] = useState('');

  const {
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<InterestsData>({
    resolver: zodResolver(interestsSchema),
    defaultValues: {
      interests: formData.interests || [],
    },
  });

  const selectedInterests = watch('interests');

  // Auto-save to store
  useEffect(() => {
    if (selectedInterests) {
      updateFormField('interests', selectedInterests);
    }
  }, [selectedInterests, updateFormField]);

  const toggleInterest = (interest: string) => {
    const current = selectedInterests || [];
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    setValue('interests', updated);
  };

  const addCustomInterest = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;

    const current = selectedInterests || [];
    // Avoid duplicates (case-insensitive)
    if (current.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setCustomInput('');
      return;
    }

    const updated = [...current, trimmed];
    setValue('interests', updated);
    setCustomInput('');
  };

  const removeInterest = (interest: string) => {
    const current = selectedInterests || [];
    const updated = current.filter((i) => i !== interest);
    setValue('interests', updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomInterest();
    }
  };

  const onSubmit = (data: InterestsData) => {
    updateFormField('interests', data.interests);
    nextStep();
  };

  const getPredefinedInterests = () =>
    (selectedInterests || []).filter((i) =>
      TRAVEL_INTERESTS.includes(i as any)
    );

  const getCustomInterests = () =>
    (selectedInterests || []).filter((i) =>
      !TRAVEL_INTERESTS.includes(i as any)
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Compass size={24} className="text-indigo-600" />
          <h3 className="text-xl font-semibold text-gray-900">What do you want to cover?</h3>
        </div>
        <p className="text-sm text-gray-600">
          Select from popular options or add your own custom interests. These will be incorporated into your itinerary.
        </p>
      </div>

      {/* Pre-defined Interest Grid */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Popular Interests:</p>
        <div className="grid grid-cols-2 gap-3">
          {TRAVEL_INTERESTS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 text-left ${
                selectedInterests?.includes(interest)
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <span className="text-2xl">{INTEREST_ICONS[interest]}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 capitalize">{interest}</p>
              </div>
              {selectedInterests?.includes(interest) && (
                <Heart size={18} className="text-indigo-600 fill-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Interest Input */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Add Custom Interests:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Mt. Fuji hiking trail, street food markets..."
            className="flex-1 px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
          />
          <button
            type="button"
            onClick={addCustomInterest}
            disabled={!customInput.trim()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
        <p className="text-xs text-amber-700 mt-2">💡 Tip: Press Enter or click Add to include your custom interest.</p>
      </div>

      {/* Error Message */}
      {errors.interests && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.interests.message}</p>
      )}

      {/* Selected Interests Display */}
      {selectedInterests && selectedInterests.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">Selected Interests:</p>
          <div className="flex flex-wrap gap-2">
            {/* Predefined Interests */}
            {getPredefinedInterests().map((interest) => (
              <div
                key={interest}
                className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-full capitalize flex items-center gap-2 group"
              >
                {INTEREST_ICONS[interest as keyof typeof INTEREST_ICONS]}
                <span>{interest}</span>
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Custom Interests */}
            {getCustomInterests().map((interest) => (
              <div
                key={interest}
                className="bg-amber-600 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2 group"
              >
                <span>✨ {interest}</span>
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
