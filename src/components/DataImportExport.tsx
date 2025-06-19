'use client';

import { useState, useRef } from 'react';
import { TodoList, NoteList } from '@/types';

interface DataImportExportProps {
  todoLists: TodoList[];
  noteLists: NoteList[];
  onImportData: (data: { todoLists?: TodoList[]; noteLists?: NoteList[] }) => void;
  className?: string;
}

interface ExportData {
  todoLists: TodoList[];
  noteLists: NoteList[];
  exportDate: string;
  version: string;
}

export default function DataImportExport({ 
  todoLists, 
  noteLists, 
  onImportData, 
  className = '' 
}: DataImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadData = () => {
    const exportData: ExportData = {
      todoLists,
      noteLists,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowDropdown(false);
    setImportStatus('Data exported successfully!');
    setTimeout(() => setImportStatus(null), 3000);
  };

  const downloadTodoData = () => {
    const exportData = {
      todoLists,
      exportDate: new Date().toISOString(),
      version: '1.0',
      type: 'todos'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-app-todos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowDropdown(false);
    setImportStatus('Todo data exported successfully!');
    setTimeout(() => setImportStatus(null), 3000);
  };

  const downloadNotesData = () => {
    const exportData = {
      noteLists,
      exportDate: new Date().toISOString(),
      version: '1.0',
      type: 'notes'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-app-notes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowDropdown(false);
    setImportStatus('Notes data exported successfully!');
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate the imported data structure
        if (!jsonData || typeof jsonData !== 'object') {
          throw new Error('Invalid JSON format');
        }

        // Convert date strings back to Date objects
        const convertDates = (obj: unknown): unknown => {
          if (obj && typeof obj === 'object') {
            if (Array.isArray(obj)) {
              return obj.map(convertDates);
            }
            
            const converted = { ...obj as Record<string, unknown> };
            if (converted.createdAt && typeof converted.createdAt === 'string') {
              converted.createdAt = new Date(converted.createdAt);
            }
            if (converted.updatedAt && typeof converted.updatedAt === 'string') {
              converted.updatedAt = new Date(converted.updatedAt);
            }
            
            // Handle nested objects
            Object.keys(converted).forEach(key => {
              if (typeof converted[key] === 'object') {
                converted[key] = convertDates(converted[key]);
              }
            });
            
            return converted;
          }
          return obj;
        };

        const importData: { todoLists?: TodoList[]; noteLists?: NoteList[] } = {};

        // Handle different export formats
        if (jsonData.todoLists && Array.isArray(jsonData.todoLists)) {
          importData.todoLists = convertDates(jsonData.todoLists) as TodoList[];
        }
        
        if (jsonData.noteLists && Array.isArray(jsonData.noteLists)) {
          importData.noteLists = convertDates(jsonData.noteLists) as NoteList[];
        }

        // Handle single-type exports
        if (jsonData.type === 'todos' && jsonData.todoLists) {
          importData.todoLists = convertDates(jsonData.todoLists) as TodoList[];
        }
        
        if (jsonData.type === 'notes' && jsonData.noteLists) {
          importData.noteLists = convertDates(jsonData.noteLists) as NoteList[];
        }

        // Validate that we have some data to import
        if (!importData.todoLists && !importData.noteLists) {
          throw new Error('No valid data found in the import file');
        }

        onImportData(importData);
        setImportStatus(`Successfully imported ${
          importData.todoLists ? `${importData.todoLists.length} todo lists` : ''
        }${
          importData.todoLists && importData.noteLists ? ' and ' : ''
        }${
          importData.noteLists ? `${importData.noteLists.length} note lists` : ''
        }!`);
        
        setTimeout(() => setImportStatus(null), 5000);
      } catch (error) {
        console.error('Import error:', error);
        setImportStatus(`Import failed: ${error instanceof Error ? error.message : 'Invalid file format'}`);
        setTimeout(() => setImportStatus(null), 5000);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setImportStatus('Failed to read file');
      setIsImporting(false);
      setTimeout(() => setImportStatus(null), 3000);
    };

    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Status Message */}
      {importStatus && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          importStatus.includes('failed') || importStatus.includes('Failed')
            ? 'bg-red-500 text-white'
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {importStatus.includes('failed') || importStatus.includes('Failed') ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span>{importStatus}</span>
          </div>
        </div>
      )}

      {/* Main Button */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          title="Import/Export Data"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-xs">Data</span>
          <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            <div className="p-2">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                Export Data
              </div>
              
              <button
                onClick={downloadData}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export All Data</span>
              </button>
              
              <button
                onClick={downloadTodoData}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Export Todos Only</span>
              </button>
              
              <button
                onClick={downloadNotesData}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Notes Only</span>
              </button>

              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3 py-2 border-b border-t border-gray-200 dark:border-gray-700 mt-2">
                Import Data
              </div>
              
              <button
                onClick={triggerFileUpload}
                disabled={isImporting}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>{isImporting ? 'Importing...' : 'Import Data'}</span>
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 mt-1">
                Import JSON files exported from this app
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
} 