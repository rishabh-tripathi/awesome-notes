'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { TodoList, NoteList } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ExportData {
  todoLists: TodoList[];
  noteLists: NoteList[];
  exportDate: string;
  version: string;
}

export default function Footer() {
  const [todoLists, setTodoLists] = useLocalStorage<TodoList[]>('todoLists', []);
  const [noteLists, setNoteLists] = useLocalStorage<NoteList[]>('noteLists', []);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportData = (importedData: { todoLists?: TodoList[]; noteLists?: NoteList[] }) => {
    if (importedData.todoLists) {
      setTodoLists(importedData.todoLists);
    }
    if (importedData.noteLists) {
      setNoteLists(importedData.noteLists);
    }
  };

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
        
        if (!jsonData || typeof jsonData !== 'object') {
          throw new Error('Invalid JSON format');
        }

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

        if (jsonData.todoLists && Array.isArray(jsonData.todoLists)) {
          importData.todoLists = convertDates(jsonData.todoLists) as TodoList[];
        }
        
        if (jsonData.noteLists && Array.isArray(jsonData.noteLists)) {
          importData.noteLists = convertDates(jsonData.noteLists) as NoteList[];
        }

        if (jsonData.type === 'todos' && jsonData.todoLists) {
          importData.todoLists = convertDates(jsonData.todoLists) as TodoList[];
        }
        
        if (jsonData.type === 'notes' && jsonData.noteLists) {
          importData.noteLists = convertDates(jsonData.noteLists) as NoteList[];
        }

        if (!importData.todoLists && !importData.noteLists) {
          throw new Error('No valid data found in the import file');
        }

        handleImportData(importData);
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

  const handleSignOut = () => {
    localStorage.removeItem('research-app-authenticated');
    window.location.reload(); // Force page reload to trigger auth check
  };

  return (
    <>
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

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />
          <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-white/10 z-40">
              <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-6 relative z-20">
              <Link 
                href="/" 
                className="text-xs text-purple-300 hover:text-white transition-colors duration-200 flex items-center space-x-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </Link>
              
              <Link 
                href="/notes" 
                className="text-xs text-purple-300 hover:text-white transition-colors duration-200 flex items-center space-x-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Notes</span>
              </Link>
              
              <Link 
                href="/todo" 
                className="text-xs text-purple-300 hover:text-white transition-colors duration-200 flex items-center space-x-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Todo</span>
              </Link>
            </nav>

            {/* Center section with copyright and data export */}
            <div className="flex items-center space-x-4">
              <div className="text-xs text-purple-400/80">
                © {new Date().getFullYear()} Research Hub. All rights reserved.
              </div>
              
              {/* Data Import/Export */}
              <div className="relative z-20">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-1 text-xs text-purple-300 hover:text-white transition-colors duration-200"
                  title="Import/Export Data"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Data</span>
                  <svg className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 z-30">
                    <div className="p-2">
                                              <div className="text-xs font-semibold text-white px-2 py-1 border-b border-white/20">
                        Export Data
                      </div>
                      
                      <button
                        onClick={downloadData}
                        className="w-full text-left px-2 py-1 text-xs text-white hover:bg-white/10 rounded flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export All</span>
                      </button>
                      
                      <button
                        onClick={downloadTodoData}
                        className="w-full text-left px-2 py-1 text-xs text-white hover:bg-white/10 rounded flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span>Todos Only</span>
                      </button>
                      
                      <button
                        onClick={downloadNotesData}
                        className="w-full text-left px-2 py-1 text-xs text-white hover:bg-white/10 rounded flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Notes Only</span>
                      </button>

                      <div className="text-xs font-semibold text-white px-2 py-1 border-b border-t border-white/20 mt-1">
                        Import Data
                      </div>
                      
                      <button
                        onClick={triggerFileUpload}
                        disabled={isImporting}
                        className="w-full text-left px-2 py-1 text-xs text-white hover:bg-white/10 rounded flex items-center space-x-1 disabled:opacity-50"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>{isImporting ? 'Importing...' : 'Import Data'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Click outside to close dropdown */}
                {showDropdown && (
                  <div
                    className="fixed inset-0"
                    style={{ zIndex: 5 }}
                    onClick={() => setShowDropdown(false)}
                  />
                )}
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-xs text-purple-300 hover:text-white transition-colors duration-200"
                title="Sign Out"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
} 