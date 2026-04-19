'use client';

import React from 'react';
import { useFormStore } from '@/stores/formStore';

export default function ExportOptions() {
  const { currentItinerary } = useFormStore();

  const totalCost = currentItinerary?.budget.spent || 0;
  const remaining = (currentItinerary?.budget.total || 0) - totalCost;

  return (
    <div className="space-y-6">
      {/* Itinerary Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Your Generated Itinerary</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">DESTINATION</p>
            <p className="text-lg font-bold text-gray-900">{currentItinerary?.country}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">DURATION</p>
            <p className="text-lg font-bold text-gray-900">{currentItinerary?.days.length} Days</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">TOTAL BUDGET</p>
            <p className="text-lg font-bold text-gray-900">
              {(currentItinerary?.budget.total || 0).toLocaleString()} {currentItinerary?.budget.currency}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">TOTAL PLANNED SPENDING</p>
            <p className="text-lg font-bold text-gray-900">
              {totalCost.toLocaleString()} {currentItinerary?.budget.currency}
            </p>
          </div>
        </div>

        {/* Budget Status */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Budget Overview</p>
          <div className="w-full bg-gray-300 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (totalCost / (currentItinerary?.budget.total || 1)) * 100)}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Spent: {totalCost.toLocaleString()}</span>
            <span>Remaining: {Math.max(0, remaining).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <div className="text-2xl">✅</div>
        <div>
          <p className="font-semibold text-blue-900 mb-1">Itinerary Generated!</p>
          <p className="text-sm text-blue-800">
            Your AI-generated itinerary is ready. Click "Next" to review your activities day-by-day, customize activities, adjust timing, and export your final itinerary.
          </p>
        </div>
      </div>
    </div>
  );
}
