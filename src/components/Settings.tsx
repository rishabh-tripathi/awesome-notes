'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { NoteList } from '@/types';
import LocalFileSyncControl from './LocalFileSyncControl';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  noteLists: NoteList[];
}

export default function Settings({ isOpen, onClose, noteLists }: SettingsProps) {
  const [inactivityPasscode, setInactivityPasscode] = useLocalStorage<string>('inactivityPasscode', '1234');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passcode
    if (newPasscode.length !== 4) {
      setError('Passcode must be exactly 4 digits');
      return;
    }

    if (!/^\d{4}$/.test(newPasscode)) {
      setError('Passcode must contain only numbers');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setError('Passcodes do not match');
      return;
    }

    // Update the passcode
    setInactivityPasscode(newPasscode);
    setSuccess('Inactivity passcode updated successfully!');
    setNewPasscode('');
    setConfirmPasscode('');

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const handleReset = () => {
    setNewPasscode('');
    setConfirmPasscode('');
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current Passcode Display */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Current Inactivity Passcode</h3>
          <div className="flex space-x-2">
            {inactivityPasscode.split('').map((digit, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-xl font-bold text-white"
              >
                {digit}
              </div>
            ))}
          </div>
          <p className="text-sm text-purple-300 mt-2">
            This passcode is used to unlock your screen after inactivity
          </p>
        </div>

        {/* Change Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPasscode" className="block text-sm font-medium text-purple-200 mb-2">
              New Passcode
            </label>
            <input
              id="newPasscode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-center text-lg font-mono"
              placeholder="Enter 4-digit passcode"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPasscode" className="block text-sm font-medium text-purple-200 mb-2">
              Confirm New Passcode
            </label>
            <input
              id="confirmPasscode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-center text-lg font-mono"
              placeholder="Confirm 4-digit passcode"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-300 text-sm">{success}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-colors duration-200 font-medium"
            >
              Reset
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
            >
              Update Passcode
            </button>
          </div>
        </form>

        {/* Local File Sync Section */}
        <div className="mt-8">
          <LocalFileSyncControl noteLists={noteLists} />
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-300 text-sm font-medium">Security Notice</p>
              <p className="text-blue-200 text-xs mt-1">
                Your new passcode will be saved locally and included in data exports. 
                Make sure to remember your new passcode as it&apos;s required to unlock your screen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 