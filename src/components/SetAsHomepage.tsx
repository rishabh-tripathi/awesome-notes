'use client';

import { useState } from 'react';

export default function SetAsHomepage() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chrome');

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';

  const browserInstructions = {
    chrome: {
      name: 'Google Chrome',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      steps: [
        'Open Chrome and click the three dots (⋮) in the top right',
        'Select "Settings" from the dropdown menu',
        'In the "On startup" section, select "Open a specific page or set of pages"',
        'Click "Add a new page" and enter: ' + currentUrl,
        'For New Tab: Install the "New Tab Redirect" extension from Chrome Web Store',
        'Set the redirect URL to: ' + currentUrl
      ]
    },
    firefox: {
      name: 'Mozilla Firefox',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      steps: [
        'Open Firefox and click the three lines (≡) in the top right',
        'Select "Settings" from the menu',
        'In the "Home" section, set "Homepage and new windows" to "Custom URLs"',
        'Enter: ' + currentUrl,
        'For New Tab: Set "New tabs" to "Homepage"'
      ]
    },
    safari: {
      name: 'Safari',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      steps: [
        'Open Safari and click "Safari" in the menu bar',
        'Select "Settings..." from the dropdown',
        'In the "General" tab, set "Homepage" to: ' + currentUrl,
        'Set "New windows open with" to "Homepage"',
        'Set "New tabs open with" to "Homepage"'
      ]
    },
    edge: {
      name: 'Microsoft Edge',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      steps: [
        'Open Edge and click the three dots (...) in the top right',
        'Select "Settings" from the menu',
        'In the "Start, home, and new tabs" section',
        'Set "When Edge starts" to "Open a specific page or pages"',
        'Click "Add a new page" and enter: ' + currentUrl,
        'Set "New tab page" to "A specific page" and enter the same URL'
      ]
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const installPWA = () => {
    // Trigger the PWA install prompt
    const event = new CustomEvent('pwa-install-prompt');
    window.dispatchEvent(event);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 z-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
        <span className="hidden sm:block">Set as Homepage</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Set as Homepage</h2>
            <p className="text-purple-200">Make Research Hub your default browser page</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-3">📱 Install as App</h3>
            <p className="text-purple-200 mb-4">
              Install Research Hub as a Progressive Web App for the best experience
            </p>
            <button
              onClick={installPWA}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              Install App
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-3">🔗 Copy URL</h3>
            <p className="text-purple-200 mb-4">
              Copy the URL to paste in your browser settings
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={currentUrl}
                readOnly
                className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 text-sm"
              />
              <button
                onClick={() => copyToClipboard(currentUrl)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Browser Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 p-1 rounded-lg">
            {Object.entries(browserInstructions).map(([key, browser]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all ${
                  activeTab === key
                    ? 'bg-white/20 text-white'
                    : 'text-purple-200 hover:bg-white/10'
                }`}
              >
                {browser.icon}
                <span className="hidden sm:block">{browser.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">
            {browserInstructions[activeTab as keyof typeof browserInstructions].name} Instructions
          </h3>
          <div className="space-y-3">
            {browserInstructions[activeTab as keyof typeof browserInstructions].steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-purple-200 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Tips */}
        <div className="mt-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-lg font-bold text-white mb-3">💡 Pro Tips</h3>
          <ul className="space-y-2 text-purple-200">
            <li>• Bookmark this page for easy access</li>
            <li>• Use Ctrl+D (Cmd+D on Mac) to bookmark quickly</li>
            <li>• Consider installing as a PWA for app-like experience</li>
            <li>• Pin the tab for quick access during your workflow</li>
          </ul>
        </div>

        {/* Close Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsOpen(false)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
} 