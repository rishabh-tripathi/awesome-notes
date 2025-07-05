'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { NoteList, Note } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ClientOnly from '@/components/ClientOnly';
import Footer from '@/components/Footer';
import DeleteTopicSection from '@/components/DeleteTopicSection';

export default function NotesPage() {
  const [noteLists, setNoteLists] = useLocalStorage<NoteList[]>('noteLists', []);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [mounted, setMounted] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [dragStarted, setDragStarted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle client-side initialization to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (noteLists.length > 0 && !selectedListId) {
      setSelectedListId(noteLists[0].id);
    }
  }, [noteLists, selectedListId]);

  // Auto-save functionality
  const autoSave = useCallback((noteId: string, title: string, content: string) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      if (selectedListId) {
        setNoteLists(noteLists.map(list => 
          list.id === selectedListId 
            ? {
                ...list,
                notes: list.notes.map(note =>
                  note.id === noteId 
                    ? { ...note, title, content, updatedAt: new Date() }
                    : note
                ),
                updatedAt: new Date()
              }
            : list
        ));
        setLastSaved(new Date());
      }
    }, 1000); // Auto-save after 1 second of inactivity

    setAutoSaveTimeout(timeout);
  }, [selectedListId, noteLists, setNoteLists, autoSaveTimeout]);

  // Update word and character count
  useEffect(() => {
    if (editingNote) {
      const words = editingNote.content.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharCount(editingNote.content.length);
    }
  }, [editingNote]);

  // Auto-focus textarea when editing a new note
  useEffect(() => {
    if (editingNote && textareaRef.current) {
      // Focus the textarea when a new note is created
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [editingNote]);

  const selectedList = noteLists.find(list => list.id === selectedListId);
  const selectedNote = selectedList?.notes.find(note => note.id === selectedNoteId);

  // Recently edited notes (last 5)
  const recentNotes = useMemo(() => {
    const allNotes = noteLists.flatMap(list => 
      list.notes.map(note => ({ ...note, listId: list.id, listName: list.name }))
    );
    return allNotes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [noteLists]);

  const createNewList = () => {
    if (newListName.trim()) {
      const newList: NoteList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNoteLists([...noteLists, newList]);
      setSelectedListId(newList.id);
      setNewListName('');
      setShowNewListForm(false);
    }
  };

  const deleteList = (listId: string) => {
    const updatedLists = noteLists.filter(list => list.id !== listId);
    setNoteLists(updatedLists);
    if (selectedListId === listId) {
      setSelectedListId(updatedLists.length > 0 ? updatedLists[0].id : null);
      setSelectedNoteId(null);
    }
  };

  const reorderLists = (draggedId: string, targetId: string) => {
    const draggedIndex = noteLists.findIndex(list => list.id === draggedId);
    const targetIndex = noteLists.findIndex(list => list.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newLists = [...noteLists];
    const [draggedItem] = newLists.splice(draggedIndex, 1);
    newLists.splice(targetIndex, 0, draggedItem);
    
    setNoteLists(newLists);
  };

  const startRenaming = (listId: string, currentName: string) => {
    setRenamingTabId(listId);
    setRenameValue(currentName);
  };

  const finishRenaming = (listId: string, newName: string) => {
    if (newName.trim() && newName.trim() !== '') {
      setNoteLists(noteLists.map(list => 
        list.id === listId 
          ? { ...list, name: newName.trim(), updatedAt: new Date() }
          : list
      ));
    }
    setRenamingTabId(null);
    setRenameValue('');
  };

  const cancelRenaming = () => {
    setRenamingTabId(null);
    setRenameValue('');
  };

  const createNewNote = useCallback(() => {
    if (selectedListId) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: 'Untitled Note',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setNoteLists(noteLists.map(list => 
        list.id === selectedListId 
          ? { ...list, notes: [...list.notes, newNote], updatedAt: new Date() }
          : list
      ));
      setSelectedNoteId(newNote.id);
      setEditingNote(newNote);
    }
  }, [selectedListId, noteLists, setNoteLists]);

  const saveNote = useCallback((noteId: string, title: string, content: string) => {
    if (selectedListId) {
      setNoteLists(noteLists.map(list => 
        list.id === selectedListId 
          ? {
              ...list,
              notes: list.notes.map(note =>
                note.id === noteId 
                  ? { ...note, title, content, updatedAt: new Date() }
                  : note
              ),
              updatedAt: new Date()
            }
          : list
      ));
      setEditingNote(null);
      setLastSaved(new Date());
    }
  }, [selectedListId, noteLists, setNoteLists]);

  const deleteNote = (noteId: string) => {
    if (selectedListId) {
      setNoteLists(noteLists.map(list => 
        list.id === selectedListId 
          ? {
              ...list,
              notes: list.notes.filter(note => note.id !== noteId),
              updatedAt: new Date()
            }
          : list
      ));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
      setEditingNote(null);
    }
  };

  const duplicateNote = (note: Note) => {
    if (selectedListId) {
      const duplicatedNote: Note = {
        ...note,
        id: Date.now().toString(),
        title: `${note.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setNoteLists(noteLists.map(list => 
        list.id === selectedListId 
          ? { ...list, notes: [...list.notes, duplicatedNote], updatedAt: new Date() }
          : list
      ));
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote({ ...note });
    setSelectedNoteId(note.id);
  };

  const cancelEditing = useCallback(() => {
    setEditingNote(null);
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
  }, [autoSaveTimeout]);

  const handleNoteContentChange = (content: string) => {
    if (editingNote) {
      const updatedNote = { ...editingNote, content };
      setEditingNote(updatedNote);
      autoSave(updatedNote.id, updatedNote.title, content);
    }
  };

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!selectedList || !searchQuery.trim()) {
      return selectedList?.notes || [];
    }
    return selectedList.notes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedList, searchQuery]);

  // Keyboard shortcuts - placed after function definitions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            if (editingNote) {
              saveNote(editingNote.id, editingNote.title, editingNote.content);
            }
            break;
          case 'n':
            e.preventDefault();
            createNewNote();
            break;
          case 'f':
            e.preventDefault();
            setShowSearch(true);
            // Focus search input after state update
            setTimeout(() => {
              const searchInput = document.getElementById('search-input');
              if (searchInput) searchInput.focus();
            }, 100);
            break;
        }
      }
      
      // Tab switching with number keys (1-9) - only if not typing in inputs
      if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        const activeElement = document.activeElement;
        const isTyping = activeElement && (
          activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true'
        );
        
        // Check if inactivity screen is active (if InactivityBlur component is mounted)
        const isInactiveScreen = document.querySelector('[data-inactivity-screen]') !== null;
        
        if (!isTyping && !isInactiveScreen && !renamingTabId) {
          const numberKey = parseInt(e.key);
          if (numberKey >= 1 && numberKey <= 9) {
            const tabIndex = numberKey - 1;
            if (noteLists[tabIndex]) {
              e.preventDefault();
              setSelectedListId(noteLists[tabIndex].id);
              setSelectedNoteId(null);
              setEditingNote(null);
            }
          }
        }
      }
      
      if (e.key === 'Escape') {
        if (renamingTabId) {
          cancelRenaming();
        } else if (showSearch) {
          setShowSearch(false);
          setSearchQuery('');
        } else if (editingNote) {
          cancelEditing();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingNote, showSearch, saveNote, createNewNote, cancelEditing, noteLists, setSelectedListId, setSelectedNoteId, setEditingNote, renamingTabId, cancelRenaming]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20"></div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Smart Notes</h1>
              <p className="text-purple-200 text-sm">Capture your thoughts</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Keyboard shortcuts hint */}
            <div className="hidden lg:flex items-center space-x-4 text-sm text-purple-200">
              <span>⌘+N New</span>
              <span>⌘+S Save</span>
              <span>⌘+F Search</span>
              <span>1-9 Switch Tab</span>
            </div>
          </div>
        </div>

        <ClientOnly fallback={
          <div className="space-y-6">
            {/* Tabs Loading */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-8 w-24 bg-white/20 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-white/20 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
            {/* Content Loading */}
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="h-6 bg-white/10 rounded animate-pulse mb-4"></div>
                  <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                  <div className="h-6 bg-white/10 rounded animate-pulse mb-4"></div>
                  <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        }>
          <div className="space-y-6">
            {/* Topics Tabs */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              {showNewListForm && (
                <div className="p-3 border-b border-white/10">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter topic name..."
                    className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    onKeyPress={(e) => e.key === 'Enter' && createNewList()}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={createNewList}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1.5 rounded-lg text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Create Topic
                    </button>
                    <button
                      onClick={() => {
                        setShowNewListForm(false);
                        setNewListName('');
                      }}
                      className="bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Bar */}
              <div className="flex items-center overflow-x-auto">
                {noteLists.map((list, index) => (
                  <div
                    key={list.id}
                    draggable
                    onMouseDown={() => {
                      setDragStarted(false);
                    }}
                    onDragStart={(e) => {
                      setDragStarted(true);
                      setDraggedTabId(list.id);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', list.id);
                      // Add visual feedback
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      if (draggedTabId !== list.id) {
                        setDragOverTabId(list.id);
                      }
                    }}
                    onDragLeave={(e) => {
                      // Only clear if leaving to a non-child element
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX;
                      const y = e.clientY;
                      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                        setDragOverTabId(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = e.dataTransfer.getData('text/plain');
                      if (draggedId && draggedId !== list.id) {
                        reorderLists(draggedId, list.id);
                      }
                      setDraggedTabId(null);
                      setDragOverTabId(null);
                    }}
                    onDragEnd={() => {
                      setDraggedTabId(null);
                      setDragOverTabId(null);
                      setDragStarted(false);
                    }}
                    onDoubleClick={() => {
                      if (!dragStarted) {
                        startRenaming(list.id, list.name);
                      }
                    }}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap relative cursor-move ${
                      draggedTabId === list.id
                        ? 'opacity-50 scale-95'
                        : dragOverTabId === list.id
                        ? 'border-blue-400 bg-blue-500/20 scale-105'
                        : selectedListId === list.id
                        ? 'border-blue-500 text-blue-400 bg-white/10'
                        : 'border-transparent text-purple-200 hover:text-white hover:bg-white/5'
                    }`}
                    title={`Switch to ${list.name} (Press ${index + 1}) - Drag to reorder, Double-click to rename`}
                  >
                    {renamingTabId === list.id ? (
                      <div className="flex items-center space-x-2 w-full">
                        {index < 9 && (
                          <span className={`text-xs opacity-60 ${
                            selectedListId === list.id ? 'text-blue-300' : 'text-purple-300'
                          }`}>
                            {index + 1}
                          </span>
                        )}
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => finishRenaming(list.id, renameValue)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              finishRenaming(list.id, renameValue);
                            } else if (e.key === 'Escape') {
                              cancelRenaming();
                            }
                          }}
                          className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded px-2 py-1 text-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedListId === list.id
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-white/10 text-purple-300'
                        }`}>
                          {list.notes.length}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedListId(list.id);
                          setSelectedNoteId(null);
                          setEditingNote(null);
                        }}
                        className="flex items-center space-x-2 w-full text-left pointer-events-auto"
                      >
                        {index < 9 && (
                          <span className={`text-xs opacity-60 ${
                            selectedListId === list.id ? 'text-blue-300' : 'text-purple-300'
                          }`}>
                            {index + 1}
                          </span>
                        )}
                        <span>{list.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedListId === list.id
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-white/10 text-purple-300'
                        }`}>
                          {list.notes.length}
                        </span>
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Add Tab Button */}
                <button
                  onClick={() => setShowNewListForm(true)}
                  className="flex items-center justify-center px-3 py-3 text-purple-300 hover:text-white hover:bg-white/5 transition-all duration-200 border-b-2 border-transparent"
                  title="Create new topic"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                {noteLists.length === 0 && !showNewListForm && (
                  <div className="flex-1 text-center py-6 px-4">
                    <p className="text-sm text-purple-200 mb-3">No topics yet. Create your first topic to get started!</p>
                    <button
                      onClick={() => setShowNewListForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Create Topic
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="grid lg:grid-cols-4 gap-6">

              {/* Notes List */}
              <div className="lg:col-span-1">
                {selectedList ? (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-white">
                        Notes in {selectedList.name}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowSearch(!showSearch)}
                          className="bg-white/10 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/20 border border-white/20 transition-all duration-300"
                          title="Search notes (⌘+F)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={createNewNote}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          title="Create new note (⌘+N)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Search Bar */}
                    {showSearch && (
                      <div className="mb-4">
                        <input
                          id="search-input"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search notes..."
                          className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setShowSearch(false);
                              setSearchQuery('');
                            }
                          }}
                        />
                        {searchQuery && (
                          <p className="text-xs text-purple-300 mt-2">
                            {filteredNotes.length} notes found
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredNotes.map(note => (
                        <div
                          key={note.id}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                            selectedNoteId === note.id
                              ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/50 shadow-lg'
                              : 'bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div
                              onClick={() => {
                                setSelectedNoteId(note.id);
                                setEditingNote(null); // Clear edit mode for read-only view
                              }}
                              onDoubleClick={() => {
                                setSelectedNoteId(note.id);
                                startEditing(note);
                              }}
                              className="flex-1 min-w-0"
                              title="Single click to view, double click to edit"
                            >
                              <p className="text-sm text-purple-200 line-clamp-3 mb-2">
                                {note.content.slice(0, 150)}...
                              </p>
                              <p className="text-xs text-purple-300">
                                {mounted ? note.updatedAt.toLocaleDateString() : ''}
                              </p>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={() => duplicateNote(note)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                                title="Duplicate note"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteNote(note.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Delete note"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredNotes.length === 0 && selectedList.notes.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                          No notes yet. Create your first note!
                        </p>
                      )}
                      {filteredNotes.length === 0 && selectedList.notes.length > 0 && searchQuery && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                          No notes found matching &quot;{searchQuery}&quot;
                        </p>
                      )}
                    </div>

                    {/* Recent Notes in this topic */}
                    {recentNotes.filter(note => note.listId === selectedList.id).length > 0 && (
                      <div className="mt-6 pt-6 border-t border-white/20">
                        <h3 className="text-sm font-semibold text-white mb-3">Recent in this topic</h3>
                        <div className="space-y-2">
                          {recentNotes.filter(note => note.listId === selectedList.id).slice(0, 3).map(note => (
                            <div
                              key={note.id}
                              onClick={() => {
                                setSelectedNoteId(note.id);
                                setEditingNote(null); // Clear edit mode for read-only view
                              }}
                              onDoubleClick={() => {
                                setSelectedNoteId(note.id);
                                startEditing(note);
                              }}
                              className="p-2 rounded-lg cursor-pointer bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                              title="Single click to view, double click to edit"
                            >
                              <p className="text-xs text-purple-200 truncate">
                                {note.content.slice(0, 60)}...
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                    <div className="py-8">
                      <svg className="w-12 h-12 mx-auto text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-purple-200 text-sm">
                        Select a topic from the tabs above to view notes.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Note Editor */}
              <div className="lg:col-span-3">
              {editingNote ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  


                  {/* Auto-save indicator */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                      {lastSaved && (
                        <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                      )}
                      <span>{wordCount} words, {charCount} characters</span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      Auto-save enabled
                    </div>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={editingNote.content}
                    onChange={(e) => handleNoteContentChange(e.target.value)}
                    className="w-full h-96 p-4 border rounded-lg resize-none bg-white/5 backdrop-blur-sm border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono mb-4"
                    placeholder="Start writing your note... 

You can use Markdown:
# Heading 1
## Heading 2
### Heading 3
**bold text**
*italic text*
`code`"
                    spellCheck="true"
                  />

                  {/* Save and Cancel buttons - Bottom Right */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      title="Cancel editing (Esc)"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveNote(editingNote.id, editingNote.title, editingNote.content)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      title="Save note (⌘+S)"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : selectedNote ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                          Read-only mode
                        </span>
                        <span className="text-xs text-purple-300">
                          Double-click note in list to edit
                        </span>
                      </div>
                      <p className="text-sm text-purple-200">
                        Updated: {mounted ? selectedNote.updatedAt.toLocaleString() : ''}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => duplicateNote(selectedNote)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        title="Duplicate note"
                      >
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Duplicate
                      </button>
                      <button
                        onClick={() => startEditing(selectedNote)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        title="Edit this note"
                      >
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Note
                      </button>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <div 
                      className="whitespace-pre-wrap text-white bg-white/5 rounded-lg p-4 border border-white/10 min-h-[200px]"
                    >
                      {selectedNote.content || <em className="text-gray-500">This note is empty. Click &quot;Edit Note&quot; to add content.</em>}
                    </div>
                  </div>
                </div>
              ) : selectedList ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center">
                  <div className="py-12">
                                          <svg className="w-16 h-16 mx-auto text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-purple-200 mb-4">
                      Select a note from the list or create a new one to get started.
                    </p>
                    <button
                      onClick={createNewNote}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Your First Note
                    </button>
                  </div>
                </div>
                              ) : (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center">                  
                    <div className="py-12">
                      <svg className="w-16 h-16 mx-auto text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-purple-200 mb-4">
                        Select a topic from the tabs above to get started.
                      </p>
                      <button
                        onClick={() => setShowNewListForm(true)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Create Your First Topic
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          

        </ClientOnly>

        {/* Delete Topic Section */}
        <div className="mt-30">
          <DeleteTopicSection selectedList={selectedList} onDeleteTopic={deleteList} />
        </div>
        
        <div className="pb-20"></div>
      </div>
      <Footer />
    </div>
  );
} 