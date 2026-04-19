'use client';

import React, { useState, useEffect } from 'react';
import { useFormStore } from '@/stores/formStore';
import { Trash2, Download, Eye, Loader } from 'lucide-react';
import { Itinerary } from '@/types';

export default function SavedItineraries() {
  const { setCurrentItinerary, setCurrentStep } = useFormStore();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/save-itinerary');
      if (!response.ok) throw new Error('Failed to fetch itineraries');

      const data = await response.json();
      // Convert database format to app format
      const formatted = data.map((item: any) => convertFromDB(item));
      setItineraries(formatted);
    } catch (err) {
      setError('Failed to load your saved itineraries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const convertFromDB = (item: any): Itinerary => {
    return {
      id: item.id,
      title: item.title,
      country: item.country,
      region: item.region || '',
      dateRange: {
        start: new Date(item.startDate).toISOString().split('T')[0],
        end: new Date(item.endDate).toISOString().split('T')[0],
      },
      budget: {
        total: item.budget,
        currency: item.currency,
        spent: item.spentAmount,
      },
      theme: item.theme,
      dayStartTime: item.dayStartTime,
      flight: {
        origin: '',
        arrivalTime: '12:00',
        departureTime: '18:00',
      },
      days: (item.days || []).map((day: any) => ({
        id: day.id,
        date: new Date(day.date).toISOString().split('T')[0],
        dayNumber: day.dayNumber,
        area: day.area,
        activities: (day.activities || []).map((activity: any) => ({
          id: activity.id,
          title: activity.title,
          startTime: activity.startTime,
          duration: activity.duration,
          location: activity.location,
          description: activity.description,
          costEstimate: activity.costEstimate,
          category: activity.category as any,
          customized: activity.customized,
          notes: activity.notes,
        })),
        totalCost: day.activities?.reduce((sum: number, a: any) => sum + a.costEstimate, 0) || 0,
      })),
      metadata: {
        createdAt: new Date(item.createdAt).toISOString(),
        updatedAt: new Date(item.updatedAt).toISOString(),
        aiGenerated: item.aiGenerated,
      },
    };
  };

  const handleLoadItinerary = (itinerary: Itinerary) => {
    setCurrentItinerary(itinerary);
    setCurrentStep(6); // Go to EditItinerary step
  };

  const handleDeleteItinerary = async (id: string) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/save-itinerary/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete itinerary');

      setItineraries(itineraries.filter(it => it.id !== id));
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (err) {
      setError('Failed to delete itinerary');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleExportJSON = (itinerary: Itinerary) => {
    const exportData = {
      metadata: {
        title: itinerary.title,
        country: itinerary.country,
        region: itinerary.region,
        dateRange: {
          start: itinerary.dateRange.start,
          end: itinerary.dateRange.end,
        },
        generatedAt: new Date().toISOString(),
        theme: itinerary.theme,
      },
      budget: {
        total: itinerary.budget.total,
        currency: itinerary.budget.currency,
        spent: itinerary.budget.spent,
      },
      days: itinerary.days.map((day) => ({
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
    link.download = `${itinerary.country.toLowerCase()}-itinerary-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-slate-600">Loading your itineraries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5">
        <h3 className="font-bold text-slate-900 mb-1.5 flex items-center gap-2 text-xl">📚 My Saved Itineraries</h3>
        <p className="text-sm text-slate-700">View, load, or delete your travel plans</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {deleteSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <p className="font-semibold text-green-900">Itinerary deleted successfully</p>
        </div>
      )}

      {itineraries.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600 mb-4">No saved itineraries yet</p>
          <p className="text-sm text-slate-500">Create and save an itinerary to see it here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {itineraries.map((itinerary) => (
            <div key={itinerary.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-lg">{itinerary.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    📍 {itinerary.country}
                    {itinerary.region && ` • ${itinerary.region}`}
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">
                  {itinerary.theme}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-y border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Duration</p>
                  <p className="font-semibold text-slate-900 mt-1">{itinerary.days.length} days</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Budget</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    ${itinerary.budget.total} {itinerary.budget.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Spent</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    ${itinerary.budget.spent} {itinerary.budget.currency}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                {new Date(itinerary.dateRange.start).toLocaleDateString()} - {new Date(itinerary.dateRange.end).toLocaleDateString()}
              </p>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleLoadItinerary(itinerary)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Eye size={16} />
                  Load & Edit
                </button>
                <button
                  onClick={() => handleExportJSON(itinerary)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-200 active:scale-95 transition-all"
                >
                  <Download size={16} />
                  Export JSON
                </button>
                <button
                  onClick={() => handleDeleteItinerary(itinerary.id)}
                  disabled={deleting === itinerary.id}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  {deleting === itinerary.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
