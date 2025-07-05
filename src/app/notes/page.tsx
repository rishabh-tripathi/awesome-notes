'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { NoteList, Note } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ClientOnly from '@/components/ClientOnly';
import Footer from '@/components/Footer';

export default function NotesPage() {
  const [noteLists, setNoteLists] = useLocalStorage<NoteList[]>('noteLists', []);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMarkdownPreview, setIsMarkdownPreview] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showWordCount, setShowWordCount] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
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
    if (editingNote && !isMarkdownPreview && textareaRef.current) {
      // Focus the textarea when a new note is created or when switching from preview to edit mode
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [editingNote, isMarkdownPreview]);



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
    setIsMarkdownPreview(false);
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
          case 'p':
            e.preventDefault();
            setIsMarkdownPreview(!isMarkdownPreview);
            break;
        }
      }
      if (e.key === 'Escape') {
        if (showSearch) {
          setShowSearch(false);
          setSearchQuery('');
        } else if (editingNote) {
          cancelEditing();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingNote, isMarkdownPreview, showSearch, saveNote, createNewNote, cancelEditing]);





  // Simple markdown to HTML converter
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

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
              <span>⌘+P Preview</span>
            </div>
          </div>
        </div>

        <ClientOnly fallback={
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Lists</h2>
                  <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <div className="h-6 bg-white/10 rounded animate-pulse mb-4"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        }>
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Lists Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Lists */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Topics
                  </h2>
                  <button
                    onClick={() => setShowNewListForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    title="Create new list (⌘+Shift+N)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {showNewListForm && (
                  <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Enter collection name..."
                      className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                      onKeyPress={(e) => e.key === 'Enter' && createNewList()}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={createNewList}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Create Collection
                      </button>
                      <button
                        onClick={() => {
                          setShowNewListForm(false);
                          setNewListName('');
                        }}
                        className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {noteLists.map(list => (
                    <div
                      key={list.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                        selectedListId === list.id
                          ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/50 shadow-lg'
                          : 'bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => {
                            setSelectedListId(list.id);
                            setSelectedNoteId(null);
                            setEditingNote(null);
                          }}
                          className="flex-1"
                        >
                          <h3 className="font-semibold text-white mb-1">
                            {list.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-purple-200">
                            <span>{list.notes.length} notes</span>
                            <span>•</span>
                            <span>{list.notes.reduce((total, note) => total + note.content.split(/\s+/).filter(word => word.length > 0).length, 0)} words</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteList(list.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-300"
                          title="Delete list"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {noteLists.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-purple-200 text-sm">
                        No collections yet. Create your first collection to get started!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Notes */}
              {recentNotes.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Recent Notes
                  </h3>
                  <div className="space-y-3">
                    {recentNotes.map(note => (
                      <div
                        key={note.id}
                        onClick={() => {
                          setSelectedListId(note.listId);
                          setSelectedNoteId(note.id);
                          setEditingNote(null);
                        }}
                        className="p-3 rounded-xl cursor-pointer bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <p className="font-medium text-sm text-white truncate">
                          {note.content.slice(0, 50)}...
                        </p>
                        <p className="text-xs text-purple-200">
                          {note.listName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes List */}
            <div className="lg:col-span-1">
              {selectedList && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">
                      {selectedList.name}
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
                            onClick={() => setSelectedNoteId(note.id)}
                            className="flex-1 min-w-0"
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
                </div>
              )}
            </div>

            {/* Note Editor */}
            <div className="lg:col-span-3">
              {editingNote ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {/* Word count toggle */}
                      <button
                        onClick={() => setShowWordCount(!showWordCount)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Toggle word count"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </button>
                      
                      {/* Markdown preview toggle */}
                      <button
                        onClick={() => setIsMarkdownPreview(!isMarkdownPreview)}
                        className={`px-3 py-1 rounded text-sm ${
                          isMarkdownPreview 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                        title="Toggle markdown preview (⌘+P)"
                      >
                        {isMarkdownPreview ? 'Edit' : 'Preview'}
                      </button>
                      
                      <button
                        onClick={() => saveNote(editingNote.id, editingNote.title, editingNote.content)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        title="Save note (⌘+S)"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        title="Cancel editing (Esc)"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Auto-save indicator */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                      {lastSaved && (
                        <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                      )}
                      {showWordCount && (
                        <span>{wordCount} words, {charCount} characters</span>
                      )}
                    </div>
                    <div className="text-gray-400 text-xs">
                      Auto-save enabled
                    </div>
                  </div>

                  {isMarkdownPreview ? (
                    <div 
                      className="w-full h-96 p-4 border rounded-lg overflow-y-auto prose dark:prose-invert max-w-none dark:bg-gray-700 dark:border-gray-600"
                      dangerouslySetInnerHTML={{ 
                        __html: renderMarkdown(editingNote.content || 'Nothing to preview yet...') 
                      }}
                    />
                  ) : (
                    <textarea
                      ref={textareaRef}
                      value={editingNote.content}
                      onChange={(e) => handleNoteContentChange(e.target.value)}
                      className="w-full h-96 p-4 border rounded-lg resize-none bg-white/5 backdrop-blur-sm border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
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
                  )}
                </div>
              ) : selectedNote ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-purple-200">
                        Updated: {mounted ? selectedNote.updatedAt.toLocaleString() : ''}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => duplicateNote(selectedNote)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        title="Duplicate note"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => startEditing(selectedNote)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <div 
                      className="whitespace-pre-wrap text-white"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedNote.content 
                          ? renderMarkdown(selectedNote.content)
                          : '<em class="text-gray-500">This note is empty. Click Edit to add content.</em>'
                      }}
                    />
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
                      Select a list from the sidebar or create a new one to get started.
                    </p>
                    <button
                      onClick={() => setShowNewListForm(true)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Your First List
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          

        </ClientOnly>
        
        <div className="pb-20"></div>
      </div>
      <Footer />
    </div>
  );
} 