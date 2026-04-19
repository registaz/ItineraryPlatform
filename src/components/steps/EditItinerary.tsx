'use client';

import React, { useState } from 'react';
import { useFormStore } from '@/stores/formStore';
import { Trash2, Plus, Download, FileJson, FileText } from 'lucide-react';
import { generateId } from '@/utils/helpers';

export default function EditItinerary() {
  const { currentItinerary, previousStep } = useFormStore();
  const [editingActivity, setEditingActivity] = useState<{ dayIndex: number; activityIndex: number } | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [addingActivityDayIndex, setAddingActivityDayIndex] = useState<number | null>(null);
  const [newActivityValues, setNewActivityValues] = useState<any>({
    title: '',
    description: '',
    startTime: '09:00',
    duration: 60,
    costEstimate: 0,
    location: '',
    category: 'other',
  });
  const [isExporting, setIsExporting] = useState<'json' | 'pdf' | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!currentItinerary) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-gray-700">No itinerary data found. Please go back and generate your itinerary first.</p>
          <button
            onClick={previousStep}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleEditActivity = (dayIndex: number, activityIndex: number) => {
    const activity = currentItinerary.days[dayIndex].activities[activityIndex];
    setEditingActivity({ dayIndex, activityIndex });
    setEditValues({
      title: activity.title,
      description: activity.description,
      startTime: activity.startTime,
      duration: activity.duration,
      costEstimate: activity.costEstimate,
      location: activity.location,
    });
  };

  const handleSaveActivity = () => {
    if (editingActivity && currentItinerary) {
      const updatedItinerary = { ...currentItinerary };
      const activity = updatedItinerary.days[editingActivity.dayIndex].activities[editingActivity.activityIndex];
      Object.assign(activity, editValues);
      
      useFormStore.setState({ currentItinerary: updatedItinerary });
      setEditingActivity(null);
    }
  };

  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    if (currentItinerary) {
      const updatedItinerary = { ...currentItinerary };
      updatedItinerary.days[dayIndex].activities.splice(activityIndex, 1);
      useFormStore.setState({ currentItinerary: updatedItinerary });
    }
  };

  const handleAddActivityClick = (dayIndex: number) => {
    setAddingActivityDayIndex(dayIndex);
    setNewActivityValues({
      title: '',
      description: '',
      startTime: currentItinerary?.dayStartTime || '09:00',
      duration: 60,
      costEstimate: 0,
      location: '',
      category: 'other',
    });
  };

  const handleSaveNewActivity = () => {
    if (addingActivityDayIndex !== null && currentItinerary) {
      const updatedItinerary = { ...currentItinerary };
      const newActivity = {
        id: generateId(),
        title: newActivityValues.title || 'New Activity',
        description: newActivityValues.description,
        startTime: newActivityValues.startTime,
        duration: Number(newActivityValues.duration) || 60,
        costEstimate: Number(newActivityValues.costEstimate) || 0,
        location: newActivityValues.location,
        category: newActivityValues.category || 'other',
        customized: true,
      };

      updatedItinerary.days[addingActivityDayIndex].activities.push(newActivity);
      useFormStore.setState({ currentItinerary: updatedItinerary });
      setAddingActivityDayIndex(null);
      setNewActivityValues({
        title: '',
        description: '',
        startTime: '09:00',
        duration: 60,
        costEstimate: 0,
        location: '',
        category: 'other',
      });
    }
  };

  const handleCancelAddActivity = () => {
    setAddingActivityDayIndex(null);
    setNewActivityValues({
      title: '',
      description: '',
      startTime: '09:00',
      duration: 60,
      costEstimate: 0,
      location: '',
      category: 'other',
    });
  };

  const calculateCostByCategory = () => {
    const categoryMap: Record<string, number> = {};
    currentItinerary?.days.forEach((day) => {
      day.activities.forEach((activity) => {
        const category = activity.category || 'other';
        // Get cost from either costEstimate or the selected suggestion
        let cost = activity.costEstimate || 0;
        if (cost === 0 && activity.suggestions && activity.suggestions.length > 0) {
          const selectedIndex = activity.selectedSuggestionIndex ?? 0;
          cost = activity.suggestions[selectedIndex]?.costEstimate || 0;
        }
        categoryMap[category] = (categoryMap[category] || 0) + cost;
      });
    });
    return categoryMap;
  };

  const handleExportJSON = () => {
    if (!currentItinerary) return;

    setIsExporting('json');
    
    const exportData = {
      metadata: {
        title: currentItinerary.title,
        country: currentItinerary.country,
        region: currentItinerary.region,
        dateRange: {
          start: currentItinerary.dateRange.start,
          end: currentItinerary.dateRange.end,
        },
        generatedAt: new Date().toISOString(),
        theme: currentItinerary.theme,
      },
      budget: {
        total: currentItinerary.budget.total,
        currency: currentItinerary.budget.currency,
        spent: currentItinerary.budget.spent,
        byCategory: calculateCostByCategory(),
      },
      days: currentItinerary.days.map((day) => ({
        date: day.date,
        dayNumber: day.dayNumber,
        area: day.area,
        activities: day.activities.map((activity) => ({
          time: activity.startTime,
          duration: activity.duration,
          title: activity.title,
          cost: activity.costEstimate,
          category: activity.category,
          location: activity.location,
          description: activity.description,
        })),
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentItinerary.country.toLowerCase()}-itinerary-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExporting(null);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleExportPDF = async () => {
    if (!currentItinerary) return;

    setIsExporting('pdf');
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentItinerary),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentItinerary.country.toLowerCase()}-itinerary-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(null);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('PDF export error:', error);
      setIsExporting(null);
    }
  };

  const handleSaveItinerary = async () => {
    if (!currentItinerary) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/save-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentItinerary),
      });

      if (!response.ok) {
        throw new Error('Failed to save itinerary');
      }

      const savedItinerary = await response.json();
      // Update the store with the saved itinerary (with new ID if it was created)
      useFormStore.setState({ currentItinerary: savedItinerary });

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5">
        <h3 className="font-bold text-slate-900 mb-1.5 flex items-center gap-2">📝 Edit Your Itinerary</h3>
        <p className="text-sm text-slate-700">Customize activities, times, and costs for your perfect trip.</p>
      </div>

      {/* Days and Activities */}
      <div className="space-y-4">
        {currentItinerary.days.map((day, dayIndex) => (
          <div key={dayIndex} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            {/* Day Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 border-b">
              <h4 className="font-bold text-white">
                Day {day.dayNumber} - {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h4>
              {day.area && <p className="text-sm text-blue-50 mt-1.5 font-medium">📍 {day.area}</p>}
            </div>

            {/* Activities */}
            <div className="space-y-3 p-6 bg-slate-50">
              {day.activities.length === 0 ? (
                <p className="text-sm text-slate-600 italic py-4">No activities scheduled for this day</p>
              ) : (
                day.activities
                  .map((activity, idx) => ({ activity, originalIndex: idx }))
                  .sort((a, b) => a.activity.startTime.localeCompare(b.activity.startTime))
                  .map(({ activity, originalIndex: activityIndex }, displayIndex) => (
                  <div key={activityIndex} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200">
                    {editingActivity?.dayIndex === dayIndex && editingActivity?.activityIndex === activityIndex ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Activity Title</label>
                          <input
                            type="text"
                            value={editValues.title}
                            onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                          <textarea
                            value={editValues.description}
                            onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                            <input
                              type="time"
                              value={editValues.startTime}
                              onChange={(e) => setEditValues({ ...editValues, startTime: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (min)</label>
                            <input
                              type="number"
                              value={editValues.duration}
                              onChange={(e) => setEditValues({ ...editValues, duration: parseInt(e.target.value) })}
                              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Cost ({currentItinerary.budget.currency})</label>
                            <input
                              type="number"
                              value={editValues.costEstimate}
                              onChange={(e) => setEditValues({ ...editValues, costEstimate: parseFloat(e.target.value) })}
                              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={editValues.location}
                            onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleSaveActivity}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200 text-sm"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingActivity(null)}
                            className="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-300 active:scale-95 transition-all duration-200 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-slate-900 text-base mb-1">{activity.title}</h5>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <span>🕐</span>
                              <span>{activity.startTime}</span>
                              <span>•</span>
                              <span>{Math.round(activity.duration)} min</span>
                            </p>
                          </div>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap flex-shrink-0">
                            {activity.category}
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">{activity.description}</p>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 flex items-center gap-1">
                              <span>📍</span>
                              <span>{activity.location}</span>
                            </span>
                            <span className="font-semibold text-slate-900">${activity.costEstimate}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditActivity(dayIndex, activityIndex)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 active:scale-95 transition-all duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(dayIndex, activityIndex)}
                              className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 active:scale-95 transition-all duration-200"
                              title="Delete activity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Add Activity Button and Form */}
              {addingActivityDayIndex === dayIndex ? (
                // Add Activity Form
                <div className="border-2 border-blue-300 rounded-lg p-5 bg-blue-50 space-y-4">
                  <h5 className="font-semibold text-slate-900 text-base">Add New Activity</h5>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Activity Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., Museum Visit"
                      value={newActivityValues.title}
                      onChange={(e) => setNewActivityValues({ ...newActivityValues, title: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                      placeholder="What will you do? What should you know?"
                      value={newActivityValues.description}
                      onChange={(e) => setNewActivityValues({ ...newActivityValues, description: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={newActivityValues.startTime}
                        onChange={(e) => setNewActivityValues({ ...newActivityValues, startTime: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (min)</label>
                      <input
                        type="number"
                        min="15"
                        step="15"
                        value={newActivityValues.duration}
                        onChange={(e) => setNewActivityValues({ ...newActivityValues, duration: parseInt(e.target.value) })}
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Cost ({currentItinerary.budget.currency})</label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={newActivityValues.costEstimate}
                        onChange={(e) => setNewActivityValues({ ...newActivityValues, costEstimate: parseFloat(e.target.value) })}
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                      <input
                        type="text"
                        placeholder="City, neighborhood"
                        value={newActivityValues.location}
                        onChange={(e) => setNewActivityValues({ ...newActivityValues, location: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                      <select
                        value={newActivityValues.category}
                        onChange={(e) => setNewActivityValues({ ...newActivityValues, category: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="attraction">Attraction</option>
                        <option value="dining">Dining</option>
                        <option value="activity">Activity</option>
                        <option value="shopping">Shopping</option>
                        <option value="transport">Transport</option>
                        <option value="local food">Local Food</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveNewActivity}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200 text-sm"
                    >
                      Add Activity
                    </button>
                    <button
                      onClick={handleCancelAddActivity}
                      className="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-300 active:scale-95 transition-all duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleAddActivityClick(dayIndex)}
                  className="w-full border-2 border-dashed border-blue-300 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Activity
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Budget Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5">
        <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Total Planned Spending</p>
        <p className="text-3xl font-bold text-blue-600 mb-3">
          ${currentItinerary.budget.spent} / ${currentItinerary.budget.total}
          <span className="text-lg text-slate-600 font-normal ml-1">{currentItinerary.budget.currency}</span>
        </p>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${(currentItinerary.budget.spent / currentItinerary.budget.total) * 100}%` }}
          />
        </div>
        <p className="text-sm text-slate-700 font-medium">
          💰 Remaining: <span className="font-bold text-blue-600">${currentItinerary.budget.total - currentItinerary.budget.spent}</span> {currentItinerary.budget.currency}
        </p>
      </div>

      {/* Success Message */}
      {exportSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-green-900">Successfully Exported!</p>
            <p className="text-sm text-green-800">Your itinerary has been downloaded.</p>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-2xl">💾</span>
          <div>
            <p className="font-semibold text-green-900">Successfully Saved!</p>
            <p className="text-sm text-green-800">Your itinerary has been saved to your library.</p>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="space-y-5">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Download size={20} className="text-blue-600" /> Download Your Itinerary</h3>

        {/* Save to Library */}
        <button
          onClick={handleSaveItinerary}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg p-5 flex items-center gap-4 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          <div className="text-2xl">💾</div>
          <div className="text-left flex-1">
            <p className="font-semibold text-base">
              {isSaving ? 'Saving to Library...' : 'Save to My Library'}
            </p>
            <p className="text-sm text-indigo-50 mt-0.5">
              Store your itinerary for future reference
            </p>
          </div>
        </button>

        {/* JSON Export */}
        <button
          onClick={handleExportJSON}
          disabled={isExporting === 'json'}
          className="w-full bg-white border-2 border-blue-200 hover:border-blue-400 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-5 flex items-center gap-4 transition-all duration-200"
        >
          <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0">
            <FileJson className="text-blue-600" size={28} />
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-slate-900 text-base">
              {isExporting === 'json' ? 'Exporting JSON...' : 'Export as JSON'}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Structured JSON file for easy sharing and portability
            </p>
          </div>
          {isExporting !== 'json' && (
            <Download className="text-blue-600 flex-shrink-0" size={20} />
          )}
        </button>

        {/* PDF Export */}
        <button
          onClick={handleExportPDF}
          disabled={isExporting === 'pdf'}
          className="w-full bg-white border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-5 flex items-center gap-4 transition-all duration-200"
        >
          <div className="bg-cyan-100 rounded-lg p-3 flex-shrink-0">
            <FileText className="text-cyan-600" size={28} />
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-slate-900 text-base">
              {isExporting === 'pdf' ? 'Generating PDF...' : 'Export as PDF'}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Beautiful, printable PDF ready to take on your trip
            </p>
          </div>
          {isExporting !== 'pdf' && (
            <Download className="text-red-600" size={24} />
          )}
        </button>
      </div>
    </div>
  );
}
