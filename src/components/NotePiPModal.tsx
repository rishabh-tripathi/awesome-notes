'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Note } from '@/types';

interface NotePiPModalProps {
  note: Note | null;
  onClose: () => void;
  onContentChange?: (noteId: string, content: string) => void;
  isEditable?: boolean;
}

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: {
        width?: number;
        height?: number;
        disallowReturnToOpener?: boolean;
      }) => Promise<Window>;
    };
  }
}

export default function NotePiPModal({ note, onClose, onContentChange, isEditable = false }: NotePiPModalProps) {
  const [noteContent, setNoteContent] = useState('');
  const fallbackModalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local content when note changes
  useEffect(() => {
    if (note) {
      setNoteContent(note.content);
    }
  }, [note]);

  // Close modal
  const closePiP = useCallback(() => {
    onClose();
  }, [onClose]);

    // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePiP();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closePiP]);

  // Always show fallback modal when this component is rendered
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div 
        ref={fallbackModalRef}
        className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-2xl border border-white/20 max-w-md w-full mx-4 max-h-[80vh] flex flex-direction-column"
        style={{
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex-1 overflow-hidden">
          {isEditable ? (
            <textarea
              ref={textareaRef}
              value={noteContent}
              onChange={(e) => {
                setNoteContent(e.target.value);
                if (onContentChange && note) {
                  onContentChange(note.id, e.target.value);
                }
              }}
              className="w-full h-96 p-4 bg-white/5 backdrop-blur-sm border-none text-white placeholder-purple-200 focus:outline-none font-mono text-sm resize-none"
              placeholder="Start writing..."
            />
          ) : (
            <div className="p-4 text-white whitespace-pre-wrap font-mono text-sm h-96 overflow-y-auto">
              {noteContent || 'This note is empty.'}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-white/20 text-xs text-purple-300 flex justify-between items-center">
          <span className={`px-2 py-1 rounded-full ${isEditable ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
            {isEditable ? 'Edit Mode' : 'Read Mode'}
          </span>
          <span>Floating Note (Fallback)</span>
        </div>
      </div>
    </div>
  );
} 