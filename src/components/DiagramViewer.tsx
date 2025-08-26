'use client';

import { useState } from 'react';

interface DiagramViewerProps {
  svgData: string;
  onEdit?: () => void;
  className?: string;
}

export default function DiagramViewer({ 
  svgData, 
  onEdit, 
  className = '' 
}: DiagramViewerProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Debug logging
  console.log('DiagramViewer svgData length:', svgData?.length || 0);

  if (!svgData || svgData.trim().length === 0) {
    return (
      <div className={`relative group ${className}`}>
        <div className="border border-white/20 rounded-lg overflow-hidden bg-white/5 p-8 text-center">
          <p className="text-purple-200">No diagram data available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="border border-white/20 rounded-lg overflow-hidden bg-white">
        <div 
          dangerouslySetInnerHTML={{ __html: svgData }}
          className="w-full"
        />
      </div>
      
      {onEdit && isHovered && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
          <button
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Diagram
          </button>
        </div>
      )}
    </div>
  );
}
