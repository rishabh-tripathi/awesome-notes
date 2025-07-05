'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-lg text-purple-200">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Privacy Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Overview</h2>
              <p className="text-purple-200 leading-relaxed">
                This Privacy Policy describes how Research Hub collects, uses, and protects your information when you use our productivity application. 
                We are committed to protecting your privacy and ensuring your data remains secure and under your control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Data Collection</h2>
              <p className="text-purple-200 leading-relaxed mb-4">
                Research Hub is designed with privacy in mind. We collect minimal information necessary to provide our services:
              </p>
              <ul className="text-purple-200 leading-relaxed space-y-2 ml-6">
                <li>• <strong>Account Information:</strong> Email address for authentication and account management</li>
                <li>• <strong>Application Data:</strong> Tasks, notes, and settings you create within the app</li>
                <li>• <strong>Usage Analytics:</strong> Basic usage patterns to improve our service (anonymous)</li>
                <li>• <strong>Technical Data:</strong> Device information, browser type, and error logs for debugging</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Local Storage</h2>
              <p className="text-purple-200 leading-relaxed">
                Research Hub prioritizes your privacy by storing your personal data locally in your browser whenever possible. 
                Your tasks, notes, and preferences are stored using browser localStorage, which means they remain on your device 
                and are not transmitted to external servers unless you explicitly choose to sync or export them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Usage</h2>
              <p className="text-purple-200 leading-relaxed mb-4">
                We use your information solely to provide and improve our services:
              </p>
              <ul className="text-purple-200 leading-relaxed space-y-2 ml-6">
                <li>• Authenticate your identity and secure your account</li>
                <li>• Provide personalized productivity features and recommendations</li>
                <li>• Improve our application through anonymous usage analytics</li>
                <li>• Communicate important updates about our service</li>
                <li>• Provide customer support when requested</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing</h2>
              <p className="text-purple-200 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties. Your data may only be shared in these limited circumstances:
              </p>
              <ul className="text-purple-200 leading-relaxed space-y-2 ml-6">
                <li>• With your explicit consent</li>
                <li>• To comply with legal obligations or court orders</li>
                <li>• To protect our rights, property, or safety</li>
                <li>• With trusted service providers who assist in operating our service (under strict confidentiality agreements)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
              <p className="text-purple-200 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. These measures include encryption, secure protocols, regular security assessments, 
                and limited access controls for our team members.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
              <p className="text-purple-200 leading-relaxed">
                We retain your personal information only as long as necessary to provide our services or as required by law. 
                Since most of your data is stored locally, you have direct control over its retention. 
                Account information may be retained for a reasonable period after account deletion to prevent fraud and abuse.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights</h2>
              <p className="text-purple-200 leading-relaxed mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="text-purple-200 leading-relaxed space-y-2 ml-6">
                <li>• <strong>Access:</strong> Request a copy of your personal data</li>
                <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
                <li>• <strong>Deletion:</strong> Request deletion of your personal data</li>
                <li>• <strong>Portability:</strong> Export your data in a readable format</li>
                <li>• <strong>Objection:</strong> Object to processing of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Cookies and Tracking</h2>
              <p className="text-purple-200 leading-relaxed">
                Research Hub uses minimal cookies and tracking technologies, primarily for authentication and maintaining your session. 
                We do not use advertising cookies or third-party tracking services. You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Third-Party Services</h2>
              <p className="text-purple-200 leading-relaxed">
                Our application may integrate with third-party services for authentication (such as Supabase). 
                These services have their own privacy policies, and we encourage you to review them. 
                We only work with providers that maintain high privacy and security standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Children&apos;s Privacy</h2>
              <p className="text-purple-200 leading-relaxed">
                Research Hub is not intended for use by children under the age of 13. 
                We do not knowingly collect personal information from children under 13. 
                If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Changes to Privacy Policy</h2>
              <p className="text-purple-200 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                We will notify you of any material changes by posting the updated policy on our website and updating the effective date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Contact Information</h2>
              <p className="text-purple-200 leading-relaxed">
                If you have any questions about this Privacy Policy, your data, or your rights, please contact us through our support channels. 
                We are committed to addressing your concerns promptly and transparently.
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