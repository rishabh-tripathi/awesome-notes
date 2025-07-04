'use client';

import { useState, useEffect, useRef } from 'react';

interface InactivityBlurProps {
  inactivityDelay?: number; // in milliseconds
}

export default function InactivityBlur({ inactivityDelay = 10000 }: InactivityBlurProps) {
  const [isInactive, setIsInactive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    // Don't reset timer if screen is currently blurred
    if (isInactive) {
      return;
    }

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Reset states
    setIsInactive(false);
    setShowWarning(false);

    // Show warning at 7 seconds (3 seconds before blur)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
    }, inactivityDelay - 3000);

    // Set inactive after delay
    timeoutRef.current = setTimeout(() => {
      setIsInactive(true);
      setShowWarning(false);
    }, inactivityDelay);
  };

  useEffect(() => {
    // Events to track for user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [inactivityDelay]);

  const handleReactivate = () => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Reset states
    setIsInactive(false);
    setShowWarning(false);

    // Show warning at 7 seconds (3 seconds before blur)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
    }, inactivityDelay - 3000);

    // Set inactive after delay
    timeoutRef.current = setTimeout(() => {
      setIsInactive(true);
      setShowWarning(false);
    }, inactivityDelay);
  };

  return (
    <>
      {/* Warning Message */}
      {showWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg border border-yellow-400/50 animate-pulse">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium">Page will blur in 3 seconds due to inactivity</span>
          </div>
        </div>
      )}

      {/* Blur Overlay */}
      {isInactive && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Screen Locked</h3>
            <p className="text-purple-200 mb-4">
              Your screen has been blurred due to inactivity for security purposes.
            </p>
            <p className="text-sm text-purple-300 mb-6">
              Click the button below to unlock and continue working.
            </p>
            <button
              onClick={handleReactivate}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
            >
              Unlock Screen
            </button>
          </div>
        </div>
      )}
    </>
  );
} 