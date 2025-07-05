'use client';

import { useState, useEffect, useRef } from 'react';

interface InactivityBlurProps {
  inactivityDelay?: number; // in milliseconds
}

export default function InactivityBlur({ inactivityDelay = 30000 }: InactivityBlurProps) {
  const [isInactive, setIsInactive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const correctPasscode = '2321';

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
    // Only set up event listeners when screen is not locked
    if (isInactive) {
      return;
    }

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
  }, [inactivityDelay, isInactive]);



  const handlePasscodeChange = (value: string) => {
    // Only allow numbers and limit to 4 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setPasscode(numericValue);
    
    // Auto-submit when 4 digits are entered
    if (numericValue.length === 4) {
      setTimeout(() => {
        handlePasscodeSubmitWithValue(numericValue);
      }, 100);
    }
  };

  const handlePasscodeSubmitWithValue = (codeToCheck: string) => {
    if (codeToCheck === correctPasscode) {
      // Correct passcode - unlock screen
      setIsInactive(false);
      setShowWarning(false);
      setPasscode('');
      setError('');
      
      // Restart the timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }

      // Show warning at 7 seconds (3 seconds before blur)
      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(true);
      }, inactivityDelay - 3000);

      // Set inactive after delay
      timeoutRef.current = setTimeout(() => {
        setIsInactive(true);
        setShowWarning(false);
      }, inactivityDelay);
    } else {
      // Incorrect passcode
      setError(`Incorrect passcode`); 
      setIsShaking(true);
      setPasscode('');
      
      // Stop shaking after animation
      setTimeout(() => {
        setIsShaking(false);
        setError('');
      }, 1000);
    }
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
          <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center max-w-md mx-4 transition-all duration-300 ${isShaking ? 'animate-bounce' : ''}`}>
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
              Enter the 4-digit passcode to unlock and continue working.
            </p>
            
            {/* Passcode Input */}
            <div className="mb-4">
              <div className="flex justify-center space-x-2 mb-3">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-bold text-white transition-all duration-200 ${
                      passcode.length > index 
                        ? 'border-purple-400 bg-purple-500/20' 
                        : 'border-white/30 bg-white/10'
                    }`}
                  >
                    {passcode.length > index ? '●' : ''}
                  </div>
                ))}
              </div>
              
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={passcode}
                onChange={(e) => handlePasscodeChange(e.target.value)}
                className="sr-only"
                autoFocus
                placeholder="Enter 4-digit passcode"
              />
              
              {/* Virtual Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((num, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (num === '⌫') {
                        setPasscode(prev => prev.slice(0, -1));
                      } else if (num !== '' && passcode.length < 4) {
                        const newPasscode = passcode + num;
                        handlePasscodeChange(newPasscode);
                      }
                    }}
                    disabled={num === ''}
                    className={`h-12 rounded-lg font-semibold transition-all duration-200 ${
                      num === '' 
                        ? 'invisible' 
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 active:scale-95'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}
            
            <p className="text-xs text-purple-400 mt-4">
              Enter passcode or use the keypad above
            </p>
          </div>
        </div>
      )}
    </>
  );
} 