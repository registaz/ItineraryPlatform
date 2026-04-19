'use client';

import React from 'react';
import { useFormStore } from '@/stores/formStore';
import { ChevronRight, CheckCircle, Circle, RotateCcw } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface WizardLayoutProps {
  steps: Step[];
  currentStepComponent: React.ReactNode;
  onStepClick?: (stepId: number) => void;
}

export default function WizardLayout({ steps, currentStepComponent, onStepClick }: WizardLayoutProps) {
  const { currentStep, nextStep, previousStep, resetForm, isGenerating } = useFormStore();

  const handleStepClick = (stepId: number) => {
    if (onStepClick) {
      onStepClick(stepId);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset everything? This action cannot be undone.')) {
      resetForm();
    }
  };

  const handleNextStep = async () => {
    // If on ReviewItinerary step (step 5) and generation hasn't happened, generate first
    if (currentStep === 5 && (window as any).__generateItinerary) {
      await (window as any).__generateItinerary();
      // Generation complete, now move to next step
      setTimeout(() => nextStep(), 300);
    } else {
      // Otherwise just advance to the next step
      nextStep();
    }
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'upcoming';
  };

  const getProgressPercentage = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto shadow-sm">
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-8 z-10">
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-slate-900">Wanderlust</h1>
              <p className="text-sm text-slate-500 font-medium">Travel Planning Simplified</p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="px-8 py-6 border-b border-slate-200">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Progress</p>
                <p className="text-sm font-bold text-blue-600">{Math.round(getProgressPercentage())}%</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          {/* Steps List */}
          <nav className="px-4 py-4 space-y-1">
            {steps.map((step) => {
              const status = getStepStatus(step.id);
              const isCompleted = status === 'completed';
              const isActive = status === 'active';
              const isUpcoming = status === 'upcoming';

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-blue-50 border border-blue-200'
                      : isCompleted
                      ? 'hover:bg-slate-50 border border-transparent'
                      : 'opacity-50 cursor-not-allowed border border-transparent'
                  }`}
                  disabled={isUpcoming}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                        <CheckCircle className="text-green-600" size={18} />
                      </div>
                    ) : isActive ? (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600">
                        <span className="text-white font-bold text-xs">{step.id}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200">
                        <Circle className="text-slate-400" size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-grow min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                      {step.label}
                    </p>
                    {isCompleted && <p className="text-xs text-green-600 font-medium">Completed</p>}
                    {isActive && <p className="text-xs text-blue-600 font-medium">Current</p>}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Header */}
          <div className="border-b border-slate-200 px-10 py-6 bg-white sticky top-0 z-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {steps.find((s) => s.id === currentStep)?.label}
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500 font-medium">Progress</p>
                <p className="text-3xl font-bold text-blue-600">{Math.round(getProgressPercentage())}%</p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-10 py-8">
              {currentStepComponent}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-slate-200 px-10 py-6 bg-white shadow-lg">
            <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
              <div className="flex gap-3">
                <button
                  onClick={previousStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors duration-200"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors duration-200 border border-red-200"
                  title="Reset entire form"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>

              {/* Step Indicator Dots */}
              <div className="flex justify-center gap-2">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    disabled={step.id > currentStep}
                    className={`rounded-full transition-all duration-300 ${
                      step.id === currentStep
                        ? 'bg-blue-600 w-2.5 h-2.5'
                        : step.id < currentStep
                        ? 'bg-green-600 w-2 h-2'
                        : 'bg-slate-300 w-2 h-2'
                    }`}
                  />
                ))}
              </div>

              {/* Next/Continue Button */}
              {currentStep < steps.length && (
                <button
                  onClick={handleNextStep}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 active:scale-95 ${
                    isGenerating
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      Next →
                    </>
                  )}
                </button>
              )}

              {currentStep === steps.length && (
                <div className="ml-auto px-6 py-2.5 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200">
                  ✅ All Done!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
