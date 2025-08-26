'use client';

import { useState, useCallback } from 'react';
import DiagramViewer from './DiagramViewer';

interface DiagramNoteEditorProps {
  note: {
    id: string;
    title: string;
    content: string;
    textContent?: string;
  };
  onSave: (title: string, textContent: string) => void;
  onCancel: () => void;
  onEditDiagram: () => void;
}

export default function DiagramNoteEditor({ 
  note, 
  onSave, 
  onCancel, 
  onEditDiagram 
}: DiagramNoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [textContent, setTextContent] = useState(note.textContent || '');

  const handleSave = useCallback(() => {
    onSave(title.trim() || 'Untitled Diagram', textContent);
  }, [title, textContent, onSave]);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
            Editing Diagram
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Save Details
          </button>
        </div>
      </div>

      {/* Title Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter diagram title..."
        />
      </div>

      {/* Diagram Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-white">Diagram</label>
          <button
            onClick={onEditDiagram}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
          >
            Edit Diagram
          </button>
        </div>
        <DiagramViewer 
          svgData={note.content}
          className="w-full"
        />
      </div>

      {/* Text Content Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">Additional Notes</label>
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className="w-full h-32 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          placeholder="Add any additional notes or descriptions about this diagram..."
        />
      </div>
    </div>
  );
}
