'use client';

import { useState, useCallback, useEffect } from 'react';
import { Excalidraw, exportToSvg } from '@excalidraw/excalidraw';

interface DiagramEditorProps {
  initialData?: object;
  onSave: (diagramData: object, svgData: string) => void;
  onCancel: () => void;
  isFullscreen?: boolean;
}

export default function DiagramEditor({ 
  initialData, 
  onSave, 
  onCancel, 
  isFullscreen = false 
}: DiagramEditorProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure Excalidraw is fully loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = useCallback(async () => {
    if (!excalidrawAPI) {
      console.warn('Excalidraw API not available');
      return;
    }

    try {
      // Type assertion for API methods
      const api = excalidrawAPI as {
        getSceneElements: () => object[];
        getAppState: () => object;
      };
      
      const elements = api.getSceneElements();
      const appState = api.getAppState();
      
      console.log('Saving diagram with elements:', elements.length);
      
      // Check if there are any elements to save
      if (!elements || elements.length === 0) {
        console.warn('No elements to save');
        // Still save an empty diagram
      }
      
      // Export to SVG for preview
      const svgElement = await exportToSvg({
        elements,
        appState,
        exportPadding: 20,
      });
      
      const svgData = svgElement.outerHTML;
      
      const diagramData = {
        elements,
        appState: {
          ...appState,
          // Remove non-serializable properties
          collaborators: undefined,
          isLoading: false,
        },
        files: {},
      };

      console.log('Diagram saved successfully');
      onSave(diagramData, svgData);
    } catch (error) {
      console.error('Error saving diagram:', error);
      alert('Failed to save diagram. Please try again.');
    }
  }, [excalidrawAPI, onSave]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }
  }, [handleSave, onCancel]);

  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen, handleKeyDown]);

  const containerClass = isFullscreen
    ? 'fixed top-4 left-1/2 transform -translate-x-1/2 w-[95vw] h-[90vh] z-50 bg-white rounded-lg shadow-2xl overflow-hidden'
    : 'w-full h-96 border border-white/20 rounded-lg overflow-hidden';

  return (
    <div className={containerClass}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p>Loading diagram editor...</p>
          </div>
        </div>
      )}
      
      {/* Excalidraw Container with constrained sizing */}
      <div className="excalidraw-wrapper w-full h-full relative">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={initialData || undefined}
          theme="light"
        />
      </div>
        
      {/* Action buttons */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 flex space-x-2 z-50">
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm shadow-lg"
            title="Cancel (Esc)"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-lg"
            title="Save diagram (⌘+S)"
          >
            Save Diagram
          </button>
        </div>
      )}
      
      {isFullscreen && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm z-[9998] pointer-events-none">
          ⌘+S to save • Esc to cancel
        </div>
      )}
    </div>
  );
}
