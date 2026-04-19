'use client';

import React, { useState } from 'react';
import { useFormStore } from '@/stores/formStore';
import { ChevronDown, ChevronUp, Check, Edit2, X, Save } from 'lucide-react';

export default function ReviewSuggestions() {
  const { currentItinerary, nextStep, previousStep } = useFormStore();
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(0);
  const [expandedActivityIndices, setExpandedActivityIndices] = useState<Set<string>>(new Set());
  const [editingActivity, setEditingActivity] = useState<{ dayIndex: number; activityIndex: number } | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  if (!currentItinerary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No itinerary generated yet. Please generate one first.</p>
      </div>
    );
  }

  const toggleActivityExpanded = (dayIndex: number, activityIndex: number) => {
    const key = `${dayIndex}-${activityIndex}`;
    const newSet = new Set(expandedActivityIndices);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedActivityIndices(newSet);
  };

  const handleSelectSuggestion = (dayIndex: number, activityIndex: number, suggestionIndex: number) => {
    // Update the activity's selected suggestion and populate its fields
    const updatedItinerary = { ...currentItinerary };
    const activity = updatedItinerary.days[dayIndex]?.activities[activityIndex];
    if (activity && activity.suggestions && activity.suggestions[suggestionIndex]) {
      const selectedSuggestion = activity.suggestions[suggestionIndex];
      activity.selectedSuggestionIndex = suggestionIndex;
      // Update activity fields to match selected suggestion
      activity.title = selectedSuggestion.title;
      activity.location = selectedSuggestion.location || activity.location;
      activity.description = selectedSuggestion.description;
      activity.costEstimate = selectedSuggestion.costEstimate;
    }
    useFormStore.setState({ currentItinerary: updatedItinerary });
  };

  const handleEditActivity = (dayIndex: number, activityIndex: number) => {
    const activity = currentItinerary?.days[dayIndex]?.activities[activityIndex];
    if (activity) {
      setEditingActivity({ dayIndex, activityIndex });
      setEditValues({
        title: activity.title,
        location: activity.location,
        description: activity.description,
        startTime: activity.startTime,
        duration: activity.duration,
        costEstimate: activity.costEstimate,
      });
    }
  };

  const handleSaveActivity = () => {
    if (editingActivity && currentItinerary) {
      const updatedItinerary = { ...currentItinerary };
      const activity = updatedItinerary.days[editingActivity.dayIndex]?.activities[editingActivity.activityIndex];
      if (activity) {
        activity.title = editValues.title;
        activity.location = editValues.location;
        activity.description = editValues.description;
        activity.startTime = editValues.startTime;
        activity.duration = parseInt(editValues.duration);
        activity.costEstimate = parseFloat(editValues.costEstimate);
      }
      useFormStore.setState({ currentItinerary: updatedItinerary });
      setEditingActivity(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Activity Suggestions</h2>
        <p className="text-gray-600">
          We've generated alternative suggestions for each activity. Select your preferred options or continue with the defaults.
        </p>
      </div>

      <div className="space-y-4">
        {currentItinerary.days.map((day, dayIndex) => (
          <div key={day.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Day Header */}
            <button
              onClick={() => setExpandedDayIndex(expandedDayIndex === dayIndex ? null : dayIndex)}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 flex items-center justify-between transition-colors"
            >
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  Day {day.dayNumber} - {day.area}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{day.activities.length} activities</span>
                {expandedDayIndex === dayIndex ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </button>

            {/* Day Activities */}
            {expandedDayIndex === dayIndex && (
              <div className="divide-y divide-gray-200 p-6 space-y-4">
                {day.activities.map((activity, activityIndex) => {
                  const isExpanded = expandedActivityIndices.has(`${dayIndex}-${activityIndex}`);
                  const selectedIndex = activity.selectedSuggestionIndex ?? 0;
                  const selectedSuggestion = activity.suggestions?.[selectedIndex];

                  return (
                    <div key={activity.id} className="space-y-2">
                      {/* Edit Mode or View Mode */}
                      {editingActivity?.dayIndex === dayIndex && editingActivity?.activityIndex === activityIndex ? (
                        // Edit Form
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Title</label>
                            <input
                              type="text"
                              value={editValues.title}
                              onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                            <input
                              type="text"
                              value={editValues.location}
                              onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                              value={editValues.description}
                              onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                              <input
                                type="time"
                                value={editValues.startTime}
                                onChange={(e) => setEditValues({ ...editValues, startTime: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (min)</label>
                              <input
                                type="number"
                                value={editValues.duration}
                                onChange={(e) => setEditValues({ ...editValues, duration: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Cost</label>
                              <input
                                type="number"
                                value={editValues.costEstimate}
                                onChange={(e) => setEditValues({ ...editValues, costEstimate: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={handleSaveActivity}
                              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="w-full text-left flex items-start justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{activity.startTime}</span>
                              <span className="text-sm text-gray-500">({activity.duration} min)</span>
                            </div>
                            {selectedSuggestion && (
                              <>
                                <p className="font-medium text-gray-800 mt-1">{selectedSuggestion.title}</p>
                                <p className="text-sm text-gray-600">📍 {selectedSuggestion.location}</p>
                                <p className="text-sm text-gray-600">{selectedSuggestion.costEstimate} {currentItinerary.budget.currency}</p>
                              </>
                            )}
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            <button
                              onClick={() => handleEditActivity(dayIndex, activityIndex)}
                              className="p-2 hover:bg-gray-200 rounded transition-colors text-blue-600 hover:text-blue-700"
                              title="Edit activity details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {activity.suggestions && activity.suggestions.length > 1 && (
                              <button
                                onClick={() => toggleActivityExpanded(dayIndex, activityIndex)}
                                className="p-1"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-600" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Suggestions List */}
                      {isExpanded && activity.suggestions && activity.suggestions.length > 1 && (
                        <div className="ml-4 space-y-2">
                          <p className="text-sm font-semibold text-gray-700">Alternative suggestions:</p>
                          {activity.suggestions.map((suggestion, suggestionIndex) => (
                            <button
                              key={suggestionIndex}
                              onClick={() => handleSelectSuggestion(dayIndex, activityIndex, suggestionIndex)}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                                selectedIndex === suggestionIndex
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{suggestion.title}</p>
                                  <p className="text-sm text-gray-600">📍 {suggestion.location}</p>
                                  <p className="text-sm text-gray-700 mt-1">{suggestion.description}</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-1">{suggestion.costEstimate} {currentItinerary.budget.currency}</p>
                                </div>
                                {selectedIndex === suggestionIndex && (
                                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          💡 <strong>Tip:</strong> Click on any activity to see alternative suggestions. Your selections will be saved when you proceed.
        </p>
      </div>
    </div>
  );
}
