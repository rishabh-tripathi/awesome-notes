'use client';

import { useState, useEffect } from 'react';
import { NoteList } from '@/types';
import { useLocalFileSync } from '@/hooks/useLocalFileSync';

interface LocalFileSyncControlProps {
  noteLists: NoteList[];
}

export default function LocalFileSyncControl({ noteLists }: LocalFileSyncControlProps) {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const { status, isSupported, setupSync, disableSync, manualSync } = useLocalFileSync(noteLists, {
    enabled: syncEnabled,
    syncDelay: 3000 // 3 second delay after changes
  });

  // Load sync preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('localFileSyncEnabled') === 'true';
    setSyncEnabled(savedPreference);
  }, []);

  // Save sync preference to localStorage
  useEffect(() => {
    localStorage.setItem('localFileSyncEnabled', syncEnabled.toString());
  }, [syncEnabled]);

  const handleToggleSync = async () => {
    if (!syncEnabled) {
      // Enable sync
      const success = await setupSync();
      if (success) {
        setSyncEnabled(true);
      }
    } else {
      // Disable sync
      disableSync();
      setSyncEnabled(false);
    }
  };

  const handleSetupSync = async () => {
    const success = await setupSync();
    if (success) {
      setSyncEnabled(true);
    }
  };

  // Check if OPFS is available for persistent storage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasOPFS = 'storage' in navigator && 'getDirectory' in (navigator.storage as any);

  if (!isSupported) {
    return (
      <div className="bg-amber-500/10 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-200">Browser Not Supported</h3>
            <p className="text-xs text-amber-300 mt-1">
              Auto-sync requires Chrome 86+ or Edge 86+. Use the export feature instead.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            status.isEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'
          }`}>
            <svg className={`w-4 h-4 ${
              status.isEnabled ? 'text-green-400' : 'text-gray-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Local File Sync</h3>
            <p className="text-xs text-purple-300">
              {hasOPFS ? 'Auto-save notes (persistent storage)' : 'Auto-save notes to your computer'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {status.isSetup && status.isEnabled && (
            <button
              onClick={() => {
                console.log('🧪 Manual sync triggered from UI');
                manualSync();
              }}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs"
              title="Sync now"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          
          <button
            onClick={showDetails ? () => setShowDetails(false) : () => setShowDetails(true)}
            className="text-purple-300 hover:text-white transition-colors text-xs"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            status.isEnabled ? 'bg-green-400' : 'bg-gray-400'
          }`}></div>
          <span className="text-xs text-purple-200">
            {status.isSetup && status.isEnabled
              ? 'Sync Active'
              : status.isSetup
              ? 'Sync Disabled'
              : 'Choose Storage Method'
            }
          </span>
        </div>
        
        {status.lastSync && (
          <span className="text-xs text-purple-300">
            Last sync: {status.lastSync.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Error message */}
      {status.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
          <p className="text-xs text-red-300">{status.error}</p>
        </div>
      )}

      {/* Storage method explanation */}
      {!status.isSetup && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="text-xs font-medium text-blue-300 mb-2">💡 Storage Options:</h4>
          <div className="space-y-2 text-xs text-blue-200">
            {hasOPFS && (
              <div className="flex items-start space-x-2">
                <span className="text-blue-400">🔒</span>
                <div>
                  <div className="font-medium">Auto-Sync (Private)</div>
                  <div className="text-blue-300">Browser private storage, persistent, no setup needed</div>
                </div>
              </div>
            )}
            <div className="flex items-start space-x-2">
              <span className="text-green-400">📁</span>
              <div>
                <div className="font-medium">Choose Folder</div>
                <div className="text-blue-300">Save to your file system, directly accessible{hasOPFS ? ', requires re-setup after restart' : ''}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-2 flex-wrap gap-2">
        {!status.isSetup ? (
          <>
            {/* Auto-sync with OPFS (if available) */}
            {hasOPFS && (
              <button
                onClick={() => {
                  console.log('🧪 Setup OPFS sync triggered from UI');
                  handleSetupSync();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
                🔒 Auto-Sync (Private)
              </button>
            )}
            
            {/* Manual folder selection */}
            <button
              onClick={async () => {
                console.log('🧪 Setup folder sync triggered from UI');
                try {
                  if ('showDirectoryPicker' in window) {
                    // Store preference to force manual setup
                    localStorage.setItem('localFileSyncForceManual', 'true');
                    
                    const success = await setupSync();
                    if (success) {
                      setSyncEnabled(true);
                    }
                    
                    // Clear the force flag after setup
                    localStorage.removeItem('localFileSyncForceManual');
                  } else {
                    alert('❌ Folder selection not supported in this browser');
                  }
                } catch (error) {
                  localStorage.removeItem('localFileSyncForceManual');
                  if ((error as Error).name !== 'AbortError') {
                    console.error('Setup failed:', error);
                  }
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              📁 Choose Folder
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                console.log('🧪 Toggle sync triggered from UI');
                handleToggleSync();
              }}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                status.isEnabled
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {status.isEnabled ? 'Disable Sync' : 'Enable Sync'}
            </button>
            
            {/* Reset/Change folder button */}
            <button
              onClick={() => {
                console.log('🧪 Reset sync triggered from UI');
                disableSync();
              }}
              className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              title="Reset and choose different storage method"
            >
              🔄 Reset
            </button>
          </>
        )}
        
                 {/* Export OPFS files button */}
         {status.isSetup && status.isEnabled && localStorage.getItem('localFileSyncSetup') === 'opfs' && (
           <button
             onClick={async () => {
               console.log('📤 Exporting OPFS files to user folder...');
               try {
                 // Use File System Access API to let user choose export location
                 if ('showDirectoryPicker' in window) {
                   const exportDir = await window.showDirectoryPicker!({ mode: 'readwrite' });
                   
                   // Get OPFS directory
                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                   const opfsRoot = await (navigator.storage as any).getDirectory();
                   const notesDir = await opfsRoot.getDirectoryHandle('research-app-notes');
                   
                   let exportedCount = 0;
                   
                   // Copy all files from OPFS to user-selected directory
                   for await (const [name, handle] of notesDir.entries()) {
                     if (handle.kind === 'file') {
                       const file = await handle.getFile();
                       const content = await file.text();
                       
                       const newFileHandle = await exportDir.getFileHandle(name, { create: true });
                       const writable = await newFileHandle.createWritable();
                       await writable.write(content);
                       await writable.close();
                       
                       exportedCount++;
                       console.log(`📄 Exported: ${name}`);
                     }
                   }
                   
                   alert(`✅ Successfully exported ${exportedCount} files to your chosen folder!`);
                 } else {
                   alert('❌ File export not supported in this browser');
                 }
               } catch (error) {
                 console.error('❌ Export failed:', error);
                 alert('❌ Export failed. Check console for details.');
               }
             }}
             className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs"
             title="Export OPFS files to accessible folder"
           >
             📤 Export Files
           </button>
         )}

         {/* Test button for debugging */}
         <button
           onClick={async () => {
             console.log('🧪 Testing OPFS access...');
             try {
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               if ('storage' in navigator && 'getDirectory' in (navigator.storage as any)) {
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 const opfsRoot = await (navigator.storage as any).getDirectory();
                 console.log('✅ OPFS access test successful', opfsRoot);
                 
                 // List files in OPFS
                 try {
                   const notesDir = await opfsRoot.getDirectoryHandle('research-app-notes');
                   const files = [];
                   for await (const [name, handle] of notesDir.entries()) {
                     if (handle.kind === 'file') {
                       const file = await handle.getFile();
                       files.push({ name, size: file.size, modified: new Date(file.lastModified) });
                     }
                   }
                   console.log('📁 OPFS Files:', files);
                   alert(`✅ OPFS test successful! Found ${files.length} files. Check console for details.`);
                 } catch {
                   alert('✅ OPFS access successful but no notes directory found yet.');
                 }
               } else {
                 console.log('❌ OPFS not available');
                 alert('❌ OPFS not available in this browser');
               }
             } catch (error) {
               console.error('❌ OPFS access test failed:', error);
               alert('❌ OPFS access test failed! Check console for details.');
             }
           }}
           className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-xs"
         >
           🧪 Test OPFS
         </button>
      </div>

      {/* Details section */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-purple-300">Status:</span>
              <span className="ml-2 text-white">
                {status.isEnabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="text-purple-300">Syncs:</span>
              <span className="ml-2 text-white">{status.syncCount}</span>
            </div>
            <div>
              <span className="text-purple-300">Notes:</span>
              <span className="ml-2 text-white">
                {noteLists.reduce((total, list) => total + list.notes.length, 0)}
              </span>
            </div>
            <div>
              <span className="text-purple-300">Topics:</span>
              <span className="ml-2 text-white">{noteLists.length}</span>
            </div>
          </div>

          {/* Storage Location Info */}
          {status.isSetup && (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-xs font-medium text-blue-300 mb-2">📁 Storage Location:</h4>
              <div className="text-xs text-blue-200 space-y-1">
                {(() => {
                  const setupType = localStorage.getItem('localFileSyncSetup');
                  if (setupType === 'opfs') {
                    return (
                      <>
                        <div>💾 <strong>OPFS (Browser Private Storage)</strong></div>
                        <div>📂 Directory: research-app-notes/</div>
                        <div>🔒 Files stored in browser&apos;s private file system</div>
                        <div>⚡ Persistent across browser sessions</div>
                        <div className="mt-2 text-xs text-blue-300">
                          <details>
                            <summary className="cursor-pointer hover:text-blue-100">📍 Physical Location (Click to expand)</summary>
                            <div className="mt-2 space-y-1 text-blue-200 bg-blue-900/20 p-2 rounded">
                              <div><strong>macOS Chrome/Edge:</strong></div>
                              <div className="font-mono text-xs break-all">
                                ~/Library/Application Support/Google/Chrome/Default/File System/
                              </div>
                              <div className="mt-1"><strong>macOS Safari:</strong></div>
                              <div className="font-mono text-xs break-all">
                                ~/Library/Safari/LocalStorage/
                              </div>
                              <div className="mt-2 text-yellow-300">
                                ⚠️ These files are not meant to be accessed directly and may be in binary format
                              </div>
                            </div>
                          </details>
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <div>💾 <strong>User-Selected Folder</strong></div>
                        <div>📂 Directory: Your chosen folder</div>
                        <div>📁 Files accessible in your file system</div>
                        <div>⚠️ Requires re-setup after browser restart</div>
                      </>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {/* Debug information */}
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h4 className="text-xs font-medium text-red-300 mb-2">Debug Info:</h4>
            <div className="text-xs text-red-200 space-y-1">
              <div>Setup: {status.isSetup ? '✅' : '❌'}</div>
              <div>Enabled: {status.isEnabled ? '✅' : '❌'}</div>
              <div>Supported: {isSupported ? '✅' : '❌'}</div>
              <div>OPFS: {hasOPFS ? '✅' : '❌'}</div>
              <div>Note Lists: {noteLists.length}</div>
              <div>Total Notes: {noteLists.reduce((total, list) => total + list.notes.length, 0)}</div>
              <div>Sync Count: {status.syncCount}</div>
              {status.lastSync && <div>Last Sync: {status.lastSync.toLocaleTimeString()}</div>}
              {status.error && <div>Error: {status.error}</div>}
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-white/5 rounded-lg">
            <h4 className="text-xs font-medium text-white mb-2">How it works:</h4>
            <ul className="text-xs text-purple-200 space-y-1">
              <li>• Automatically saves notes as Markdown files</li>
              <li>• Creates folders for each topic</li>
              <li>• Syncs 3 seconds after you stop typing</li>
              <li>• Works entirely offline on your computer</li>
              {hasOPFS ? (
                <li>• ✨ Uses persistent storage (no re-setup needed)</li>
              ) : (
                <li>• Folder selection required after browser restart</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 