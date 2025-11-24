/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { AcademicCapIcon, BoltIcon } from '@heroicons/react/24/outline';

export const Hero: React.FC = () => {
  return (
    <div className="relative text-center max-w-5xl mx-auto px-4 pt-12 pb-8">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-800/50 text-cyan-400 text-xs font-mono tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>MAINTENANCE SIMULATION FOR SHAJJU</span>
        </div>

        <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-6">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-teal-400">
            Boeing Fleet
          </span>
          <span className="block mt-2">Maintenance Training</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          Prepare crews virtually to operate on Boeing aircraft safely, rapidly, and with precision.
          Experience high-fidelity scenarios for B737NG, B747-8, B777, and B787 in a risk-free environment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-12 text-left">
             <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/50 transition-colors group">
                <BoltIcon className="w-6 h-6 text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-zinc-200 font-semibold mb-1">Real-time Feedback</h3>
                <p className="text-zinc-500 text-sm">AI-driven analysis of maintenance actions and troubleshooting.</p>
             </div>
             <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/50 transition-colors group">
                <AcademicCapIcon className="w-6 h-6 text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-zinc-200 font-semibold mb-1">Standard Compliance</h3>
                <p className="text-zinc-500 text-sm">Training aligned with AMM procedures and Boeing standards.</p>
             </div>
        </div>
      </div>
    </div>
  );
};