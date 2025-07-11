'use client';

import { useState, useEffect } from 'react';
import { TodoList, TodoItem } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ClientOnly from '@/components/ClientOnly';
import Footer from '@/components/Footer';
import RecurringTaskModal from '@/components/RecurringTaskModal';

export default function TodoPage() {
  const [todoLists, setTodoLists] = useLocalStorage<TodoList[]>('todoLists', []);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'expanding' | 'particles' | 'complete'>('initial');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [streak, setStreak] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementType, setAchievementType] = useState<'streak' | 'milestone' | 'perfect' | null>(null);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [pendingTaskText, setPendingTaskText] = useState('');

  // Handle client-side initialization to prevent hydration mismatch
  useEffect(() => {
    if (todoLists.length > 0 && !selectedListId) {
      setSelectedListId(todoLists[0].id);
    }
  }, [todoLists, selectedListId]);

  // Update current time every minute for relative timestamps
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = currentTime.getTime();
    const then = new Date(date).getTime();
    const diffInSeconds = Math.floor((now - then) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  };

  // Utility function to calculate next due date based on frequency
  const calculateNextDueDate = (frequency: 'daily' | 'weekly' | 'monthly' | 'yearly', fromDate: Date = new Date()): Date => {
    const nextDate = new Date(fromDate);
    
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    
    return nextDate;
  };

  const selectedList = todoLists.find(list => list.id === selectedListId);

  const createNewList = () => {
    if (newListName.trim()) {
      const newList: TodoList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setTodoLists([...todoLists, newList]);
      setSelectedListId(newList.id);
      setNewListName('');
      setShowNewListForm(false);
    }
  };

  const deleteList = (listId: string) => {
    const updatedLists = todoLists.filter(list => list.id !== listId);
    setTodoLists(updatedLists);
    if (selectedListId === listId) {
      setSelectedListId(updatedLists.length > 0 ? updatedLists[0].id : null);
    }
  };

  const addTask = () => {
    if (newTaskText.trim() && selectedListId) {
      const newTask: TodoItem = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setTodoLists(todoLists.map(list => 
        list.id === selectedListId 
          ? { ...list, items: [...list.items, newTask], updatedAt: new Date() }
          : list
      ));
      setNewTaskText('');
    }
  };

  const addRecurringTask = (frequency: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    if (pendingTaskText.trim() && selectedListId) {
      const now = new Date();
      const newTask: TodoItem = {
        id: Date.now().toString(),
        text: pendingTaskText.trim(),
        completed: false,
        createdAt: now,
        updatedAt: now,
        isRecurring: true,
        recurringFrequency: frequency,
        nextDueDate: calculateNextDueDate(frequency, now),
        originalCreatedAt: now
      };

      setTodoLists(todoLists.map(list => 
        list.id === selectedListId 
          ? { ...list, items: [...list.items, newTask], updatedAt: new Date() }
          : list
      ));
      setPendingTaskText('');
    }
  };

  const showRecurringDialog = () => {
    if (newTaskText.trim()) {
      setPendingTaskText(newTaskText.trim());
      setShowRecurringModal(true);
      setNewTaskText('');
    }
  };

  const playCompletionSound = () => {
    // Create a simple success sound using Web Audio API
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const checkAchievements = (completedCount: number, totalCount: number) => {
    // Streak achievement
    const newStreak = streak + 1;
    setStreak(newStreak);
    
    if (newStreak >= 5 && newStreak % 5 === 0) {
      setAchievementType('streak');
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 3000);
    }
    
    // Milestone achievements
    if (completedCount === 10 || completedCount === 25 || completedCount === 50 || completedCount === 100) {
      setAchievementType('milestone');
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 3000);
    }
    
    // Perfect completion
    if (completedCount === totalCount && totalCount >= 5) {
      setAchievementType('perfect');
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 3000);
    }
  };

  const toggleTask = (taskId: string) => {
    if (selectedListId) {
      const currentTask = todoLists
        .find(list => list.id === selectedListId)?.items
        .find(item => item.id === taskId);
      
      // If task is being completed (not uncompleted), trigger celebration
      if (currentTask && !currentTask.completed) {
        setCompletedTaskId(taskId);
        setShowCelebration(true);
        setAnimationPhase('initial');
        
                 // Play completion sound
         try {
           playCompletionSound();
         } catch {
           console.log('Audio not supported');
         }
        
        // Enhanced animation sequence with better timing
        setTimeout(() => setAnimationPhase('expanding'), 50);
        setTimeout(() => setAnimationPhase('particles'), 200);
        setTimeout(() => setAnimationPhase('complete'), 1500);
        
        // Hide celebration after animation
        setTimeout(() => {
          setShowCelebration(false);
          setCompletedTaskId(null);
          setAnimationPhase('initial');
        }, 3500);
        
        // Check for achievements
        const list = todoLists.find(l => l.id === selectedListId);
        if (list) {
          const newCompletedCount = list.items.filter(item => item.completed).length + 1;
          checkAchievements(newCompletedCount, list.items.length);
        }
      } else if (currentTask && currentTask.completed) {
        // Reset streak when uncompleting a task
        setStreak(0);
      }
      
      setTodoLists(todoLists.map(list => 
        list.id === selectedListId 
          ? {
              ...list,
              items: list.items.map(item => {
                if (item.id === taskId) {
                  const updatedItem = { ...item, completed: !item.completed, updatedAt: new Date() };
                  
                  // If completing a recurring task, create the next occurrence
                  if (!item.completed && item.isRecurring && item.recurringFrequency) {
                    const nextOccurrence: TodoItem = {
                      id: (Date.now() + 1).toString(), // Ensure unique ID
                      text: item.text,
                      completed: false,
                      createdAt: calculateNextDueDate(item.recurringFrequency, new Date()),
                      updatedAt: new Date(),
                      isRecurring: true,
                      recurringFrequency: item.recurringFrequency,
                      nextDueDate: calculateNextDueDate(item.recurringFrequency, calculateNextDueDate(item.recurringFrequency, new Date())),
                      originalCreatedAt: item.originalCreatedAt || item.createdAt
                    };
                    
                    // Add the next occurrence to the list
                    list.items.push(nextOccurrence);
                  }
                  
                  return updatedItem;
                }
                return item;
              }),
              updatedAt: new Date()
            }
          : list
      ));
    }
  };

  const deleteTask = (taskId: string) => {
    if (selectedListId) {
      setTodoLists(todoLists.map(list => 
        list.id === selectedListId 
          ? {
              ...list,
              items: list.items.filter(item => item.id !== taskId),
              updatedAt: new Date()
            }
          : list
      ));
    }
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
        {/* Enhanced Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {/* Animated background ripple */}
            <div className={`absolute inset-0 transition-all duration-1000 ${
              animationPhase === 'expanding' ? 'bg-green-500/10' : 
              animationPhase === 'particles' ? 'bg-gradient-to-r from-green-500/5 to-purple-500/5' :
              'bg-transparent'
            }`}>
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
                animationPhase === 'expanding' ? 'w-96 h-96' : 
                animationPhase === 'particles' ? 'w-screen h-screen' : 'w-0 h-0'
              } bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full`}></div>
            </div>

            {/* Enhanced confetti particles with physics */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(60)].map((_, i) => {
                const colors = ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-emerald-400', 'bg-cyan-400'];
                const shapes = ['rounded-full', 'rounded-sm', 'rotate-45', 'rotate-12', 'rounded-lg'];
                const sizes = ['w-1 h-1', 'w-2 h-2', 'w-3 h-3', 'w-4 h-4', 'w-1 h-4', 'w-4 h-1'];
                
                const startX = 50 + (Math.random() - 0.5) * 20; // Start near center
                const startY = 50 + (Math.random() - 0.5) * 20;
                const endX = Math.random() * 100;
                const endY = Math.random() * 100;
                const duration = 0.8 + Math.random() * 1.2;
                const delay = Math.random() * 0.8;
                
                return (
                  <div
                    key={i}
                    className={`absolute ${colors[i % colors.length]} ${shapes[i % shapes.length]} ${sizes[i % sizes.length]} 
                      ${animationPhase === 'particles' ? 'opacity-90' : 'opacity-0'} 
                      transition-all duration-300 shadow-lg`}
                    style={{
                      left: `${animationPhase === 'particles' ? endX : startX}%`,
                      top: `${animationPhase === 'particles' ? endY : startY}%`,
                      transform: `rotate(${Math.random() * 720}deg) scale(${animationPhase === 'particles' ? 0.2 : 1})`,
                      transition: `all ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`,
                      filter: 'drop-shadow(0 0 8px currentColor)',
                      zIndex: 60
                    }}
                  />
                );
              })}
            </div>

            {/* Floating sparkles */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={`sparkle-${i}`}
                  className={`absolute w-1 h-1 bg-yellow-300 rounded-full ${
                    animationPhase === 'particles' || animationPhase === 'complete' ? 'animate-pulse' : 'opacity-0'
                  } transition-opacity duration-300`}
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    filter: 'drop-shadow(0 0 6px #fef08a)',
                  }}
                />
              ))}
            </div>
            
            {/* Enhanced success message with morphing animation */}
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${
              animationPhase === 'initial' ? 'scale-0 opacity-0' :
              animationPhase === 'expanding' ? 'scale-110 opacity-100' :
              animationPhase === 'particles' ? 'scale-100 opacity-100' :
              'scale-95 opacity-80'
            }`}>
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                
                {/* Main card */}
                <div className={`relative bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-6 rounded-2xl shadow-2xl border border-green-300/30 backdrop-blur-sm
                  ${animationPhase === 'expanding' ? 'animate-bounce' : 
                    animationPhase === 'particles' ? 'animate-pulse' : 
                    animationPhase === 'complete' ? 'animate-none' : ''
                  }`}>
                  <div className="flex items-center space-x-4">
                    {/* Animated checkmark */}
                    <div className={`relative w-12 h-12 bg-white/20 rounded-full flex items-center justify-center transition-all duration-500 ${
                      animationPhase === 'expanding' ? 'animate-spin' :
                      animationPhase === 'particles' ? 'animate-bounce' : ''
                    }`}>
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={3} 
                          d="M5 13l4 4L19 7"
                          className={`${animationPhase === 'particles' ? 'animate-pulse' : ''}`}
                        />
                      </svg>
                      
                      {/* Rotating ring */}
                      <div className={`absolute inset-0 border-2 border-white/40 border-t-white rounded-full ${
                        animationPhase === 'expanding' || animationPhase === 'particles' ? 'animate-spin' : ''
                      }`}></div>
                    </div>
                    
                    <div className="text-left">
                      <div className={`font-bold text-xl transition-all duration-300 ${
                        animationPhase === 'complete' ? 'text-green-100' : 'text-white'
                      }`}>
                        {animationPhase === 'initial' && 'Starting...'}
                        {animationPhase === 'expanding' && 'Great!'}
                        {animationPhase === 'particles' && 'Awesome!'}
                        {animationPhase === 'complete' && 'Well Done!'}
                      </div>
                      <div className="text-sm opacity-90 text-green-100">
                        {animationPhase === 'initial' && 'Processing...'}
                        {animationPhase === 'expanding' && 'Task completed!'}
                        {animationPhase === 'particles' && 'Keep up the momentum! 🚀'}
                        {animationPhase === 'complete' && 'You are productive! ✨'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-yellow-300 to-green-300 rounded-full transition-all duration-1000 ${
                      animationPhase === 'initial' ? 'w-0' :
                      animationPhase === 'expanding' ? 'w-1/3' :
                      animationPhase === 'particles' ? 'w-2/3' :
                      'w-full'
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Notification */}
        {showAchievement && (
          <div className="fixed top-20 right-4 z-50 transform transition-all duration-500 ease-out animate-bounce">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl shadow-2xl border border-yellow-400/50 max-w-sm">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-spin">
                  {achievementType === 'streak' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {achievementType === 'milestone' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  )}
                  {achievementType === 'perfect' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {achievementType === 'streak' && `🔥 ${streak} Task Streak!`}
                    {achievementType === 'milestone' && '🎯 Milestone Reached!'}
                    {achievementType === 'perfect' && '⭐ Perfect Completion!'}
                  </div>
                  <div className="text-sm opacity-90">
                    {achievementType === 'streak' && 'You\'re on fire! Keep going!'}
                    {achievementType === 'milestone' && 'Amazing productivity milestone!'}
                    {achievementType === 'perfect' && 'All tasks completed! Outstanding!'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Task Manager</h1>
              <p className="text-purple-200 text-sm">Organize your productivity</p>
            </div>
          </div>
        </div>

        <ClientOnly fallback={
          <div className="grid lg:grid-cols-4 gap-6">
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
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <div className="h-6 bg-white/10 rounded animate-pulse mb-4"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        }>
          <div className="grid lg:grid-cols-4 gap-6">
          {/* Lists Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Task Lists
                </h2>
                <button
                  onClick={() => setShowNewListForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
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
                    placeholder="Enter list name..."
                    className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                    onKeyPress={(e) => e.key === 'Enter' && createNewList()}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={createNewList}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Create List
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
                {todoLists.map(list => (
                  <div
                    key={list.id}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                      selectedListId === list.id
                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50 shadow-lg'
                        : 'bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => setSelectedListId(list.id)}
                        className="flex-1"
                      >
                        <h3 className="font-semibold text-white mb-1">
                          {list.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-purple-200">
                          <span>{list.items.length} tasks</span>
                          <span>•</span>
                          <span>{list.items.filter(item => item.completed).length} done</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteList(list.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {todoLists.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-purple-200 text-sm">
                      No lists yet. Create your first list to get started!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tasks Area */}
          <div className="lg:col-span-3">
            {selectedList ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedList.name}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-purple-200">
                      <span>{selectedList.items.length} total tasks</span>
                      <span>•</span>
                      <span>{selectedList.items.filter(item => item.completed).length} completed</span>
                      <span>•</span>
                      <span>{selectedList.items.filter(item => !item.completed).length} remaining</span>
                    </div>
                  </div>
                  
                  {/* Progress indicator */}
                  {selectedList.items.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm text-purple-200">Progress</div>
                        <div className="text-lg font-bold text-white">
                          {Math.round((selectedList.items.filter(item => item.completed).length / selectedList.items.length) * 100)}%
                        </div>
                      </div>
                      <div className="w-16 h-16 relative">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="4"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${(selectedList.items.filter(item => item.completed).length / selectedList.items.length) * 175.93} 175.93`}
                            className="transition-all duration-500"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Task Form */}
                <div className="mb-6 space-y-3">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="What needs to be done?"
                      className="flex-1 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    />
                    <button
                      onClick={addTask}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Task</span>
                    </button>
                  </div>
                  
                  {/* Recurring Task Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={showRecurringDialog}
                      disabled={!newTaskText.trim()}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        newTaskText.trim() 
                          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-300 hover:from-orange-500/30 hover:to-red-500/30 hover:text-orange-200 hover:shadow-lg hover:shadow-orange-500/20' 
                          : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Make Recurring</span>
                      {newTaskText.trim() && (
                        <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  {selectedList.items.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-700 border relative overflow-hidden ${
                        task.completed
                          ? 'bg-gradient-to-r from-green-500/15 to-emerald-500/10 border-green-500/30 shadow-lg shadow-green-500/20'
                          : 'bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10'
                      } ${
                        completedTaskId === task.id ? 'animate-pulse bg-green-400/30 scale-105 shadow-2xl shadow-green-400/40' : ''
                      }`}
                    >
                      {/* Enhanced ripple effects for newly completed task */}
                      {completedTaskId === task.id && (
                        <>
                          <div className="absolute inset-0 rounded-xl bg-green-400/30 animate-ping"></div>
                          <div className="absolute inset-0 rounded-xl bg-green-300/20 animate-pulse delay-200"></div>
                          <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-ping delay-100"></div>
                          
                          {/* Sliding success bar */}
                          <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-green-400/30 to-transparent animate-pulse">
                            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-green-400/40 to-transparent animate-ping transform translate-x-full transition-transform duration-1000"></div>
                          </div>
                        </>
                      )}
                      
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          className={`w-6 h-6 text-green-500 bg-white/10 border-white/20 rounded-md focus:ring-purple-500 focus:ring-2 transition-all duration-500 ${
                            task.completed ? 'bg-green-500/20 border-green-500/40' : 'hover:bg-white/20'
                          } ${
                            completedTaskId === task.id ? 'scale-110 shadow-lg shadow-green-400/50' : ''
                          }`}
                        />
                        
                        {/* Enhanced checkmark with animation */}
                        {task.completed && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg 
                              className={`w-4 h-4 text-green-400 transition-all duration-500 ${
                                completedTaskId === task.id ? 'animate-bounce scale-150 text-green-300' : 'scale-100'
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={3} 
                                d="M5 13l4 4L19 7"
                                className={`${completedTaskId === task.id ? 'animate-pulse' : ''}`}
                              />
                            </svg>
                          </div>
                        )}
                        
                        {/* Pulsing ring around checkbox when newly completed */}
                        {completedTaskId === task.id && (
                          <div className="absolute inset-0 border-2 border-green-400/60 rounded-md animate-ping scale-125"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`transition-all duration-500 ${
                              task.completed
                                ? 'line-through text-purple-300'
                                : 'text-white'
                            } ${
                              completedTaskId === task.id ? 'animate-pulse' : ''
                            }`}
                          >
                            {task.text}
                          </span>
                          {task.isRecurring && (
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4 text-orange-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span className="text-xs text-orange-400 font-medium capitalize">
                                {task.recurringFrequency}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-purple-300 mt-1 flex items-center space-x-2">
                          <span>{formatRelativeTime(task.updatedAt)}</span>
                          {task.isRecurring && task.nextDueDate && (
                            <>
                              <span>•</span>
                              <span className="text-orange-300">
                                Next: {formatRelativeTime(task.nextDueDate)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Enhanced celebration effects for completed task */}
                      {completedTaskId === task.id && (
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Floating sparkles around the task */}
                          <div className="absolute right-2 top-2">
                            <div className="relative">
                              {[...Array(8)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`absolute w-1.5 h-1.5 rounded-full animate-ping ${
                                    i % 3 === 0 ? 'bg-yellow-400' : 
                                    i % 3 === 1 ? 'bg-green-400' : 'bg-blue-400'
                                  }`}
                                  style={{
                                    top: `${Math.sin(i * 45 * Math.PI / 180) * 20 + 10}px`,
                                    left: `${Math.cos(i * 45 * Math.PI / 180) * 20 + 10}px`,
                                    animationDelay: `${i * 0.15}s`,
                                    animationDuration: `${0.8 + Math.random() * 0.4}s`,
                                    filter: 'drop-shadow(0 0 4px currentColor)'
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Success wave effect */}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                            <div className="w-8 h-8 bg-green-400/40 rounded-full animate-ping"></div>
                            <div className="absolute top-1 left-1 w-6 h-6 bg-green-300/30 rounded-full animate-pulse delay-300"></div>
                          </div>
                          
                          {/* Trailing particles */}
                          <div className="absolute top-0 right-0 w-full h-full">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={`trail-${i}`}
                                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-60"
                                style={{
                                  top: `${20 + i * 10}%`,
                                  right: `${10 + i * 5}%`,
                                  animationDelay: `${i * 0.1}s`,
                                  animationDuration: '1.2s'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {selectedList.items.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Ready to be productive?</h3>
                      <p className="text-purple-200">
                        Add your first task above to get started with this list!
                      </p>
                    </div>
                  )}
                </div>

                {/* Task Statistics */}
                {selectedList.items.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-white">{selectedList.items.length}</div>
                        <div className="text-sm text-purple-200">Total Tasks</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{selectedList.items.filter(item => item.completed).length}</div>
                        <div className="text-sm text-purple-200">Completed</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">{selectedList.items.filter(item => !item.completed).length}</div>
                        <div className="text-sm text-purple-200">Remaining</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Welcome to Task Manager</h3>
                <p className="text-purple-200 text-lg mb-6">
                  Select a list from the sidebar or create a new one to start organizing your tasks.
                </p>
                <button
                  onClick={() => setShowNewListForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Your First List</span>
                </button>
              </div>
            )}
          </div>
        </div>
        

        </ClientOnly>
        
        <div className="pb-20"></div>
      </div>
      <Footer />
      
      {/* Recurring Task Modal */}
      <RecurringTaskModal
        isOpen={showRecurringModal}
        taskText={pendingTaskText}
        onClose={() => setShowRecurringModal(false)}
        onConfirm={addRecurringTask}
      />
    </div>
  );
} 