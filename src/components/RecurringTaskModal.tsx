'use client';

import { useState } from 'react';

interface RecurringTaskModalProps {
  isOpen: boolean;
  taskText: string;
  onClose: () => void;
  onConfirm: (frequency: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
}

export default function RecurringTaskModal({ 
  isOpen, 
  taskText, 
  onClose, 
  onConfirm 
}: RecurringTaskModalProps) {
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  const frequencies = [
    {
      value: 'daily' as const,
      label: 'Daily',
      description: 'Repeats every day',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      value: 'weekly' as const,
      label: 'Weekly',
      description: 'Repeats every week',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      value: 'monthly' as const,
      label: 'Monthly',
      description: 'Repeats every month',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      value: 'yearly' as const,
      label: 'Yearly',
      description: 'Repeats every year',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ];

  const handleConfirm = () => {
    onConfirm(selectedFrequency);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Set Recurring Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Task Preview */}
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Task: {taskText}</p>
              <p className="text-purple-300 text-sm">This task will repeat automatically</p>
            </div>
          </div>
        </div>

        {/* Frequency Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Choose Frequency</h3>
          <div className="space-y-3">
            {frequencies.map((frequency) => (
              <button
                key={frequency.value}
                onClick={() => setSelectedFrequency(frequency.value)}
                className={`w-full p-4 rounded-xl border transition-all duration-200 ${
                  selectedFrequency === frequency.value
                    ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-400/50 text-white'
                    : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    selectedFrequency === frequency.value 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/10 text-purple-300'
                  }`}>
                    {frequency.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{frequency.label}</div>
                    <div className="text-sm opacity-80">{frequency.description}</div>
                  </div>
                  {selectedFrequency === frequency.value && (
                    <div className="ml-auto">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-300 text-sm font-medium">How it works</p>
              <p className="text-blue-200 text-xs mt-1">
                When you complete this task, a new instance will automatically be created 
                based on your selected frequency. You can always edit or stop the recurring pattern later.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
          >
            Create Recurring Task
          </button>
        </div>
      </div>
    </div>
  );
} 