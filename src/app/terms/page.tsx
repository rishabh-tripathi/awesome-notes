'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';

export default function TermsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse">
            <div className="h-12 bg-white/10 rounded-lg mb-4 mx-auto max-w-md"></div>
            <div className="h-6 bg-white/10 rounded-lg mb-8 mx-auto max-w-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Research Hub</h1>
                <p className="text-purple-200 text-xs">Productivity Suite</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-purple-200 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/todo" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Terms & Conditions
            </h1>
            <p className="text-lg text-purple-200">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Terms Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-purple-200 leading-relaxed">
                By accessing and using Research Hub (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
              <p className="text-purple-200 leading-relaxed mb-4">
                Permission is granted to temporarily use Research Hub for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="text-purple-200 leading-relaxed space-y-2 ml-6">
                <li>• modify or copy the materials</li>
                <li>• use the materials for any commercial purpose or for any public display</li>
                <li>• attempt to reverse engineer any software contained on the website</li>
                <li>• remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Data and Privacy</h2>
              <p className="text-purple-200 leading-relaxed">
                Your privacy is important to us. Research Hub stores your tasks and notes locally in your browser. 
                We do not collect, store, or transmit your personal data to external servers. 
                You retain full ownership and control of your data at all times.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. User Responsibilities</h2>
              <p className="text-purple-200 leading-relaxed mb-4">
                As a user of Research Hub, you agree to:
              </p>
              <ul className="text-purple-200 leading-relaxed space-y-2 ml-6">
                <li>• Use the service in compliance with all applicable laws and regulations</li>
                <li>• Not attempt to compromise the security or functionality of the service</li>
                <li>• Not use the service to store or transmit illegal, harmful, or offensive content</li>
                <li>• Maintain the confidentiality of your account credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Service Availability</h2>
              <p className="text-purple-200 leading-relaxed">
                Research Hub is provided &quot;as is&quot; without any guarantees of availability, reliability, or suitability for any particular purpose. 
                We reserve the right to modify, suspend, or discontinue the service at any time without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
              <p className="text-purple-200 leading-relaxed">
                The Research Hub application, including its design, code, and documentation, is protected by copyright and other intellectual property laws. 
                You may not reproduce, distribute, or create derivative works based on our service without explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Disclaimer</h2>
              <p className="text-purple-200 leading-relaxed">
                The information on this website is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, Research Hub excludes all representations, 
                warranties, conditions and terms whether express or implied, statutory or otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Limitations</h2>
              <p className="text-purple-200 leading-relaxed">
                In no event shall Research Hub or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, 
                or due to business interruption) arising out of the use or inability to use Research Hub, even if we have been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Revisions</h2>
              <p className="text-purple-200 leading-relaxed">
                Research Hub may revise these terms of service at any time without notice. By using this service, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Contact Information</h2>
              <p className="text-purple-200 leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us through our support channels or visit our main website for more information.
              </p>
            </section>

          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link href="/" className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 