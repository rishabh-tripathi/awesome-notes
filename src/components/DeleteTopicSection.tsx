'use client';

import { useState } from 'react';
import { NoteList } from '@/types';

interface DeleteTopicSectionProps {
  selectedList: NoteList | undefined;
  onDeleteTopic: (listId: string) => void;
}

export default function DeleteTopicSection({ selectedList, onDeleteTopic }: DeleteTopicSectionProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!selectedList) {
    return null;
  }

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDeleteTopic(selectedList.id);
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium text-gray-400">Danger Zone:</span>
            <span className="text-xs text-gray-300/80">
              Delete &quot;{selectedList.name}&quot; and all {selectedList.notes.length} notes permanently
            </span>
          </div>
          <button
            onClick={handleDeleteClick}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Topic</h3>
                <p className="text-sm text-purple-200">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-white mb-2">
                Are you sure you want to delete &quot;{selectedList.name}&quot;?
              </p>
              <p className="text-sm text-purple-200">
                This will permanently delete all {selectedList.notes.length} notes in this topic.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Delete Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 