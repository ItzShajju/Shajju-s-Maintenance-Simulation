/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { XMarkIcon, BookOpenIcon, CpuChipIcon, WrenchScrewdriverIcon, TvIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#18181b]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-900/30 rounded-lg border border-cyan-800/50">
                <BookOpenIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white">Simulator User Guide</h2>
                <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Operational Manual V2.1</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Section 1: Getting Started */}
            <section>
                <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4 border-b border-zinc-800 pb-2">1. Initialization</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">1</span>
                            <div>
                                <h4 className="font-semibold text-zinc-200 text-sm">Select Fleet</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">Choose your target aircraft (B737NG, B747-8, B777-300ER, or B787-9). System logic adapts to the selected airframe.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">2</span>
                            <div>
                                <h4 className="font-semibold text-zinc-200 text-sm">Define Scenario</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">Enter a specific fault (e.g., "Left Engine Fire Loop Fault") or use the quick suggestion chips.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center justify-center">
                        <div className="text-center">
                            <CpuChipIcon className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                            <p className="text-xs text-zinc-500">The AI generates a unique initial state including cockpit controls, sensor logs, and maintenance tasks.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Dashboard Overview */}
            <section>
                <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4 border-b border-zinc-800 pb-2">2. The Simulation Dashboard</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-[#18181b] p-4 rounded-lg border border-zinc-700/50">
                        <div className="flex items-center space-x-2 mb-3 text-zinc-200 font-semibold">
                            <WrenchScrewdriverIcon className="w-4 h-4 text-cyan-500" />
                            <span>Overhead Panel</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                            The left side of the screen displays interactive cockpit controls grouped by system (ELEC, HYD, APU, etc.).
                        </p>
                        <ul className="text-xs text-zinc-500 list-disc list-inside space-y-1">
                            <li><strong className="text-zinc-300">Switches:</strong> Toggle system states (ON/OFF/AUTO).</li>
                            <li><strong className="text-zinc-300">Buttons:</strong> Momentary actions (Reset/Test).</li>
                            <li><strong className="text-zinc-300">Gauges:</strong> Real-time values with sensor jitter.</li>
                        </ul>
                    </div>

                    <div className="bg-[#18181b] p-4 rounded-lg border border-zinc-700/50">
                        <div className="flex items-center space-x-2 mb-3 text-zinc-200 font-semibold">
                            <TvIcon className="w-4 h-4 text-cyan-500" />
                            <span>Electronic Flight Bag (EFB)</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                            The right sidebar acts as your digital toolset with three modes:
                        </p>
                        <ul className="text-xs text-zinc-500 space-y-2">
                            <li className="flex items-center space-x-2">
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] uppercase border border-zinc-700">Monitor</span>
                                <span>View EICAS messages & Instructor feedback.</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] uppercase border border-zinc-700">Work Order</span>
                                <span>Interactive AMM Checklist.</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] uppercase border border-zinc-700">Tech Data</span>
                                <span>System schematics & reference text.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-[#18181b] p-4 rounded-lg border border-zinc-700/50 flex flex-col justify-center">
                        <div className="text-center space-y-2">
                            <div className="inline-flex space-x-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            </div>
                            <h4 className="text-sm font-bold text-zinc-300">System Feedback</h4>
                            <p className="text-xs text-zinc-500">
                                Every action triggers an AI simulation step. Watch for updates in the "Instructor Feedback" panel after toggling switches.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Section 3: Interpreting Results */}
             <section>
                <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4 border-b border-zinc-800 pb-2">3. Interpreting Results</h3>
                <div className="space-y-4">
                    <p className="text-sm text-zinc-400">The simulation tracks the aircraft state in real-time. Look at the status indicator in the top header:</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 bg-green-950/20 border border-green-900/50 p-3 rounded-lg flex items-start space-x-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-green-400">RESOLVED</h4>
                                <p className="text-xs text-zinc-400 mt-1">The fault has been cleared successfully. Logs indicate normal operation, and checklist items are verified.</p>
                            </div>
                        </div>

                        <div className="flex-1 bg-red-950/20 border border-red-900/50 p-3 rounded-lg flex items-start space-x-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-red-400">CRITICAL</h4>
                                <p className="text-xs text-zinc-400 mt-1">Incorrect actions have worsened the situation (e.g., overheating, bus isolation). Review Tech Data immediately.</p>
                            </div>
                        </div>

                        <div className="flex-1 bg-blue-950/20 border border-blue-900/50 p-3 rounded-lg flex items-start space-x-3">
                            <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0 mt-0.5"></div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-400">ACTIVE</h4>
                                <p className="text-xs text-zinc-400 mt-1">The scenario is ongoing. Continue troubleshooting using the Work Order steps.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#18181b] flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-zinc-100 text-zinc-900 hover:bg-white font-bold rounded-lg text-sm transition-colors"
            >
                Close Manual
            </button>
        </div>
      </div>
    </div>
  );
};