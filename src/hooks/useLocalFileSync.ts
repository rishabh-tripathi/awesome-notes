'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { NoteList } from '@/types';

interface LocalFileSyncOptions {
  enabled: boolean;
  syncDelay?: number; // Delay in ms before syncing after changes
}

interface SyncStatus {
  isEnabled: boolean;
  isSetup: boolean;
  lastSync: Date | null;
  error: string | null;
  syncCount: number;
}

// File System Access API and OPFS types
declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: 'read' | 'readwrite';
      startIn?: string | FileSystemHandle;
    }) => Promise<FileSystemDirectoryHandle>;
  }
}



interface FileSystemDirectoryHandle {
  getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandle>;
  getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemDirectoryHandle>;
  values: () => AsyncIterableIterator<FileSystemHandle>;
}

interface FileSystemFileHandle {
  createWritable: () => Promise<FileSystemWritableFileStream>;
  getFile: () => Promise<File>;
}

interface FileSystemWritableFileStream {
  write: (data: string | BufferSource | Blob) => Promise<void>;
  close: () => Promise<void>;
}

interface FileSystemHandle {
  name: string;
  kind: 'file' | 'directory';
}

export const useLocalFileSync = (noteLists: NoteList[], options: LocalFileSyncOptions = { enabled: false, syncDelay: 2000 }) => {
  const [status, setStatus] = useState<SyncStatus>({
    isEnabled: false,
    isSetup: false,
    lastSync: null,
    error: null,
    syncCount: 0
  });

  const directoryHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSetupRef = useRef(false);

  // Check if OPFS or File System Access API is supported
  const isSupported = useCallback(() => {
    return 'storage' in navigator && 'getDirectory' in navigator.storage || 'showDirectoryPicker' in window;
  }, []);

  // Setup directory - try OPFS first, then File System Access API
  const setupSync = useCallback(async () => {
    if (!isSupported()) {
      setStatus(prev => ({
        ...prev,
        error: 'File sync not supported in this browser. Please use Chrome 86+ or Edge 86+.'
      }));
      return false;
    }

        try {
       let directoryHandle: FileSystemDirectoryHandle;
       
       // Check if user wants to force manual folder selection
       const forceManual = localStorage.getItem('localFileSyncForceManual') === 'true';

       // Try OPFS first (persistent, no user permission needed) - unless forced to use manual
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       if (!forceManual && 'storage' in navigator && 'getDirectory' in (navigator.storage as any)) {
         console.log('🔧 Attempting OPFS setup...');
         try {
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           const opfsRoot = await (navigator.storage as any).getDirectory();
           directoryHandle = await opfsRoot.getDirectoryHandle('research-app-notes', { create: true });
           
           directoryHandleRef.current = directoryHandle;
           isSetupRef.current = true;
           
                     console.log('✅ OPFS setup successful');
          console.log('📁 Storage Location: OPFS (Origin Private File System)');
          console.log('📂 Directory: research-app-notes (browser private storage)');
          console.log('');
          console.log('🗂️ Physical location varies by browser:');
          console.log('   Chrome/Edge (macOS): ~/Library/Application Support/Google/Chrome/Default/File System/');
          console.log('   Safari (macOS): ~/Library/Safari/LocalStorage/');
          console.log('   Firefox (macOS): ~/Library/Application Support/Firefox/Profiles/*/storage/default/');
          console.log('⚠️  Note: These are private browser files, not directly accessible');
          console.log('');
           
           setStatus(prev => ({
             ...prev,
             isSetup: true,
             isEnabled: true,
             error: null
           }));

           localStorage.setItem('localFileSyncSetup', 'opfs');
           localStorage.setItem('localFileSyncEnabled', 'true');
           
           return true;
         } catch (opfsError) {
           console.warn('❌ OPFS failed, trying File System Access API:', opfsError);
         }
       }
      
             // Fallback to File System Access API (requires user permission each time)
       if ('showDirectoryPicker' in window) {
         console.log(forceManual ? 
           '🔧 Using File System Access API (user requested regular folder)...' : 
           '🔧 Attempting File System Access API setup...');
         directoryHandle = await window.showDirectoryPicker!({
           mode: 'readwrite'
         });
         
         directoryHandleRef.current = directoryHandle;
         isSetupRef.current = true;
         
         console.log('✅ File System Access API setup successful');
         console.log('📁 Storage Location: User-selected folder');
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         console.log('📂 Directory Name:', (directoryHandle as any).name || 'Unknown');
         
         // Try to log more path info if available
         if ('getUniqueId' in directoryHandle) {
           try {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const uniqueId = await (directoryHandle as any).getUniqueId();
             console.log('📍 Directory ID:', uniqueId);
           } catch {
             console.log('📍 Directory ID: Not available');
           }
         }
         
         setStatus(prev => ({
           ...prev,
           isSetup: true,
           isEnabled: true,
           error: null
         }));

         localStorage.setItem('localFileSyncSetup', 'manual');
         
         return true;
       }
      
      throw new Error('No file system API available');
    } catch (error) {
      console.error('Failed to setup directory:', error);
      setStatus(prev => ({
        ...prev,
        error: 'Failed to setup sync directory. Please try again.'
      }));
      return false;
    }
  }, [isSupported]);

  // Disable sync
  const disableSync = useCallback(() => {
    directoryHandleRef.current = null;
    isSetupRef.current = false;
    
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    setStatus(prev => ({
      ...prev,
      isEnabled: false,
      isSetup: false
    }));
    
    localStorage.removeItem('localFileSyncSetup');
  }, []);

  // Generate sanitized filename
  const sanitizeFileName = useCallback((name: string): string => {
    return name
      .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 100) // Limit length
      + '.md'; // Add markdown extension
  }, []);

    // Create folder structure and save notes
  const syncNotes = useCallback(async () => {
    console.log('🔄 syncNotes called', {
      hasDirectoryHandle: !!directoryHandleRef.current,
      isSetup: isSetupRef.current,
      enabled: options.enabled,
      noteListsCount: noteLists.length,
      totalNotes: noteLists.reduce((total, list) => total + list.notes.length, 0)
    });

    if (!directoryHandleRef.current || !isSetupRef.current || !options.enabled) {
      console.log('❌ Sync aborted:', {
        hasDirectoryHandle: !!directoryHandleRef.current,
        isSetup: isSetupRef.current,
        enabled: options.enabled
      });
      return;
    }

    try {
      console.log('📁 Starting sync process...');
      
      // Log storage info
      const setupType = localStorage.getItem('localFileSyncSetup');
      if (setupType === 'opfs') {
                 console.log('💾 Syncing to: OPFS (Origin Private File System) - research-app-notes/');
         console.log('🔒 Note: OPFS files are stored in browser private storage');
         console.log('📍 To access files: Use the "Export Files" button in settings');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dirName = (directoryHandleRef.current as any)?.name || 'User-selected folder';
        console.log('💾 Syncing to: File System -', dirName + '/');
        console.log('📂 Note: Files are saved to your selected folder and can be accessed directly');
      }
      
      let syncedFiles = 0;

      for (const noteList of noteLists) {
        // Create a subfolder for each note list
        const folderName = sanitizeFileName(noteList.name).replace('.md', '');
        console.log(`📂 Processing noteList: ${noteList.name} (${noteList.notes.length} notes)`);

        // Save each note as a separate markdown file
        for (const note of noteList.notes) {
          const fileName = sanitizeFileName(note.title || 'Untitled Note');
          const fullFileName = `${folderName}_${fileName}`;
          
          // Create markdown content
          const markdownContent = `# ${note.title || 'Untitled Note'}

Created: ${new Date(note.createdAt).toLocaleDateString()}
Updated: ${new Date(note.updatedAt).toLocaleDateString()}
Topic: ${noteList.name}

---

${note.content}
`;

          try {
            console.log(`📝 Writing file: ${fullFileName}`);
            const fileHandle = await directoryHandleRef.current.getFileHandle(fullFileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(markdownContent);
            await writable.close();
            syncedFiles++;
            console.log(`✅ Successfully wrote: ${fullFileName}`);
          } catch (error) {
            console.error(`❌ Failed to sync note: ${fileName}`, error);
          }
        }
      }

      // Create index file with overview
      const indexContent = `# Research App Notes Export

Export Date: ${new Date().toISOString()}
Total Note Lists: ${noteLists.length}
Total Notes: ${noteLists.reduce((total, list) => total + list.notes.length, 0)}

## Note Lists

${noteLists.map(list => 
  `### ${list.name}
- Notes: ${list.notes.length}
- Created: ${new Date(list.createdAt).toLocaleDateString()}
- Updated: ${new Date(list.updatedAt).toLocaleDateString()}
`).join('\n')}

---

*This file is automatically generated by Research App*
`;

      try {
        const indexHandle = await directoryHandleRef.current.getFileHandle('README.md', { create: true });
        const writable = await indexHandle.createWritable();
        await writable.write(indexContent);
        await writable.close();
      } catch (error) {
        console.error('Failed to create index file:', error);
      }

      console.log(`🎉 Sync completed! ${syncedFiles} files written`);
      
      setStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        syncCount: prev.syncCount + 1,
        error: null
      }));

    } catch (error) {
      console.error('Sync failed:', error);
      setStatus(prev => ({
        ...prev,
        error: 'Sync failed. Please check directory permissions.'
      }));
    }
  }, [noteLists, options.enabled, sanitizeFileName]);

  // Debounced sync function
  const debouncedSync = useCallback(() => {
    console.log('⏳ debouncedSync called', {
      enabled: options.enabled,
      isSetup: isSetupRef.current,
      delay: options.syncDelay || 2000
    });

    if (!options.enabled || !isSetupRef.current) {
      console.log('⏭️ Debounced sync skipped');
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      console.log('⏰ Cleared previous sync timeout');
    }

    console.log(`⏲️ Setting sync timeout for ${options.syncDelay || 2000}ms`);
    syncTimeoutRef.current = setTimeout(() => {
      console.log('🚀 Sync timeout triggered, calling syncNotes');
      syncNotes();
    }, options.syncDelay || 2000);
  }, [syncNotes, options.enabled, options.syncDelay]);

  // Auto-sync when notes change
  useEffect(() => {
    console.log('📝 Notes changed, checking auto-sync', {
      enabled: options.enabled,
      isSetup: isSetupRef.current,
      noteListsLength: noteLists.length,
      shouldTrigger: options.enabled && isSetupRef.current && noteLists.length > 0
    });

    if (options.enabled && isSetupRef.current && noteLists.length > 0) {
      console.log('✅ Triggering debounced sync due to note changes');
      debouncedSync();
    } else {
      console.log('⏭️ Auto-sync not triggered');
    }
  }, [noteLists, debouncedSync, options.enabled]);

    // Auto-initialize OPFS if available, or check previous setup
  useEffect(() => {
    const initializeSync = async () => {
      const setupType = localStorage.getItem('localFileSyncSetup');
      const wasEnabled = localStorage.getItem('localFileSyncEnabled') === 'true';
      
      console.log('🔄 Auto-initialization check', {
        setupType,
        wasEnabled,
        isSupported: isSupported()
      });
      
      if (!wasEnabled || !isSupported()) {
        console.log('⏭️ Auto-initialization skipped');
        return;
      }

      // Auto-setup OPFS if available (persistent across sessions)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (setupType === 'opfs' || (!setupType && 'storage' in navigator && 'getDirectory' in (navigator.storage as any))) {
        console.log('🔧 Auto-initializing OPFS...');
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const opfsRoot = await (navigator.storage as any).getDirectory();
          const directoryHandle = await opfsRoot.getDirectoryHandle('research-app-notes', { create: true });
          
          directoryHandleRef.current = directoryHandle;
          isSetupRef.current = true;
          
          console.log('✅ Auto OPFS initialization successful');
          console.log('📁 Storage Location: OPFS (Origin Private File System)');
          console.log('📂 Directory: research-app-notes (browser private storage)');
          console.log('');
          console.log('🗂️ Physical location varies by browser:');
          console.log('   Chrome/Edge (macOS): ~/Library/Application Support/Google/Chrome/Default/File System/');
          console.log('   Safari (macOS): ~/Library/Safari/LocalStorage/');
          console.log('   Firefox (macOS): ~/Library/Application Support/Firefox/Profiles/*/storage/default/');
          console.log('⚠️  Note: These are private browser files, not directly accessible');
          console.log('');
          
          setStatus(prev => ({
            ...prev,
            isSetup: true,
            isEnabled: true,
            error: null
          }));

          localStorage.setItem('localFileSyncSetup', 'opfs');
          return;
        } catch (error) {
          console.warn('❌ Auto OPFS setup failed:', error);
        }
      }
      
      // Manual setup required for File System Access API
      if (setupType === 'manual') {
        console.log('⚠️ Manual setup required');
        setStatus(prev => ({
          ...prev,
          isSetup: false,
          error: 'Please re-setup sync directory (browser security requirement)'
        }));
      }
    };

    initializeSync();
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Manual sync function
  const manualSync = useCallback(async () => {
    if (isSetupRef.current) {
      await syncNotes();
    }
  }, [syncNotes]);

  return {
    status,
    isSupported: isSupported(),
    setupSync,
    disableSync,
    manualSync
  };
}; 